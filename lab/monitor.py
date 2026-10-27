"""Leitura do histórico do laboratório, sem endpoints que executam jobs."""
import argparse
from contextlib import closing
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import sqlite3

PAGE = '''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Laboratório público · Histórico</title><style>body{background:#0b0c10;color:#eee;font:15px system-ui;max-width:1000px;margin:50px auto;padding:20px}h1{color:#fcc717}p{color:#aaa;line-height:1.8}button{background:#fcc717;border:0;border-radius:7px;padding:12px;cursor:pointer}pre{background:#161821;border:1px solid #333;padding:20px;border-radius:10px;overflow:auto}</style><h1>Histórico do laboratório</h1><p>Dados sintéticos. Este servidor apenas consulta o SQLite criado pelo laboratório; não se conecta à produção nem inicia execuções. Atualize após rodar o script no terminal.</p><button id="refresh">Atualizar histórico</button><pre id="history" aria-live="polite"></pre><script>async function refresh(){const box=document.getElementById('history');try{const r=await fetch('/api/runs');if(!r.ok)throw Error();box.textContent=JSON.stringify(await r.json(),null,2)}catch{box.textContent='Não foi possível ler o histórico.'}}document.getElementById('refresh').onclick=refresh;refresh();</script></html>'''


def handler(database):
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path == '/':
                data, mime = PAGE.encode(), 'text/html; charset=utf-8'
            elif self.path == '/api/runs':
                if not database.exists():
                    rows = []
                else:
                    with closing(sqlite3.connect(database.resolve().as_uri() + '?mode=ro', uri=True)) as conn:
                        conn.row_factory = sqlite3.Row
                        rows = [dict(row) for row in conn.execute('SELECT * FROM runs ORDER BY started_at DESC LIMIT 20')]
                    for row in rows:
                        row['metrics'] = json.loads(row['metrics'])
                data, mime = json.dumps(rows).encode(), 'application/json'
            else:
                self.send_error(404)
                return
            self.send_response(200)
            self.send_header('Content-Type', mime)
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
    return Handler


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', default='.demo-output')
    parser.add_argument('--port', type=int, default=8088)
    args = parser.parse_args()
    print(f'Laboratório: http://127.0.0.1:{args.port}', flush=True)
    ThreadingHTTPServer(('127.0.0.1', args.port), handler(Path(args.output) / 'demo.sqlite')).serve_forever()
