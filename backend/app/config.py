"""Application configuration — reads from .env file."""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # JWT Secret & Expiration
    secret_key: str = "dev-secret-key-please-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480

    # Database
    database_url: str = "sqlite:///./mineguard.db"

    # Seed Demo Data
    seed_demo_data: bool = True

    # CORS Allowed Origins
    allowed_origins: str = "http://localhost:5173,http://localhost:3000,http://localhost:49407,http://127.0.0.1:5173,http://127.0.0.1:49407"

    # Notifications (Optional Credentials)
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    sms_api_key: str = ""
    sms_provider_url: str = ""

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip() and o.strip() != "*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
