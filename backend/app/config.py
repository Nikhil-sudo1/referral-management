"""
Application Configuration
Centralized configuration management using Pydantic Settings
"""
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database - defaults to production database for local development
    # Override with environment variables or .env file if needed
    DATABASE_HOST: str = "10.0.3.146"
    DATABASE_PORT: int = 5432
    DATABASE_NAME: str = "referral"
    DATABASE_USER: str = "referral"
    DATABASE_PASSWORD: str = "R@f@iia1@2026"
    
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
    CORS_ORIGINS: str = "https://devreferral.tledtech.com,http://localhost:5173,http://localhost:3001,http://localhost:3000,http://localhost:80"
    
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
    CRM_SESSION_TOKEN: str = "ydUgsSiFWSZkpysBNXBzE4hMdvq8f6MrzpSgNgDCgrlURV4CcFEDYLTPLQl0"
    CRM_BEARER_TOKEN: str = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiY2NhNGRkMjhiNDJmNTFiOTA3ZjUwNzFkMDg5ZGZkY2MzMWEyMjQxZjdiMmNmYWU0NWIyMDQ4YWQ5Njg0N2MyN2ZhZDVkYTgxM2QwYzFhMzMiLCJpYXQiOjE3NjI5NDM5MTEuMjExMDcsIm5iZiI6MTc2Mjk0MzkxMS4yMTEwNzcsImV4cCI6MTc5NDQ3OTkxMS4wNDA5MzMsInN1YiI6IiIsInNjb3BlcyI6W119.nVXsyLsj90jWsEatuGrXaAajih20wVDBEYxns83k4yDvcBUYj7zFZwIZHyF8Ydnp5LIjxjA4klsM2hN_Wjb7GmhoRbf3KJfxaxX35fkt71q3XcuY-7fC_U3LphQG0By4pU65dzY37EreSTPdq2KeXtVMYdJrSAjUeflagbvv190YfpBSMhM7vi-AcheFpmoyBRvOdf3q4m2jtZuxQArJT5C9eUZ3hEQ9OOdLJS0Ru54jypFU4_iG8ZpdgsL-9Fmmnlw-C0WK1OFm8tdZ27yczhrt_gtvnjbjTSZvprPYwY1918fdjktGBtYzqt7mD3XYeW2_jna7x5pIuyDXxMdzo-xPJheeDkvInRHLD0wmGYQAxRZwZ-aE5E2SSozz1ymqm919nyCaZ-Og25dVAU-FgwBVJi6d8dHaVB07k5tAX9g6tmJFCildmEwKi8Y6tkwaxQ-lGjUN08w6BEY-n8YqPUah58pvG6PEs_D6Ol_AVf04SaVQYx7nqPxI7FtLjwC-s62RhglXLHjVwfWj8NG1TscOGNv0K-_aJ_ikS7WPEUa0oeUGzBbnqNDh2qACt1_jkB5MxiPY2SPWzDXyVAqX2iEJETYxDOFSE-SyBKrO8EEdRWfYW-Ur2hqinY6sfG5hRt-hQ05ojTvR_DceUOSZn7LHQPdnaSxDfq9olpg9ZYE"
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

