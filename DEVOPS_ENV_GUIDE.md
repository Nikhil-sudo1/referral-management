# DevOps Environment Variables Guide
## TeamLease EdTech Referral Portal

---

## 📋 Quick Reference

| Service | Port | Health Check | Domain |
|---------|------|--------------|--------|
| Frontend (UI) | 3001 | `/health` | `devreferral.tledtech.com` |
| Backend (API) | 80 | `/health` | `devreferralapi.tledtech.com` |

---

## 🔧 BACKEND ENVIRONMENT VARIABLES

### Required Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `DATABASE_HOST` | PostgreSQL RDS endpoint | `your-db.ap-south-1.rds.amazonaws.com` |
| `DATABASE_PORT` | Database port | `5432` |
| `DATABASE_NAME` | Database name | `referral_db` |
| `DATABASE_USER` | Database username | `postgres` |
| `DATABASE_PASSWORD` | Database password | `YourSecurePassword123!` |
| `JWT_SECRET_KEY` | JWT signing key (use `openssl rand -hex 32`) | `a1b2c3d4e5f6...` |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry | `60` |
| `CORS_ORIGINS` | Allowed frontend URLs | `https://your-frontend.com` |
| `ENVIRONMENT` | Environment name | `production` |

### ECS Task Definition - Backend

```json
{
  "containerDefinitions": [
    {
      "name": "dev-referral-mgmt-api-container",
      "image": "163742846785.dkr.ecr.ap-south-1.amazonaws.com/dev-referral-mgmt-api-ecr:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "hostPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "DATABASE_HOST", "value": "your-rds-endpoint.ap-south-1.rds.amazonaws.com" },
        { "name": "DATABASE_PORT", "value": "5432" },
        { "name": "DATABASE_NAME", "value": "referral_db" },
        { "name": "DATABASE_USER", "value": "postgres" },
        { "name": "JWT_ALGORITHM", "value": "HS256" },
        { "name": "ACCESS_TOKEN_EXPIRE_MINUTES", "value": "60" },
        { "name": "REFRESH_TOKEN_EXPIRE_DAYS", "value": "7" },
        { "name": "APP_NAME", "value": "TeamLease EdTech Referral Portal" },
        { "name": "APP_VERSION", "value": "1.0.0" },
        { "name": "DEBUG", "value": "false" },
        { "name": "ENVIRONMENT", "value": "production" },
        { "name": "CORS_ORIGINS", "value": "https://your-frontend-alb.ap-south-1.elb.amazonaws.com" },
        { "name": "LOG_LEVEL", "value": "INFO" }
      ],
      "secrets": [
        {
          "name": "DATABASE_PASSWORD",
          "valueFrom": "arn:aws:ssm:ap-south-1:163742846785:parameter/referral-portal/dev/DATABASE_PASSWORD"
        },
        {
          "name": "JWT_SECRET_KEY",
          "valueFrom": "arn:aws:ssm:ap-south-1:163742846785:parameter/referral-portal/dev/JWT_SECRET_KEY"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:80/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/dev-referral-mgmt-api",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

---

## 🎨 FRONTEND ENVIRONMENT VARIABLES

### Required Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `VITE_API_BASE_URL` | Backend API URL | `http://api-alb.ap-south-1.elb.amazonaws.com` |

### Build-time Variable (Docker)

The frontend uses `VITE_API_URL` as a build argument:

```bash
docker build \
  --build-arg VITE_API_URL=http://your-api-alb.ap-south-1.elb.amazonaws.com \
  -t frontend .
```

### ECS Task Definition - Frontend

