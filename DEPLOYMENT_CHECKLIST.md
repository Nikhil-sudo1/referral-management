# AWS ECS Fargate Deployment Checklist

## ✅ Pre-Deployment Checklist

### **1. AWS Infrastructure Setup**

#### **ECR Repositories**
- [ ] Create ECR repository: `dev-referral-mgmt-ui-ecr`
- [ ] Create ECR repository: `dev-referral-mgmt-api-ecr`
- [ ] Verify repository URIs match buildspec files

#### **ECS Cluster**
- [ ] Create/verify ECS cluster: `hackathon`
- [ ] Ensure cluster is in region: `ap-south-1`

#### **VPC & Networking**
- [ ] Create VPC with public and private subnets
- [ ] Configure Internet Gateway
- [ ] Configure NAT Gateway (for private subnets)
- [ ] Create security groups:
  - [ ] ALB security group (allow 80, 443)
  - [ ] UI container security group (allow 3001 from ALB)
  - [ ] API container security group (allow 80 from ALB)
  - [ ] RDS security group (allow 5432 from API containers)

#### **Application Load Balancer (ALB)**
- [ ] Create Application Load Balancer
- [ ] Configure listeners:
  - [ ] HTTP:80 (redirect to HTTPS)
  - [ ] HTTPS:443 (with SSL certificate)
- [ ] Create target groups:
  - [ ] UI target group (port 3001, health check: `/health`)
  - [ ] API target group (port 80, health check: `/health/ready`)
- [ ] Configure routing rules:
  - [ ] `/api/*` → API target group
  - [ ] `/*` → UI target group

#### **RDS PostgreSQL Database**
- [ ] Create RDS PostgreSQL instance
- [ ] Configure database name: `referral`
- [ ] Set master username and password
- [ ] Enable automated backups
- [ ] Configure Multi-AZ (for production)
- [ ] Note down endpoint URL

#### **Systems Manager Parameter Store**
- [ ] Create parameter: `/referral/dev/api-url` (value: ALB API endpoint)
- [ ] Create parameter: `/referral/dev/db-host` (value: RDS endpoint)
- [ ] Create parameter: `/referral/dev/db-password` (value: DB password, SecureString)
- [ ] Create parameter: `/referral/dev/jwt-secret` (value: random secret, SecureString)

---

### **2. ECS Task Definitions**

#### **UI Task Definition**
```json
{
  "family": "dev-referral-mgmt-ui-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::163742846785:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::163742846785:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "dev-referral-mgmt-ui-container",
      "image": "163742846785.dkr.ecr.ap-south-1.amazonaws.com/dev-referral-mgmt-ui-ecr:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/dev-referral-mgmt-ui",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1"],
        "interval": 30,
        "timeout": 10,
        "retries": 3,
        "startPeriod": 10
      }
    }
  ]
}
```

**Checklist:**
- [ ] Create CloudWatch log group: `/ecs/dev-referral-mgmt-ui`
- [ ] Create task definition with above configuration
- [ ] Verify execution role has ECR and CloudWatch permissions

#### **API Task Definition**
```json
{
  "family": "dev-referral-mgmt-api-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::163742846785:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::163742846785:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "dev-referral-mgmt-api-container",
      "image": "163742846785.dkr.ecr.ap-south-1.amazonaws.com/dev-referral-mgmt-api-ecr:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [
        {
          "name": "DATABASE_PORT",
          "value": "5432"
        },
        {
          "name": "DATABASE_NAME",
          "value": "referral"
        },
        {
          "name": "DATABASE_USER",
          "value": "postgres"
        },
        {
          "name": "JWT_ALGORITHM",
          "value": "HS256"
        },
        {
          "name": "ACCESS_TOKEN_EXPIRE_MINUTES",
          "value": "60"
        },
        {
          "name": "REFRESH_TOKEN_EXPIRE_DAYS",
          "value": "7"
        },
        {
          "name": "DEBUG",
          "value": "False"
        },
        {
          "name": "ENVIRONMENT",
          "value": "production"
        },
        {
          "name": "LOG_LEVEL",
          "value": "INFO"
        }
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
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:80/health/live || exit 1"],
        "interval": 30,
        "timeout": 10,
        "retries": 3,
        "startPeriod": 40
      }
    }
  ]
}
```

