import sqlite3
from contextlib import closing
from pathlib import Path
import tempfile
import json
import threading
import unittest
import urllib.request
from http.server import ThreadingHTTPServer
from run_demo import fixtures, run, validate_and_transform
from monitor import handler


class DemoTests(unittest.TestCase):
    def test_fixture_rejection_and_deduplication(self):
        silver, rejected, duplicates = validate_and_transform(fixtures())
        self.assertEqual((len(silver), len(rejected), duplicates), (120, 2, 3))
        self.assertEqual(len({row[0] for row in silver}), 120)

    def test_repeat_keeps_snapshot_and_preserves_history(self):
        with tempfile.TemporaryDirectory() as tmp:
            run(tmp)
            run(tmp)
            with closing(sqlite3.connect(Path(tmp) / 'demo.sqlite')) as conn:
                self.assertEqual(conn.execute('SELECT count(*) FROM silver').fetchone()[0], 120)
                self.assertEqual(conn.execute('SELECT count(*) FROM runs WHERE status="success"').fetchone()[0], 2)
                self.assertEqual(conn.execute('SELECT sum(deals) FROM gold').fetchone()[0], 120)

    def test_bad_input_preserves_previous_snapshot_and_records_failure(self):
        with tempfile.TemporaryDirectory() as tmp:
            run(tmp)
            with self.assertRaises(ValueError):
                run(tmp, rows=[dict(id='', amount='NaN', region='Sul', stage='won')])
            with closing(sqlite3.connect(Path(tmp) / 'demo.sqlite')) as conn:
                self.assertEqual(conn.execute('SELECT count(*) FROM silver').fetchone()[0], 120)
                self.assertEqual(conn.execute('SELECT count(*) FROM runs WHERE status="failed"').fetchone()[0], 1)

    def test_monitor_reads_persisted_run(self):
        with tempfile.TemporaryDirectory() as tmp:
            run(tmp)
            server = ThreadingHTTPServer(('127.0.0.1', 0), handler(Path(tmp) / 'demo.sqlite'))
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                with urllib.request.urlopen(f'http://127.0.0.1:{server.server_port}/api/runs') as response:
                    history = json.load(response)
                self.assertEqual(history[0]['status'], 'success')
                self.assertEqual(history[0]['metrics']['silver_rows'], 120)
            finally:
                server.shutdown()
                server.server_close()
                thread.join()


if __name__ == '__main__':
    unittest.main()
