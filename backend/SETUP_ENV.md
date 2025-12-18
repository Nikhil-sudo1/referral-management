# Environment Setup Instructions

## Create .env File

Create a `.env` file in the `backend` directory with the following content:

```env
# Database Configuration
DATABASE_HOST=10.0.3.146
DATABASE_PORT=5432
DATABASE_NAME=referral
DATABASE_USER=referral
DATABASE_PASSWORD=R@f@iia1@2026

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production-2024
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Application Configuration
APP_NAME=TeamLease EdTech Referral Portal
APP_VERSION=1.0.0
DEBUG=False
ENVIRONMENT=production

# CORS Origins (comma-separated) - Frontend: 3001, Backend: 80
CORS_ORIGINS=http://localhost:3001,http://localhost:80

# Email/SMTP Configuration (ZeptoMail for teamleaseedtech.com)
SMTP_HOST=smtp.zeptomail.in
SMTP_PORT=587
SMTP_USER=emailapikey
SMTP_PASSWORD=Zoho-enczapikey PHtE6r0PRum52jJ8+hMH4qC9FpagMYspq+MzfwkUtY5HDaIHGE0Hqoh4kjKyoh5+BvFGFKTNzdptuLibseKNIzztMWhMX2qyqK3sx/VYSPOZsbq6x00csFwdd03fVYDndtJt0izevdnSNA==
SMTP_USE_TLS=True
EMAIL_FROM=noreply@teamleaseedtech.com
EMAIL_FROM_NAME=TeamLease EdTech

# Frontend URL for email links (verification & password reset)
FRONTEND_URL=http://localhost:3001

# Logging
LOG_LEVEL=INFO
```

## Quick Setup Command

On Windows (PowerShell):
```powershell
Copy-Item env.example .env
```

On Linux/Mac:
```bash
cp env.example .env
```

Then edit the `.env` file to ensure all values are correct.

## Email Features

The system sends emails for:
1. **Email Verification** - Sent after signup to verify the user's email address
2. **Password Reset** - Sent when user requests a password reset
3. **Welcome Email** - Sent after successful registration

## SMTP Configuration (ZeptoMail)

- **Server**: smtp.zeptomail.in
- **Ports**: 587 (TLS) or 465 (SSL)
- **Authentication**: emailapikey + provided API key
- **Domain**: teamleaseedtech.com

## Verification

After creating the `.env` file, verify the configuration by:

1. Starting the backend server
2. Checking that database connection is successful
3. Testing email sending (sign up a test user or use forgot password)
4. Check the backend logs for email delivery status