**Checklist:**
- [ ] Create CloudWatch log group: `/ecs/dev-referral-mgmt-api`
- [ ] Create task definition with above configuration
- [ ] Verify execution role has SSM parameter access
- [ ] Create additional SSM parameter: `/referral/dev/cors-origins` (value: ALB UI endpoint)

---

### **3. ECS Services**

#### **UI Service**
- [ ] Create service: `dev-referral-mgmt-ui-service`
- [ ] Use task definition: `dev-referral-mgmt-ui-task`
- [ ] Desired count: 1 (or more for HA)
- [ ] Launch type: FARGATE
- [ ] Platform version: LATEST
- [ ] VPC: Select your VPC
- [ ] Subnets: Select private subnets
- [ ] Security group: UI container security group
- [ ] Load balancer: Attach to UI target group
- [ ] Enable service discovery (optional)
- [ ] Enable auto-scaling (optional)

#### **API Service**
- [ ] Create service: `dev-referral-mgmt-api-service`
- [ ] Use task definition: `dev-referral-mgmt-api-task`
- [ ] Desired count: 1 (or more for HA)
- [ ] Launch type: FARGATE
- [ ] Platform version: LATEST
- [ ] VPC: Select your VPC
- [ ] Subnets: Select private subnets
- [ ] Security group: API container security group
- [ ] Load balancer: Attach to API target group
- [ ] Enable service discovery (optional)
- [ ] Enable auto-scaling (optional)

---

### **4. CodePipeline Setup**

#### **CodeBuild Projects**

**UI Build Project:**
- [ ] Create CodeBuild project: `dev-referral-mgmt-ui-build`
- [ ] Source: CodeCommit repository
- [ ] Branch: `dev`
- [ ] Buildspec: `frontend/buildspec.yml`
- [ ] Environment:
  - [ ] Image: `aws/codebuild/standard:7.0`
  - [ ] Privileged mode: Enabled (for Docker)
  - [ ] Service role with ECR push permissions
- [ ] Artifacts: Output `imagedefinitions.json`

**API Build Project:**
- [ ] Create CodeBuild project: `dev-referral-mgmt-api-build`
- [ ] Source: CodeCommit repository
- [ ] Branch: `dev`
- [ ] Buildspec: `backend/buildspec.yml`
- [ ] Environment:
  - [ ] Image: `aws/codebuild/standard:7.0`
  - [ ] Privileged mode: Enabled (for Docker)
  - [ ] Service role with ECR push permissions
- [ ] Artifacts: Output `imagedefinitions.json`

#### **CodePipeline**

**UI Pipeline:**
- [ ] Create pipeline: `dev-referral-mgmt-ui-pipeline`
- [ ] Source stage: CodeCommit (`dev` branch)
- [ ] Build stage: Use `dev-referral-mgmt-ui-build`
- [ ] Deploy stage: ECS (cluster: `hackathon`, service: `dev-referral-mgmt-ui-service`)

**API Pipeline:**
- [ ] Create pipeline: `dev-referral-mgmt-api-pipeline`
- [ ] Source stage: CodeCommit (`dev` branch)
- [ ] Build stage: Use `dev-referral-mgmt-api-build`
- [ ] Deploy stage: ECS (cluster: `hackathon`, service: `dev-referral-mgmt-api-service`)

---

### **5. IAM Roles & Permissions**

#### **ECS Task Execution Role**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "ssm:GetParameters",
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "*"
    }
  ]
}
```

- [ ] Create/verify `ecsTaskExecutionRole` with above permissions

#### **CodeBuild Service Role**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "ssm:GetParameters"
      ],
      "Resource": "*"
    }
  ]
}
```

