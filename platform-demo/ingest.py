"""Mock-only ingestion. No business system or external API is contacted."""
import argparse
from datetime import date, timedelta
import json
import uuid
import psycopg2
from psycopg2.extras import Json, execute_values


def fixtures():
    rows = []
    def emit(source, ident, **payload):
        payload.setdefault('business_date', '2026-01-01')
        payload.setdefault('version', 1)
        rows.append((source, ident, payload))
    for i in range(400):
        emit('deals', f'd{i:04}', owner_id=f'o{i%8:02}', amount_cents=10000+i*100,
             status='won' if i%3 else 'open', business_date=str(date(2026,1,1)+timedelta(days=i%30)))
    for i in range(3):
        emit('deals', f'd{i:04}', owner_id=f'o{i%8:02}', amount_cents=20000,
             status='won', version=2)
    emit('deals', '', owner_id='o00', amount_cents=100, status='won')
    emit('deals', 'd9999', owner_id='o00', amount_cents=-10, status='won')
    for i in range(800):
        emit('history', f'h{i:04}', deal_id=f'd{i%400:04}', stage='qualified')
    for i in range(5):
        emit('history', f'h{i:04}', deal_id=f'd{i%400:04}', stage='won', version=2)
    for i in range(600):
        emit('chats', f'c{i:04}', deal_id=f'd{i%400:04}', messages=1+i%20,
             business_date=str(date(2026,1,1)+timedelta(days=i%30)))
    for i in range(2):
        emit('chats', f'c{i:04}', deal_id=f'd{i:04}', messages=30, version=2)
    emit('chats', 'c9999', deal_id='d0000', messages=-1)
    for i in range(30):
        emit('ads', f'a{i:04}', spend_cents=5000+i*100, leads=5+i%7,
             business_date=str(date(2026,1,1)+timedelta(days=i)))
    emit('ads', 'a9999', spend_cents=-1, leads=1)
    return rows


def ingest(fail_after=None):
    ident = str(uuid.uuid4())
    with psycopg2.connect('') as conn:
        with conn.cursor() as cur:
            cur.execute('CREATE SCHEMA IF NOT EXISTS ops; CREATE SCHEMA IF NOT EXISTS bronze')
            cur.execute('''CREATE TABLE IF NOT EXISTS ops.runs (
                run_id uuid PRIMARY KEY, started_at timestamptz DEFAULT now(),
                finished_at timestamptz, status text NOT NULL, input_rows integer)''')
            cur.execute('''CREATE TABLE IF NOT EXISTS bronze.raw_records (
                seq bigserial PRIMARY KEY, source text NOT NULL, record_id text NOT NULL,
                payload jsonb NOT NULL, run_id uuid NOT NULL, loaded_at timestamptz DEFAULT now())''')
            cur.execute("INSERT INTO ops.runs(run_id,status) VALUES (%s,'running')",(ident,))
        conn.commit()
        rows = fixtures()
        try:
            with conn.cursor() as cur:
                cur.execute('TRUNCATE bronze.raw_records RESTART IDENTITY')
                selected = rows if fail_after is None else rows[:fail_after]
                execute_values(cur, 'INSERT INTO bronze.raw_records(source,record_id,payload,run_id) VALUES %s',
                               [(s,k,Json(p),ident) for s,k,p in selected])
                if fail_after is not None:
                    raise RuntimeError('Injected failure: rollback demonstration')
                cur.execute("UPDATE ops.runs SET status='success',input_rows=%s,finished_at=now() WHERE run_id=%s",(len(rows),ident))
            conn.commit()
        except Exception:
            conn.rollback()
            with conn.cursor() as cur:
                cur.execute("UPDATE ops.runs SET status='failed',finished_at=now() WHERE run_id=%s",(ident,))
            conn.commit()
            raise
    return dict(run_id=ident,input_rows=len(rows),synthetic=True)


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--fail-after',type=int)
    print(json.dumps(ingest(p.parse_args().fail_after)))
