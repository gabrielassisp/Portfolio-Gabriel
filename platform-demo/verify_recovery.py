"""Integration check: repeat ingestion, then fail within a transaction."""
import psycopg2
from ingest import ingest


def snapshot():
    with psycopg2.connect('') as conn,conn.cursor() as cur:
        cur.execute("SELECT count(*),md5(string_agg(source||record_id||payload::text,'|' ORDER BY seq)) FROM bronze.raw_records")
        return cur.fetchone()


baseline=snapshot()
ingest()
assert snapshot()==baseline,'Repeated snapshot changed business content or row count'
try:ingest(fail_after=100)
except RuntimeError:pass
else:raise AssertionError('Expected injected failure')
assert snapshot()==baseline,'Failed ingestion changed the last successful snapshot'
with psycopg2.connect('') as conn,conn.cursor() as cur:
    cur.execute("SELECT status FROM ops.runs ORDER BY started_at DESC LIMIT 1")
    assert cur.fetchone()[0]=='failed'
print('PASS: repeat ingestion stable; injected failure rolled back; failure persisted in history.')
