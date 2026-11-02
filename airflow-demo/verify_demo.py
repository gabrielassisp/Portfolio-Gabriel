"""Import and execute the independent DAG using Airflow's local test runner."""
from pathlib import Path
from airflow.models import DagBag
from airflow.utils.state import DagRunState

bag = DagBag(dag_folder=str(Path(__file__).parent / "dags"), include_examples=False)
assert not bag.import_errors, bag.import_errors
dag = bag.get_dag("portfolio_synthetic")
assert dag is not None
assert len(dag.tasks) == 6
assert dag.get_task("history").upstream_task_ids == {"extract_chats", "extract_deals", "extract_ads"}

validate = dag.get_task("validate").python_callable
row = {"id": "d1"}
try:
    validate([row, row], [row], [row], [{"id": "e1", "deal_id": "d1"}])
except ValueError:
    pass
else:
    raise AssertionError("Duplicate key was not rejected")
try:
    validate([row], [row], [row], [{"id": "e1", "deal_id": "missing"}])
except ValueError:
    pass
else:
    raise AssertionError("Orphan history was not rejected")

run = dag.test()
assert run.state == DagRunState.SUCCESS, run.state
result = run.get_task_instance("publish").xcom_pull(task_ids="publish")
assert result == {"synthetic": True, "rows": 40, "sources": 4, "status": "validated"}, result
print("PASS: DagBag import; six tasks; duplicate/orphan rejection; dag.test(); 40 synthetic records")
