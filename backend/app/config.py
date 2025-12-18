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
    
    # SMTP Email Configuration (ZeptoMail for teamleaseedtech.com)
    SMTP_HOST: str = "smtp.zeptomail.in"
    SMTP_PORT: int = 587
    SMTP_USER: str = "emailapikey"
    SMTP_PASSWORD: str = "Zoho-enczapikey PHtE6r0PRum52jJ8+hMH4qC9FpagMYspq+MzfwkUtY5HDaIHGE0Hqoh4kjKyoh5+BvFGFKTNzdptuLibseKNIzztMWhMX2qyqK3sx/VYSPOZsbq6x00csFwdd03fVYDndtJt0izevdnSNA=="
    SMTP_USE_TLS: bool = True
    EMAIL_FROM: str = "noreply@teamleaseedtech.com"
    EMAIL_FROM_NAME: str = "TeamLease EdTech"
    
    # Frontend URL for email links
    FRONTEND_URL: str = "https://devreferral.tledtech.com"
    
    # CRM Integration (Digivarsity)
    CRM_BASE_URL: str = "https://uatcrmapi.digivarsity.com"
    CRM_SESSION_TOKEN: str = "KS3B3MephTVmLVKorFWCRECexRwI1gZ9iiGXxM02Xsy1bhTP5Arc49nU0i0E"
    CRM_BEARER_TOKEN: str = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMzEyYjExNzk0NTU0NDI2NTY5NTAzNTgyMGFjMTgzOTY0YjA1OTZhMTBkNjM3NTBmMTYwZjc2N2JkYjk3MDlkOTFmMDdkMmE3OWViM2QxYzgiLCJpYXQiOjE3NjYwNjMwNDQuNzkwNjk5LCJuYmYiOjE3NjYwNjMwNDQuNzkwNzAyLCJleHAiOjE3NjYwOTkwNDQuNzgyNDY0LCJzdWIiOiIiLCJzY29wZXMiOltdfQ.cz76YYuLkJu-6GPm0pasPddNDFbgU6IzG2MyT3Feoe_Ij3_8I6zTQkdeH_LmYFgWja1Wmv0CBRT-st6mFUdjlhmk8wFlKRdzLcyivlQQIhNdBKvS_XyE2cbEIChrkHalczszHT5cWLuxRhDTOhXPqoo1e7lVUXepes8AkhcSWqpHjwuHIEW1TUxKVVLBneyv_ojoHMqVLUXXSmWyxqImnE-t6mV37o9DcF5wHBTutqE0VXxqpOSfytKgkh1HhGH0PhHKIAxhCkBT5bvCvnOXgCqTMYG1kRZFm3GGrVxp0TTlBGoFb5U0VihMmOL2NArewp_89PXuPkLFppeleDE-VYnuELwgYSNwbrVd9ho5q5-RAIsLiaiK3ukYayTjm2-ndipLJQV9dfjgZMPooj8WDyu2cJU9mNCvwkKJUUASwt7tau5o6zmexuEiyU6JBNLKcK4lSa9qqsYa6WrxkenMBq1xGWphYp9GHR5UOEYLko4SfhkAQZLNDq_7bKpuyEWARxZEmFSuH2ofcLqyG7WH9J0Rd0wqQhhgd-X32xPHaCnED3SXQBiYv_-MxAZBsKr0mBtBDqtS2HI8D21vSJZWNJ6G81-Yqe7Q0TbveexEgyrlHy3GsV-AUK5Ta8aX_HPjz2CHig5jYxWijOoQusvSAeYXNCjWVNFapl1g7gzdyt4"
    CRM_ENABLED: bool = True
    CRM_DEFAULT_LEAD_CHANNEL: int = 0
    CRM_DEFAULT_SOURCE_MEDIUM: int = 0
    CRM_DEFAULT_LEAD_OWNER: str = "46deaf9b-1f42-498f-99c3-959af742a021"  # Default counselor UUID in CRM
    
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

