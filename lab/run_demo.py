"""Laboratório sintético independente da stack de produção. Só usa a biblioteca padrão."""
import argparse
import csv
from contextlib import closing
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import json
from pathlib import Path
import random
import sqlite3
import time
import uuid


def fixtures():
    rng = random.Random(42)
    rows = [dict(id=str(i), region=['Norte', 'Sul', 'Leste', 'Oeste'][i % 4],
                 amount=f'{rng.randint(1000, 50000) / 100:.2f}',
                 stage='won' if i % 3 else 'open') for i in range(1, 121)]
    return rows + rows[:3] + [dict(id='', region='Sul', amount='20', stage='won'),
                              dict(id='121', region='Sul', amount='inválido', stage='won')]


def validate_and_transform(rows):
    valid, rejected, duplicate_ids = {}, [], 0
    for row in rows:
        try:
            ident = str(row.get('id', '')).strip()
            region = str(row.get('region', '')).strip().title()
            stage = str(row.get('stage', '')).strip().lower()
            amount = Decimal(str(row.get('amount', '')))
            if not ident or not region or stage not in {'won', 'open'} or not amount.is_finite() or amount < 0:
                raise ValueError('Campos obrigatórios ou domínio inválido')
            cents = int((amount * 100).quantize(Decimal('1')))
            if ident in valid:
                duplicate_ids += 1
            valid[ident] = (ident, region, cents, stage)
        except (ValueError, InvalidOperation):
            rejected.append(dict(row))
    if not valid:
        raise ValueError('A carga não contém registros válidos')
    return list(valid.values()), rejected, duplicate_ids


def run(output, rows=None):
    output = Path(output)
    output.mkdir(parents=True, exist_ok=True)
    source = fixtures() if rows is None else rows
    started = datetime.now(timezone.utc).isoformat()
    clock = time.perf_counter()
    ident = str(uuid.uuid4())
    database = output / 'demo.sqlite'
    with closing(sqlite3.connect(database)) as conn:
        conn.execute('CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, started_at TEXT, status TEXT, metrics TEXT)')
        conn.execute('INSERT INTO runs VALUES (?, ?, ?, ?)', (ident, started, 'running', '{}'))
        conn.commit()
        try:
            transformed, rejected, duplicates = validate_and_transform(source)
            with conn:
                conn.execute('CREATE TABLE IF NOT EXISTS bronze (payload TEXT)')
                conn.execute('CREATE TABLE IF NOT EXISTS silver (id TEXT PRIMARY KEY, region TEXT, amount_cents INTEGER, stage TEXT)')
                conn.execute('DELETE FROM bronze')
                conn.execute('DELETE FROM silver')
                conn.executemany('INSERT INTO bronze VALUES (?)', [(json.dumps(row),) for row in source])
                conn.executemany('INSERT INTO silver VALUES (?, ?, ?, ?)', transformed)
                conn.execute("CREATE VIEW IF NOT EXISTS gold AS SELECT region, count(*) AS deals, sum(CASE WHEN stage='won' THEN amount_cents ELSE 0 END) AS revenue_cents FROM silver GROUP BY region")
                metrics = dict(input_rows=len(source), silver_rows=len(transformed),
                               rejected_rows=len(rejected), duplicate_ids=duplicates,
                               elapsed_seconds=round(time.perf_counter() - clock, 4))
                conn.execute('UPDATE runs SET status=?, metrics=? WHERE id=?', ('success', json.dumps(metrics), ident))
            gold = conn.execute('SELECT region, deals, revenue_cents FROM gold ORDER BY region').fetchall()
            with (output / 'gold.csv').open('w', newline='', encoding='utf-8') as handle:
                writer = csv.writer(handle)
                writer.writerow(['region', 'deals', 'revenue_cents'])
                writer.writerows(gold)
            (output / 'last_run.json').write_text(json.dumps(dict(id=ident, status='success', **metrics), indent=2), encoding='utf-8')
            return metrics
        except Exception as error:
            conn.rollback()
            with conn:
                conn.execute('UPDATE runs SET status=?, metrics=? WHERE id=?', ('failed', json.dumps({'error':type(error).__name__}), ident))
            raise


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', default='.demo-output')
    args = parser.parse_args()
    print(json.dumps(run(args.output), indent=2))
