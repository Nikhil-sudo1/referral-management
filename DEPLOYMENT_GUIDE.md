# TeamLease EdTech Referral Portal - AWS ECS Fargate Deployment Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [AWS Resources](#aws-resources)
3. [Docker Configuration](#docker-configuration)
4. [Environment Variables](#environment-variables)
5. [ECS Task Definitions](#ecs-task-definitions)
6. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
7. [Manual Deployment Commands](#manual-deployment-commands)
8. [Health Checks](#health-checks)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ Project Overview

**Application:** TeamLease EdTech Referral Portal  
**Deployment Target:** AWS ECS Fargate  
**Region:** ap-south-1  
**ECS Cluster:** hackathon

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │────▶│    Backend      │────▶│   PostgreSQL    │
│  (React/Nginx)  │     │   (FastAPI)     │     │    (RDS)        │
│   Port: 80      │     │   Port: 8000    │     │   Port: 5432    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## ☁️ AWS Resources

### UI Project

| Resource | Value |
|----------|-------|
| ECR Repository | `163742846785.dkr.ecr.ap-south-1.amazonaws.com/dev-referral-mgmt-ui-ecr` |
| ECS Service | `dev-referral-mgmt-ui-service` |
| ECS Cluster | `hackathon` |
| Container Name | `dev-referral-mgmt-ui` |
| Port | `80` |

### API Project

| Resource | Value |
|----------|-------|
| ECR Repository | `163742846785.dkr.ecr.ap-south-1.amazonaws.com/dev-referral-mgmt-api-ecr` |
| ECS Service | `dev-referral-mgmt-apii-service` |
| ECS Cluster | `hackathon` |
| Container Name | `dev-referral-mgmt-api` |
| Port | `8000` |

### Common AWS Settings

| Setting | Value |
|---------|-------|
| AWS Region | `ap-south-1` |
| AWS Account ID | `163742846785` |

---

## 🐳 Docker Configuration

### Files Structure

```
referral-management/
├── Dockerfile.ui          # Frontend Docker build
├── Dockerfile.api         # Backend Docker build
├── nginx.conf             # Nginx config for UI
├── buildspec-ui.yml       # CodeBuild spec for UI
├── buildspec-api.yml      # CodeBuild spec for API
├── frontend/              # React frontend source
└── backend/               # FastAPI backend source
```

### Build Commands (Local Testing)

```bash
# Build UI image
docker build -t dev-referral-mgmt-ui:latest -f Dockerfile.ui .

# Build API image
docker build -t dev-referral-mgmt-api:latest -f Dockerfile.api .

# Run UI locally
docker run -p 80:80 dev-referral-mgmt-ui:latest

# Run API locally (with env vars)
docker run -p 8000:8000 \
  -e DATABASE_HOST=your-db-host \
  -e DATABASE_PORT=5432 \
  -e DATABASE_NAME=referral_db \
  -e DATABASE_USER=postgres \
  -e DATABASE_PASSWORD=your-password \
  -e JWT_SECRET_KEY=your-secret \
  -e CORS_ORIGINS=http://localhost \
  dev-referral-mgmt-api:latest
```

---

## 🔐 Environment Variables

### API Environment Variables (Set in ECS Task Definition)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_HOST` | PostgreSQL host | Yes |
| `DATABASE_PORT` | PostgreSQL port (default: 5432) | Yes |
| `DATABASE_NAME` | Database name | Yes |
| `DATABASE_USER` | Database username | Yes |
| `DATABASE_PASSWORD` | Database password | Yes |
| `JWT_SECRET_KEY` | Secret key for JWT tokens | Yes |
| `JWT_ALGORITHM` | JWT algorithm (default: HS256) | No |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry (default: 60) | No |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | Yes |
| `DEBUG` | Debug mode (default: false) | No |
| `ENVIRONMENT` | Environment name (production/development) | No |

### UI Environment Variables (Build-time)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |

**Note:** UI environment variables are baked in at build time. For runtime configuration, use the API URL in the task definition build args.

---

## 📦 ECS Task Definitions

### UI Task Definition

Create in AWS Console or use this JSON template:

```json
{
  "family": "dev-referral-mgmt-ui",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::163742846785:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "dev-referral-mgmt-ui",
      "image": "163742846785.dkr.ecr.ap-south-1.amazonaws.com/dev-referral-mgmt-ui-ecr:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "hostPort": 80,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/dev-referral-mgmt-ui",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "ecs",
          "awslogs-create-group": "true"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

### API Task Definition

Create in AWS Console or use this JSON template:

```json
{
  "family": "dev-referral-mgmt-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::163742846785:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::163742846785:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "dev-referral-mgmt-api",
      "image": "163742846785.dkr.ecr.ap-south-1.amazonaws.com/dev-referral-mgmt-api-ecr:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "hostPort": 8000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [
        {"name": "ENVIRONMENT", "value": "production"},
        {"name": "DEBUG", "value": "false"},
        {"name": "DATABASE_PORT", "value": "5432"},
        {"name": "DATABASE_NAME", "value": "referral_db"},
        {"name": "DATABASE_USER", "value": "postgres"},
        {"name": "JWT_ALGORITHM", "value": "HS256"},
        {"name": "ACCESS_TOKEN_EXPIRE_MINUTES", "value": "60"}
      ],
      "secrets": [
        {
          "name": "DATABASE_HOST",
          "valueFrom": "arn:aws:ssm:ap-south-1:163742846785:parameter/referral/dev/db-host"
        },
        {
          "name": "DATABASE_PASSWORD",
          "valueFrom": "arn:aws:ssm:ap-south-1:163742846785:parameter/referral/dev/db-password"
        },
        {
          "name": "JWT_SECRET_KEY",
          "valueFrom": "arn:aws:ssm:ap-south-1:163742846785:parameter/referral/dev/jwt-secret"
        },
        {
          "name": "CORS_ORIGINS",
          "valueFrom": "arn:aws:ssm:ap-south-1:163742846785:parameter/referral/dev/cors-origins"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/dev-referral-mgmt-api",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "ecs",
          "awslogs-create-group": "true"
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

### AWS Systems Manager Parameters to Create

Create these parameters in AWS Systems Manager Parameter Store:

| Parameter Path | Type | Description |
|---------------|------|-------------|
| `/referral/dev/db-host` | String | RDS endpoint |
| `/referral/dev/db-password` | SecureString | Database password |
| `/referral/dev/jwt-secret` | SecureString | JWT secret (min 32 chars) |
| `/referral/dev/cors-origins` | String | e.g., `https://your-ui-domain.com` |

---

## 🚀 CI/CD Pipeline Setup

### Option 1: AWS CodePipeline with CodeBuild

#### For UI Pipeline:
1. Create CodePipeline with source from CodeCommit/GitHub
2. Add CodeBuild stage using `buildspec-ui.yml`
3. Add ECS Deploy stage targeting `dev-referral-mgmt-ui-service`

#### For API Pipeline:
1. Create CodePipeline with source from CodeCommit/GitHub
2. Add CodeBuild stage using `buildspec-api.yml`
3. Add ECS Deploy stage targeting `dev-referral-mgmt-apii-service`

### CodeBuild Project Settings

| Setting | UI Project | API Project |
|---------|------------|-------------|
| Environment | aws/codebuild/amazonlinux2-x86_64-standard:5.0 | aws/codebuild/amazonlinux2-x86_64-standard:5.0 |
| Privileged | Yes (for Docker) | Yes (for Docker) |
| Buildspec | buildspec-ui.yml | buildspec-api.yml |

### IAM Permissions Required

CodeBuild service role needs:
- `ecr:GetAuthorizationToken`
- `ecr:BatchCheckLayerAvailability`
- `ecr:GetDownloadUrlForLayer`
- `ecr:BatchGetImage`
- `ecr:PutImage`
- `ecr:InitiateLayerUpload`
- `ecr:UploadLayerPart`
- `ecr:CompleteLayerUpload`
- `logs:CreateLogGroup`
- `logs:CreateLogStream`
- `logs:PutLogEvents`

---

## 💻 Manual Deployment Commands

### Prerequisites

```bash
# Configure AWS CLI
aws configure
# Enter your AWS Access Key, Secret Key, Region (ap-south-1)

# Verify configuration
aws sts get-caller-identity
```

### Deploy UI

```bash
# Login to ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 163742846785.dkr.ecr.ap-south-1.amazonaws.com

# Build image
docker build -t dev-referral-mgmt-ui:latest -f Dockerfile.ui .

# Tag image
docker tag dev-referral-mgmt-ui:latest 163742846785.dkr.ecr.ap-south-1.amazonaws.com/dev-referral-mgmt-ui-ecr:latest

# Push to ECR
docker push 163742846785.dkr.ecr.ap-south-1.amazonaws.com/dev-referral-mgmt-ui-ecr:latest

# Update ECS service (force new deployment)
aws ecs update-service --cluster hackathon --service dev-referral-mgmt-ui-service --force-new-deployment --region ap-south-1
```

### Deploy API

```bash
# Login to ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 163742846785.dkr.ecr.ap-south-1.amazonaws.com

# Build image
docker build -t dev-referral-mgmt-api:latest -f Dockerfile.api .

# Tag image
docker tag dev-referral-mgmt-api:latest 163742846785.dkr.ecr.ap-south-1.amazonaws.com/dev-referral-mgmt-api-ecr:latest

# Push to ECR
docker push 163742846785.dkr.ecr.ap-south-1.amazonaws.com/dev-referral-mgmt-api-ecr:latest

# Update ECS service (force new deployment)
aws ecs update-service --cluster hackathon --service dev-referral-mgmt-apii-service --force-new-deployment --region ap-south-1
```

---

## 🔍 Health Checks

### UI Health Check

```
GET http://<ui-alb-dns>/health

Response: healthy
```

**ALB Target Group Configuration for UI:**
- Protocol: HTTP
- Port: 80
- Health check path: `/health`
- Healthy threshold: 2
- Unhealthy threshold: 3
- Timeout: 5 seconds
- Interval: 30 seconds
- Success codes: 200

### API Health Check Endpoints

| Endpoint | Purpose | Use Case |
|----------|---------|----------|
| `/health` | Full health check (includes DB) | ALB Target Group |
| `/health/live` | Liveness probe (no DB) | Container health check |
| `/health/ready` | Readiness probe (includes DB) | ALB Target Group alternative |

**Main Health Check Response:**
```
GET http://<api-alb-dns>:8000/health

Response (200 OK):
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "api": "ok",
    "database": "ok"
  }
}

Response (503 Service Unavailable - if DB is down):
{
  "status": "unhealthy",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "api": "ok",
    "database": "failed"
  }
}
```

**ALB Target Group Configuration for API:**
- Protocol: HTTP
- Port: 8000
- Health check path: `/health`
- Healthy threshold: 2
- Unhealthy threshold: 3
- Timeout: 10 seconds
- Interval: 30 seconds
- Success codes: 200

### API Documentation

| Endpoint | Description |
|----------|-------------|
| `/docs` | Swagger UI (disabled in production) |
| `/redoc` | ReDoc documentation (disabled in production) |
| `/openapi.json` | OpenAPI specification (disabled in production) |

---

## 🔒 Security Measures

### Container Security

1. **Non-root user execution**
   - API container runs as `appuser` (UID 1000)
   - Nginx worker processes run as `nginx` user

2. **Multi-stage builds**
   - Build dependencies not included in final image
   - Smaller attack surface

3. **Minimal base images**
   - `python:3.12-slim` for API
   - `nginx:stable-alpine` for UI

### Network Security

1. **Security Groups**
   - ALB: Allow inbound 80/443 from internet
   - ECS Tasks: Allow inbound only from ALB security group
   - RDS: Allow inbound 5432 only from ECS task security group

2. **VPC Configuration**
   - ECS tasks in private subnets
   - ALB in public subnets
   - NAT Gateway for outbound traffic

### Application Security

1. **HTTP Security Headers** (UI - Nginx)
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Content-Security-Policy` configured
   - `Permissions-Policy` configured

2. **API Security**
   - JWT token authentication
   - CORS origins restricted
   - Input validation (Pydantic)
   - SQL injection protection (SQLAlchemy ORM)
   - Rate limiting (configure at ALB)

3. **Secrets Management**
   - Use AWS Systems Manager Parameter Store
   - SecureString for sensitive values
   - IAM roles for access control

### AWS SSM Parameters Required

Create these in AWS Systems Manager Parameter Store:

| Parameter | Type | Description |
|-----------|------|-------------|
| `/referral/dev/db-host` | String | RDS endpoint |
| `/referral/dev/db-password` | SecureString | Database password |
| `/referral/dev/jwt-secret` | SecureString | JWT signing key (32+ chars) |
| `/referral/dev/cors-origins` | String | Allowed origins |
| `/referral/dev/api-url` | String | API URL for UI build |

---

## 🐛 Troubleshooting

### Common Issues

#### 1. ECR Push Permission Denied

```
Error: denied: User is not authorized to perform: ecr:InitiateLayerUpload
```

**Solution:**
- Verify IAM permissions for ECR
- Run `aws ecr get-login-password` again

#### 2. ECS Task Failing to Start

**Check CloudWatch Logs:**
```bash
aws logs tail /ecs/dev-referral-mgmt-api --follow --region ap-south-1
```

**Common causes:**
- Missing environment variables
- Database connection issues
- Health check failing

#### 3. Database Connection Timeout

**Solution:**
- Verify security group allows inbound from ECS tasks
- Check DATABASE_HOST parameter value
- Verify RDS is in the same VPC or has proper VPC peering

#### 4. CORS Errors

**Solution:**
- Update CORS_ORIGINS parameter to include UI domain
- Ensure protocol (http/https) matches

### Useful Commands

```bash
# Check ECS service status
aws ecs describe-services --cluster hackathon --services dev-referral-mgmt-api-service --region ap-south-1

# List running tasks
aws ecs list-tasks --cluster hackathon --service-name dev-referral-mgmt-api-service --region ap-south-1

# Get task details
aws ecs describe-tasks --cluster hackathon --tasks <task-arn> --region ap-south-1

# View CloudWatch logs
aws logs tail /ecs/dev-referral-mgmt-api --follow --region ap-south-1
```

---

## 📝 Deployment Checklist

### Pre-Deployment

- [ ] AWS CLI configured with correct credentials
- [ ] ECR repositories exist
- [ ] ECS cluster `hackathon` exists
- [ ] ECS services created
- [ ] Task definitions created with correct env vars
- [ ] SSM parameters created for secrets
- [ ] Security groups configured
- [ ] ALB/Target groups configured

### Deployment

- [ ] Docker images built successfully
- [ ] Images pushed to ECR
- [ ] ECS service updated
- [ ] Tasks running (check ECS console)

### Post-Deployment

- [ ] Health checks passing
- [ ] API responds correctly
- [ ] UI loads properly
- [ ] Can login to application
- [ ] CloudWatch logs show no errors

---

*Last Updated: December 2024*

