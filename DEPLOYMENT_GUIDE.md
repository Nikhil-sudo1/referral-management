# TeamLease EdTech Referral Portal - Deployment Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Backend Deployment](#backend-deployment)
7. [Frontend Deployment](#frontend-deployment)
8. [Docker Deployment](#docker-deployment)
9. [AWS CI/CD Pipeline](#aws-cicd-pipeline)
10. [Health Checks & Monitoring](#health-checks--monitoring)
11. [Troubleshooting](#troubleshooting)

---

## 🏗️ Project Overview

**Application:** TeamLease EdTech Referral Portal  
**Version:** 1.0.0  
**Repository:** AWS CodeCommit - `referral-management`  
**Branch:** `nik-rik-dev` (development), `main` (production)

### Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Python 3.12 + FastAPI |
| Database | PostgreSQL 15+ |
| Cache | In-memory (built-in) |
| Auth | JWT (JSON Web Tokens) |

---

## 🏛️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │────▶│    Backend      │────▶│   PostgreSQL    │
│  (React/Vite)   │     │   (FastAPI)     │     │    Database     │
│   Port: 5173    │     │   Port: 8000    │     │   Port: 5432    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## ✅ Prerequisites

### System Requirements

- **Node.js:** v18.x or higher
- **Python:** 3.11 or 3.12
- **PostgreSQL:** 15.x or higher
- **Git:** Latest version

### CLI Tools

```bash
# Verify installations
node --version    # Should be v18+
npm --version     # Should be v9+
python --version  # Should be 3.11+
pip --version
psql --version    # PostgreSQL client
```

---

## 🔐 Environment Variables

### Backend Environment Variables (`backend/.env`)

```env
# ===========================================
# DATABASE CONFIGURATION
# ===========================================
DATABASE_HOST=your-database-host.com
DATABASE_PORT=5432
DATABASE_NAME=referral_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your-secure-password

# ===========================================
# JWT AUTHENTICATION
# ===========================================
JWT_SECRET_KEY=your-super-secret-jwt-key-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# ===========================================
# APPLICATION SETTINGS
# ===========================================
APP_NAME=TeamLease EdTech Referral Portal
APP_VERSION=1.0.0
DEBUG=false
ENVIRONMENT=production

# ===========================================
# CORS CONFIGURATION
# ===========================================
CORS_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# ===========================================
# LOGGING
# ===========================================
LOG_LEVEL=INFO
```

### Frontend Environment Variables (`frontend/.env`)

```env
# ===========================================
# API CONFIGURATION
# ===========================================
VITE_API_URL=https://your-backend-api.com
VITE_API_VERSION=v1

# ===========================================
# APPLICATION SETTINGS
# ===========================================
VITE_APP_NAME=TeamLease EdTech Referral Portal
VITE_APP_VERSION=1.0.0
```

### Environment Variables for CI/CD (AWS Systems Manager Parameter Store)

| Parameter Name | Description | Type |
|---------------|-------------|------|
| `/referral/prod/db-host` | Database host | String |
| `/referral/prod/db-password` | Database password | SecureString |
| `/referral/prod/jwt-secret` | JWT secret key | SecureString |
| `/referral/prod/cors-origins` | Allowed CORS origins | String |

---

## 🗄️ Database Setup

### 1. Create Database

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE referral_db;
CREATE USER referral_user WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE referral_db TO referral_user;

-- Connect to referral_db and grant schema permissions
\c referral_db
GRANT ALL ON SCHEMA public TO referral_user;
```

### 2. Run Migrations

The application auto-creates tables on startup. For manual control:

```bash
cd backend
python -c "from app.database import init_db; init_db()"
```

### 3. Seed Initial Data (Optional)

```bash
cd backend
python seed_data.py
```

### Database Schema Overview

| Table | Description |
|-------|-------------|
| `users` | User accounts (admins, counselors, referrers) |
| `universities` | Partner universities |
| `programs` | University programs |
| `referrals` | Referral submissions |
| `rewards` | Reward records |
| `notifications` | User notifications |
| `audit_logs` | Activity audit trail |

---

## 🔧 Backend Deployment

### Local Development

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Deployment

```bash
cd backend

# Install production dependencies
pip install -r requirements.txt

# Run with Gunicorn (recommended for production)
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile - \
  --timeout 120
```

### Backend Dependencies (`requirements.txt`)

```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
gunicorn==21.2.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
pydantic==2.5.3
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
loguru==0.7.2
alembic==1.13.1
```

---

## 🎨 Frontend Deployment

### Local Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Production Build

```bash
cd frontend

# Install dependencies
npm ci

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Build Output

The production build is created in `frontend/dist/` directory:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ... (other assets)
└── favicon.ico
```

### Serve Static Files

Options for serving the frontend:

1. **Nginx** (recommended)
2. **AWS S3 + CloudFront**
3. **Vercel/Netlify**

---

## 🐳 Docker Deployment

### Backend Dockerfile (`backend/Dockerfile`)

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["gunicorn", "app.main:app", \
     "--workers", "4", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000", \
     "--timeout", "120"]
```

### Frontend Dockerfile (`frontend/Dockerfile`)

```dockerfile
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_HOST=db
      - DATABASE_PORT=5432
      - DATABASE_NAME=referral_db
      - DATABASE_USER=postgres
      - DATABASE_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET_KEY=${JWT_SECRET}
      - DEBUG=false
      - ENVIRONMENT=production
      - CORS_ORIGINS=http://localhost:3000
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=referral_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Build & Run with Docker

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## 🚀 AWS CI/CD Pipeline

### AWS Services Used

| Service | Purpose |
|---------|---------|
| CodeCommit | Source code repository |
| CodeBuild | Build and test |
| CodePipeline | Orchestration |
| ECR | Docker image registry |
| ECS/Fargate | Container hosting |
| RDS | PostgreSQL database |
| S3 + CloudFront | Frontend hosting |
| Systems Manager | Secrets management |

### Pipeline Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│              │    │              │    │              │    │              │
│  CodeCommit  │───▶│  CodeBuild   │───▶│     ECR      │───▶│  ECS/Fargate │
│   (Source)   │    │   (Build)    │    │   (Store)    │    │   (Deploy)   │
│              │    │              │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### buildspec.yml (Backend)

```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
      - REPOSITORY_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/referral-backend
      - COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
      - IMAGE_TAG=${COMMIT_HASH:=latest}

  build:
    commands:
      - echo Build started on `date`
      - echo Building the Docker image...
      - cd backend
      - docker build -t $REPOSITORY_URI:latest .
      - docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$IMAGE_TAG

  post_build:
    commands:
      - echo Build completed on `date`
      - echo Pushing the Docker images...
      - docker push $REPOSITORY_URI:latest
      - docker push $REPOSITORY_URI:$IMAGE_TAG
      - echo Writing image definitions file...
      - printf '[{"name":"referral-backend","imageUri":"%s"}]' $REPOSITORY_URI:$IMAGE_TAG > imagedefinitions.json

artifacts:
  files:
    - imagedefinitions.json
```

### buildspec-frontend.yml (Frontend)

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - cd frontend
      - npm ci

  build:
    commands:
      - echo Build started on `date`
      - npm run build

  post_build:
    commands:
      - echo Build completed on `date`
      - aws s3 sync dist/ s3://$S3_BUCKET --delete
      - aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DIST_ID --paths "/*"

artifacts:
  files:
    - frontend/dist/**/*
  base-directory: frontend
```

### ECS Task Definition (`task-definition.json`)

```json
{
  "family": "referral-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "referral-backend",
      "image": "ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/referral-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [
        {"name": "ENVIRONMENT", "value": "production"},
        {"name": "DEBUG", "value": "false"}
      ],
      "secrets": [
        {
          "name": "DATABASE_HOST",
          "valueFrom": "arn:aws:ssm:REGION:ACCOUNT_ID:parameter/referral/prod/db-host"
        },
        {
          "name": "DATABASE_PASSWORD",
          "valueFrom": "arn:aws:ssm:REGION:ACCOUNT_ID:parameter/referral/prod/db-password"
        },
        {
          "name": "JWT_SECRET_KEY",
          "valueFrom": "arn:aws:ssm:REGION:ACCOUNT_ID:parameter/referral/prod/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/referral-backend",
          "awslogs-region": "REGION",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

---

## 🔍 Health Checks & Monitoring

### Backend Health Endpoint

```
GET /health

Response:
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production"
}
```

### API Documentation

| Endpoint | Description |
|----------|-------------|
| `/docs` | Swagger UI (disabled in production) |
| `/redoc` | ReDoc documentation |
| `/openapi.json` | OpenAPI specification |

### Recommended Monitoring

1. **AWS CloudWatch** - Logs and metrics
2. **Application Performance**:
   - Response time < 500ms (target)
   - Error rate < 1%
   - Availability > 99.9%

### CloudWatch Alarms

```yaml
# Example CloudWatch alarm for high latency
HighLatencyAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: ReferralAPI-HighLatency
    MetricName: TargetResponseTime
    Namespace: AWS/ApplicationELB
    Statistic: Average
    Period: 60
    EvaluationPeriods: 3
    Threshold: 1
    ComparisonOperator: GreaterThanThreshold
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Failed

```
Error: could not connect to server
```

**Solution:**
- Verify `DATABASE_HOST`, `DATABASE_PORT` in environment variables
- Check security group allows inbound traffic on port 5432
- Verify RDS instance is running

#### 2. CORS Errors

```
Access-Control-Allow-Origin header missing
```

**Solution:**
- Update `CORS_ORIGINS` to include your frontend domain
- Ensure protocol (http/https) matches

#### 3. JWT Token Invalid

```
Error: Invalid or expired token
```

**Solution:**
- Verify `JWT_SECRET_KEY` is the same across all instances
- Check token expiration settings

#### 4. Slow API Response

**Solution:**
- Check database query performance
- Verify caching is working (check logs for "cache hit")
- Use `127.0.0.1` instead of `localhost` for local testing

### Useful Commands

```bash
# Check backend logs (Docker)
docker logs referral-backend -f

# Check ECS logs
aws logs tail /ecs/referral-backend --follow

# Test database connection
psql -h $DATABASE_HOST -U $DATABASE_USER -d $DATABASE_NAME -c "SELECT 1"

# Test API health
curl -f http://localhost:8000/health
```

---

## 📝 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] CORS origins configured
- [ ] SSL certificates ready

### Deployment

- [ ] Backend Docker image built and pushed
- [ ] Frontend build completed
- [ ] Database schema updated
- [ ] Health checks passing

### Post-Deployment

- [ ] Verify all endpoints responding
- [ ] Test authentication flow
- [ ] Check logs for errors
- [ ] Verify monitoring/alerts

---

## 📞 Support

For deployment issues, contact:
- **DevOps Team:** devops@teamlease.com
- **Backend Team:** backend@teamlease.com

---

*Last Updated: December 2024*