```json
{
  "containerDefinitions": [
    {
      "name": "dev-referral-mgmt-ui-container",
      "image": "163742846785.dkr.ecr.ap-south-1.amazonaws.com/dev-referral-mgmt-ui-ecr:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "hostPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 30
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/dev-referral-mgmt-ui",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

---

## 🔐 AWS SSM PARAMETER STORE SETUP

Create these parameters in AWS SSM Parameter Store:

```bash
# Create DATABASE_PASSWORD parameter
aws ssm put-parameter \
  --name "/referral-portal/dev/DATABASE_PASSWORD" \
  --value "YourSecurePassword123!" \
  --type "SecureString" \
  --region ap-south-1

# Create JWT_SECRET_KEY parameter (generate with: openssl rand -hex 32)
aws ssm put-parameter \
  --name "/referral-portal/dev/JWT_SECRET_KEY" \
  --value "$(openssl rand -hex 32)" \
  --type "SecureString" \
  --region ap-south-1
```

---

## 🌐 ALB TARGET GROUP SETTINGS

### Backend Target Group
- **Port**: 80
- **Protocol**: HTTP
- **Health Check Path**: `/health`
- **Health Check Port**: 80
- **Healthy Threshold**: 2
- **Unhealthy Threshold**: 3
- **Timeout**: 5 seconds
- **Interval**: 30 seconds

### Frontend Target Group
- **Port**: 3001
- **Protocol**: HTTP
- **Health Check Path**: `/health`
- **Health Check Port**: 3001
- **Healthy Threshold**: 2
- **Unhealthy Threshold**: 3
- **Timeout**: 5 seconds
- **Interval**: 30 seconds

---

## 📦 CODEBUILD ENVIRONMENT VARIABLES

### Backend (buildspec.yml)
```yaml
env:
  variables:
    AWS_REGION: "ap-south-1"
    AWS_ACCOUNT_ID: "163742846785"
    ECS_CLUSTER: "hackathon"
    ECS_SERVICE: "dev-referral-mgmt-api-service"
    REPOSITORY_URI: "163742846785.dkr.ecr.ap-south-1.amazonaws.com/dev-referral-mgmt-api-ecr"
    CONTAINER_NAME: "dev-referral-mgmt-api-container"
```

### Frontend (buildspec.yml)
```yaml
env:
  variables:
    AWS_REGION: "ap-south-1"
    AWS_ACCOUNT_ID: "163742846785"
    ECS_CLUSTER: "hackathon"
    ECS_SERVICE: "dev-referral-mgmt-ui-service"
    REPOSITORY_URI: "163742846785.dkr.ecr.ap-south-1.amazonaws.com/dev-referral-mgmt-ui-ecr"
    CONTAINER_NAME: "dev-referral-mgmt-ui-container"
    VITE_API_URL: "http://your-api-alb.ap-south-1.elb.amazonaws.com"
```

---

## ✅ CHECKLIST FOR DEPLOYMENT

### Before Deployment
- [ ] Create RDS PostgreSQL database
- [ ] Create SSM parameters for secrets
- [ ] Create ECR repositories
- [ ] Create CloudWatch log groups
- [ ] Create ECS cluster (or use existing)
- [ ] Create ALB with target groups

### Environment Variables
- [ ] Set `DATABASE_HOST` to RDS endpoint
- [ ] Set `DATABASE_PASSWORD` in SSM
- [ ] Generate and set `JWT_SECRET_KEY` in SSM
- [ ] Set `CORS_ORIGINS` to frontend ALB URL
- [ ] Set `VITE_API_URL` to backend ALB URL (in CodeBuild)

### After Deployment
- [ ] Verify health checks passing
- [ ] Test login functionality
- [ ] Verify API connectivity from frontend
- [ ] Check CloudWatch logs for errors

---

## 🔗 Service URLs (Update with actual values)

| Service | URL |
|---------|-----|
| Frontend ALB | `http://dev-referral-ui-alb-xxx.ap-south-1.elb.amazonaws.com` |
| Backend ALB | `http://dev-referral-api-alb-xxx.ap-south-1.elb.amazonaws.com` |
| API Health | `http://backend-alb/health` |
| UI Health | `http://frontend-alb:3001/health` |

