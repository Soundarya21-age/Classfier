from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./gma_classifier.db"
    FIREBASE_CREDENTIALS_PATH: str = "./serviceAccountKey.json"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key")
    UPLOADS_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 1_500_000_000  # 1.5GB in bytes
    
    class Config:
        env_file = ".env"

settings = Settings()