- [ ] Create/verify CodeBuild service role with above permissions

---

### **6. Database Initialization**

- [ ] Connect to RDS database
- [ ] Run database migrations (if using Alembic)
- [ ] Seed initial data (admin user, sample universities, etc.)
- [ ] Verify database connectivity from API container

---

### **7. DNS & SSL**

- [ ] Register domain or use Route 53
- [ ] Request SSL certificate from ACM
- [ ] Validate certificate
- [ ] Attach certificate to ALB HTTPS listener
- [ ] Create Route 53 A record pointing to ALB

---

## 🚀 Deployment Steps

### **Initial Deployment**

1. **Push Code to Repository**
   ```bash
   git checkout dev
   git pull origin dev
   git push origin dev
   ```

2. **Trigger Pipelines**
   - CodePipeline will automatically detect changes
   - Monitor build progress in CodeBuild console
   - Verify images are pushed to ECR

3. **Verify ECS Deployment**
   - Check ECS console for running tasks
   - Verify task health in target groups
   - Check CloudWatch logs for errors

4. **Test Application**
   - Access UI via ALB DNS: `http://<alb-dns>`
   - Test API health: `http://<alb-dns>/api/v1/health`
   - Test login and basic functionality

---

## 🔍 Post-Deployment Verification

### **Health Checks**
- [ ] UI health check: `http://<alb-dns>/health` → Returns "healthy"
- [ ] API liveness: `http://<alb-dns>/api/v1/health/live` → Returns 200
- [ ] API readiness: `http://<alb-dns>/api/v1/health/ready` → Returns 200
- [ ] Full health: `http://<alb-dns>/api/v1/health` → Database connected

### **Functionality Tests**
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads
- [ ] Referrals can be created
- [ ] Universities can be managed
- [ ] Leaderboard displays
- [ ] Analytics show data

### **Performance Tests**
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] No N+1 query issues
- [ ] Caching working properly

### **Security Tests**
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] JWT authentication working
- [ ] CORS configured correctly
- [ ] No sensitive data in logs

---

## 📊 Monitoring Setup

### **CloudWatch Alarms**
- [ ] CPU utilization > 80%
- [ ] Memory utilization > 80%
- [ ] Target group unhealthy hosts > 0
- [ ] API error rate > 5%
- [ ] Database connection failures

### **CloudWatch Dashboards**
- [ ] Create dashboard with key metrics
- [ ] Add ECS service metrics
- [ ] Add ALB metrics
- [ ] Add RDS metrics

---

## 🔄 Rollback Plan

### **If Deployment Fails**

1. **Immediate Rollback**
   ```bash
   # In ECS console
   # Update service → Use previous task definition revision
   ```

2. **Investigate Issues**
   - Check CloudWatch logs
   - Verify environment variables
   - Test database connectivity
   - Check security group rules

3. **Fix and Redeploy**
   - Fix issues in code
   - Push to dev branch
   - Pipeline will auto-deploy

---

## 📝 Configuration Values

### **Replace These Values**

| Placeholder | Actual Value | Location |
|-------------|--------------|----------|
| `<alb-dns>` | Your ALB DNS name | Route 53, CORS |
| `<rds-endpoint>` | Your RDS endpoint | SSM Parameter |
| `<db-password>` | Your DB password | SSM Parameter |
| `<jwt-secret>` | Random secret key | SSM Parameter |

---

## ✅ Final Checklist

- [ ] All AWS resources created
- [ ] All IAM roles configured
- [ ] All SSM parameters set
- [ ] Database initialized
- [ ] Pipelines configured
- [ ] Services running
- [ ] Health checks passing
- [ ] Application accessible
- [ ] Monitoring configured
- [ ] Documentation updated

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Version**: 1.0.0  
**Status**: ⬜ Success | ⬜ Failed | ⬜ Rolled Back

