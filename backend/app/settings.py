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
