#!/usr/bin/env bash
set -euo pipefail

echo "==> Creating backend skeleton"
mkdir -p backend/app

cat > backend/app/settings.py << 'PY'
from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    env: str = Field(default="dev")
    app_name: str = Field(default="SportFlare API")
    version: str = Field(default="0.1.0")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
PY

cat > backend/app/main.py << 'PY'
from fastapi import FastAPI
from .settings import settings

def create_app() -> FastAPI:
    application = FastAPI(title=settings.app_name, version=settings.version)

    @application.get("/healthz")
    def healthz() -> dict[str, str]:
        return {"status": "ok"}

    @application.get("/readyz")
    async def readyz() -> dict[str, str]:
        return {"status": "ok"}

    @application.get("/")
    def root() -> dict[str, str]:
        return {"service": settings.app_name, "version": settings.version}

    return application

app = create_app()
PY

cat > requirements.txt << 'TXT'
fastapi==0.111.0
uvicorn[standard]==0.30.0
pydantic==2.7.4
pydantic-settings==2.3.1
python-dotenv==1.0.1
TXT

cat > Dockerfile << 'DOCKER'
FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt
COPY backend /app/backend
EXPOSE 8080
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8080"]
DOCKER

cat > Makefile << 'MAKE'
.PHONY: install run dev
install:
\tpython -m venv .venv && ./.venv/bin/pip install -U pip && ./.venv/bin/pip install -r requirements.txt
run:
\t./.venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
dev:
\tuvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
MAKE

cat > .gitignore << 'GIT'
.venv/
__pycache__/
*.pyc
.env
.DS_Store
GIT

cat > README.md << 'MD'
# SportFlare

Minimal FastAPI scaffold with health endpoints.

- Start locally:
  - make install
  - make run
- Health:
  - GET /healthz
  - GET /readyz
MD

echo "==> Installing deps and running a quick check"
python -m venv .venv
./.venv/bin/pip install -U pip >/dev/null
./.venv/bin/pip install -r requirements.txt >/dev/null
nohup ./.venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 >/tmp/sf.out 2>&1 & disown || true
sleep 2
curl -fsS http://127.0.0.1:8000/healthz || true

echo "==> Committing and pushing"
git add -A
git commit -m "feat: initial FastAPI backend scaffold with health endpoints" || true
git push origin master

echo "Done. Repo updated on master."
