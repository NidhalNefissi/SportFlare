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
