.PHONY: install run dev
install:
\tpython -m venv .venv && ./.venv/bin/pip install -U pip && ./.venv/bin/pip install -r requirements.txt
run:
\t./.venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
dev:
\tuvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
