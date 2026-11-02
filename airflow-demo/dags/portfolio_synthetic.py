"""Independent public example: tiny synthetic payloads, no business API or secrets."""
from datetime import timedelta
import json

import pendulum
from airflow.decorators import dag, task


@dag(schedule=None, start_date=pendulum.datetime(2026, 1, 1, tz="UTC"),
     catchup=False, max_active_runs=1, default_args={"retries": 1, "retry_delay": timedelta(seconds=5)},
     tags=["portfolio", "synthetic"])
def portfolio_synthetic():
    @task
    def extract(source):
        return [{"id": f"{source}-{i}", "source": source, "version": 1} for i in range(10)]

    @task
    def history(deals):
        return [{"id": f"event-{row['id']}", "deal_id": row["id"]} for row in deals]

    @task
    def validate(chats, deals, ads, events):
        for records in (chats, deals, ads, events):
            ids = [row["id"] for row in records]
            if not records or len(ids) != len(set(ids)):
                raise ValueError("Empty source or duplicate key")
        if any(event["deal_id"] not in {row["id"] for row in deals} for event in events):
            raise ValueError("History references an unknown deal")
        return {"synthetic": True, "rows": sum(map(len, (chats, deals, ads, events))),
                "sources": 4, "status": "validated"}

    @task
    def publish(report):
        print(json.dumps(report, sort_keys=True))
        return report

    chats = extract.override(task_id="extract_chats")("chats")
    deals = extract.override(task_id="extract_deals")("deals")
    ads = extract.override(task_id="extract_ads")("ads")
    events = history(deals)
    # All three source tasks must succeed before the history task can start.
    chats >> events
    ads >> events
    publish(validate(chats, deals, ads, events))


portfolio_synthetic()
