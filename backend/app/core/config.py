from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    APP_DEBUG: bool = True

    DATABASE_URL: str = "sqlite+aiosqlite:///./data/incidents.db"

    # Hindsight long-term memory
    HINDSIGHT_BASE_URL: str = "http://localhost:8888"
    HINDSIGHT_API_KEY: str = ""
    HINDSIGHT_BANK_ID: str = "incident-response-agent"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",  # silently ignore unknown env vars added in later phases
    )


settings = Settings()
