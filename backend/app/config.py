"""
Application Configuration
Centralized configuration management using Pydantic Settings
"""
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    DATABASE_HOST: str = "localhost"
    DATABASE_PORT: int = 5432
    DATABASE_NAME: str = "referral"
    DATABASE_USER: str = "postgres"
    DATABASE_PASSWORD: str = "password"
    
    # JWT
    JWT_SECRET_KEY: str = "change-this-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Application
    APP_NAME: str = "TeamLease EdTech Referral Portal"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # CORS - Production + Local development
    CORS_ORIGINS: str = "https://devreferral.tledtech.com,http://localhost:3001,http://localhost:3000,http://localhost:80"
    
    # SMTP Email Configuration (ZeptoMail)
    SMTP_HOST: str = "smtp.zeptomail.in"
    SMTP_PORT: int = 587
    SMTP_USER: str = "emailapikey"
    SMTP_PASSWORD: str = ""
    SMTP_USE_TLS: bool = True
    EMAIL_FROM: str = "noreply@teamleaseedtech.com"
    EMAIL_FROM_NAME: str = "TeamLease EdTech"
    
    # Frontend URL for email links
    FRONTEND_URL: str = "https://devreferral.tledtech.com"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    @property
    def DATABASE_URL(self) -> str:
        """Construct database URL with proper encoding"""
        from urllib.parse import quote_plus
        # URL-encode the password to handle special characters like @
        encoded_password = quote_plus(self.DATABASE_PASSWORD)
        return f"postgresql://{self.DATABASE_USER}:{encoded_password}@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8-sig"
        case_sensitive = True
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()

