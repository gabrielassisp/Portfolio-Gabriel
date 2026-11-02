import argparse
import json
import shutil
from pathlib import Path
import subprocess
import time
import psycopg2
from ingest import ingest


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--full-refresh',action='store_true');args=parser.parse_args()
    clock=time.perf_counter()
    report=ingest()
    output=Path('artifacts')/report['run_id'];output.mkdir(parents=True,exist_ok=False)
    flags=['--project-dir','dbt','--profiles-dir','dbt','--target-path',str(output.resolve()/'dbt-target'),
           '--log-path',str(output.resolve()/'dbt-logs')]
    report['status']='running'
    try:
        subprocess.run(['dbt','--no-use-colors','build']+flags+(['--full-refresh'] if args.full_refresh else []),check=True,timeout=180)
        shutil.copyfile(output/'dbt-target/run_results.json', output/'dbt-target/build_results.json')
        build=json.loads((output/'dbt-target/build_results.json').read_text())
        report['dbt_models']=sum(r['unique_id'].startswith('model.') and r['status']=='success' for r in build['results'])
        report['dbt_tests_passed']=sum(r['unique_id'].startswith('test.') and r['status']=='pass' for r in build['results'])
        subprocess.run(['dbt','--no-use-colors','docs','generate']+flags,check=True,timeout=120)
        with psycopg2.connect('') as conn,conn.cursor() as cur:
            report['rows']={}
            for schema,table in [('bronze','raw_records'),('silver','silver_deals'),('silver','silver_history'),
                                 ('silver','silver_chats'),('silver','silver_ads'),('quality','rejected_records')]:
                cur.execute(f'SELECT count(*) FROM {schema}.{table}')
                report['rows'][schema+'.'+table]=cur.fetchone()[0]
            cur.execute('SELECT count(*) FROM gold.fct_deals');report['fact_rows']=cur.fetchone()[0]
        report['status']='success'
    except Exception as error:
        report.update(status='failed',error_type=type(error).__name__)
        raise
    finally:
        report['elapsed_seconds']=round(time.perf_counter()-clock,3)
        (output/'run.json').write_text(json.dumps(report,indent=2))
        print(json.dumps(report,indent=2))


if __name__=='__main__':main()
