"""End-to-end proof of inserts, updates, replays and older-version protection."""
import json
from pathlib import Path
import subprocess
import psycopg2
from ingest import fixtures,ingest


def state():
    with psycopg2.connect('') as conn,conn.cursor() as cur:
        cur.execute('SELECT count(*) FROM gold.fct_deals');count=cur.fetchone()[0]
        cur.execute("SELECT amount_cents,source_version FROM gold.fct_deals WHERE deal_id='d0001'")
        return count,cur.fetchone()


def transform():
    subprocess.run(['dbt','--no-use-colors','run','--project-dir','dbt','--profiles-dir','dbt',
                    '--target-path','artifacts/incremental-target','--log-path','artifacts/incremental-logs',
                    '--select','stg_records','silver_deals','dim_owners','fct_deals','daily_metrics'],check=True,timeout=120)


assert state()[0]==400,'Start with a fresh baseline; use run_pipeline.py --full-refresh if upgrading'
rows=fixtures()+[
    ('deals','d0001',dict(owner_id='o01',amount_cents=77700,status='won',business_date='2026-01-02',version=3)),
    ('deals','d0400',dict(owner_id='o00',amount_cents=12300,status='open',business_date='2026-01-03',version=1))]
ingest(rows=rows);transform()
assert state()==(401,(77700,3)),'Insert/update did not reach Gold'
ingest(rows=rows);transform()
assert state()==(401,(77700,3)),'Repeated batch duplicated or changed results'
ingest(rows=fixtures());transform()
assert state()==(401,(77700,3)),'Older version overwrote Gold or absent key was deleted'
subprocess.run(['dbt','--no-use-colors','test','--project-dir','dbt','--profiles-dir','dbt',
                '--target-path','artifacts/incremental-target','--log-path','artifacts/incremental-logs',
                '--select','fct_deals'],check=True,timeout=120)
report=dict(status='success',baseline_rows=400,after_delta_rows=401,updated_amount_cents=77700,
            updated_version=3,replay_without_duplicates=True,older_version_ignored=True,
            missing_key_preserved=True,strategy='dbt incremental delete+insert; unique_key=deal_id')
Path('artifacts/incremental-check.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
