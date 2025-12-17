# TeamLease EdTech Referral Portal - Application Architecture

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS CLOUD (ap-south-1)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐                 ┌──────────────────┐       │
│  │   CloudWatch    │◄────Logs────────│  CodePipeline    │       │
│  │   Logs/Metrics  │                 │  (CI/CD)         │       │
│  └─────────────────┘                 └──────────────────┘       │
│           ▲                                   │                  │
│           │                                   ▼                  │
│  ┌────────┴────────┐          ┌───────────────────────┐        │
│  │  Application    │          │   CodeBuild           │        │
│  │  Load Balancer  │          │   - Build UI          │        │
│  │  (ALB)          │          │   - Build API         │        │
│  └────────┬────────┘          └───────────────────────┘        │
│           │                                   │                  │
│     ┌─────┴──────┐                           ▼                  │
│     │            │              ┌─────────────────────────┐     │
│     ▼            ▼              │  Elastic Container      │     │
│  Port 3001    Port 80           │  Registry (ECR)         │     │
│     │            │              │  - UI Image             │     │
│     │            │              │  - API Image            │     │
│     │            │              └─────────────────────────┘     │
│     │            │                           │                  │
│     │            │                           ▼                  │
│  ┌──▼────────────▼──────────────────────────────────┐          │
│  │         ECS Fargate Cluster (hackathon)          │          │
│  ├──────────────────────────────────────────────────┤          │
│  │                                                   │          │
│  │  ┌─────────────────┐      ┌──────────────────┐  │          │
│  │  │  UI Service     │      │  API Service     │  │          │
│  │  │  Port: 3001     │      │  Port: 80        │  │          │
│  │  │  CPU: 0.25vCPU  │      │  CPU: 0.5vCPU    │  │          │
│  │  │  RAM: 512MB     │      │  RAM: 1024MB     │  │          │
│  │  │                 │      │                  │  │          │
│  │  │  nginx:alpine   │      │  python:3.12     │  │          │
│  │  │  + React App    │─────►│  + FastAPI       │  │          │
│  │  └─────────────────┘      └────────┬─────────┘  │          │
│  │                                     │            │          │
│  └─────────────────────────────────────┼────────────┘          │
│                                        │                        │
│                           ┌────────────▼─────────────┐          │
│                           │  RDS PostgreSQL          │          │
│                           │  (Database)              │          │
│                           │  Port: 5432              │          │
│                           └──────────────────────────┘          │
│                                        ▲                        │
│                           ┌────────────┴─────────────┐          │
│                           │  Systems Manager         │          │
│                           │  Parameter Store         │          │
│                           │  (Secrets/Config)        │          │
│                           └──────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technology Stack

### Frontend (UI)
```
├── React 18 + TypeScript
├── Vite (Build Tool)
├── TailwindCSS (Styling)
├── React Router (Navigation)
├── Axios (HTTP Client)
├── Recharts (Data Visualization)
├── Nginx (Web Server)
└── Port: 3001
```

### Backend (API)
```
├── Python 3.12
├── FastAPI (Web Framework)
├── SQLAlchemy (ORM)
├── PostgreSQL (Database)
├── Pydantic (Data Validation)
├── JWT (Authentication)
├── Gunicorn + Uvicorn (ASGI Server)
└── Port: 80
```

### DevOps & Infrastructure
```
├── Docker (Containerization)
├── AWS ECS Fargate (Container Orchestration)
├── AWS ECR (Container Registry)
├── AWS CodePipeline (CI/CD)
├── AWS CodeBuild (Build Service)
├── AWS ALB (Load Balancer)
├── AWS RDS (Managed Database)
├── AWS CloudWatch (Monitoring & Logs)
└── AWS Systems Manager (Secrets Management)
```

---

## 📊 Application Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  React Components                                            │
│  ├── Layout (Sidebar, Header, Footer)                       │
│  ├── Pages                                                   │
│  │   ├── Dashboard                                          │
│  │   ├── Referrals                                          │
│  │   ├── Counselors (Referees)                             │
│  │   ├── Universities                                       │
│  │   ├── Leaderboard                                        │
│  │   ├── Rewards                                            │
│  │   ├── Analytics                                          │
│  │   └── Settings                                           │
│  └── Components (Tables, Forms, Charts, Modals)             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER (FastAPI)                     │
├─────────────────────────────────────────────────────────────┤
│  Routes (API Endpoints)                                      │
│  ├── /api/v1/auth         (Login, Register, Token)         │
│  ├── /api/v1/users        (User Management)                │
│  ├── /api/v1/universities (University CRUD)                │
│  ├── /api/v1/programs     (Program CRUD)                   │
│  ├── /api/v1/referrals    (Referral Management)            │
│  ├── /api/v1/rewards      (Reward Management)              │
│  ├── /api/v1/leaderboard  (Rankings & Stats)               │
│  ├── /api/v1/analytics    (Dashboard & Reports)            │
│  └── /api/v1/notifications(Notification System)            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                      │
├─────────────────────────────────────────────────────────────┤
│  Controllers (Request Handling)                              │
│  └── Map requests to services                               │
│                                                              │
│  Services (Business Logic)                                   │
│  ├── AuthService         (JWT, Password Hashing)           │
│  ├── UserService         (User Management)                 │
│  ├── UniversityService   (University Operations)           │
│  ├── ProgramService      (Program Operations)              │
│  ├── ReferralService     (Referral Workflow)               │
│  ├── RewardService       (Reward Calculation)              │
│  ├── LeaderboardService  (Rankings with Cache)             │
│  └── AnalyticsService    (Stats & Metrics with Cache)      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  SQLAlchemy ORM                                              │
│  ├── Models (Database Entities)                             │
│  │   ├── User                                               │
│  │   ├── University                                         │
│  │   ├── Program                                            │
│  │   ├── Referral                                           │
│  │   ├── Reward                                             │
│  │   └── Notification                                       │
│  │                                                           │
│  ├── Connection Pooling (QueuePool)                         │
│  ├── Query Optimization (joinedload, subqueryload)          │
│  └── Caching (In-Memory LRU Cache)                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database (AWS RDS)                               │
│  ├── Tables: users, universities, programs, referrals       │
│  │           rewards, notifications, etc.                   │
│  ├── Indexes: Optimized for query performance              │
│  └── Relationships: Foreign Keys & Joins                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Architecture

```
┌──────────────────────────────────────────────────────┐
│                  Security Layers                      │
├──────────────────────────────────────────────────────┤
│                                                       │
│  1. Network Security                                 │
│     ├── ALB with SSL/TLS (HTTPS)                    │
│     ├── VPC with Private Subnets                    │
│     └── Security Groups (Port Restrictions)         │
│                                                       │
│  2. Application Security                             │
│     ├── JWT Authentication                           │
│     ├── Role-Based Access Control (RBAC)            │
│     ├── Password Hashing (bcrypt)                   │
│     ├── CORS Configuration                          │
│     └── Request Validation (Pydantic)               │
│                                                       │
│  3. Container Security                               │
│     ├── Non-root User Execution                     │
│     ├── Multi-stage Docker Builds                   │
│     ├── Minimal Base Images (alpine, slim)          │
│     └── No Secrets in Images                        │
│                                                       │
│  4. Secrets Management                               │
│     ├── AWS Systems Manager Parameter Store         │
│     ├── Environment Variable Injection              │
│     └── No Hardcoded Credentials                    │
│                                                       │
│  5. HTTP Security Headers                            │
│     ├── X-Frame-Options: SAMEORIGIN                 │
│     ├── X-Content-Type-Options: nosniff             │
│     ├── Content-Security-Policy                     │
│     └── Referrer-Policy                             │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## 📈 Performance Optimizations

```
┌──────────────────────────────────────────────────────┐
│            Performance Features                       │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Backend:                                            │
│  ├── Query Optimization (N+1 fixes)                 │
│  ├── Eager Loading (joinedload, subqueryload)       │
│  ├── In-Memory Caching (Dashboard, Leaderboard)     │
│  ├── Connection Pooling (20 + 30 overflow)          │
│  ├── Multiple Workers (4 Gunicorn workers)          │
│  └── Async Endpoints                                 │
│                                                       │
│  Frontend:                                           │
│  ├── Code Splitting (Vite)                          │
│  ├── Static Asset Caching (Nginx)                   │
│  ├── Gzip Compression                                │
│  └── CDN-ready (CloudFront compatible)              │
│                                                       │
│  Infrastructure:                                      │
│  ├── Auto-scaling (ECS Service)                     │
│  ├── Health Checks (ALB + Container)                │
│  └── CloudWatch Monitoring                          │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

```
User Browser
    │
    │ 1. HTTP Request (GET /dashboard)
    ▼
┌─────────────┐
│   ALB       │  (Load Balancer)
└──────┬──────┘
       │ 2. Route to UI Container
       ▼
┌─────────────┐
│ UI Service  │  (Nginx + React)
│ Port: 3001  │
└──────┬──────┘
       │ 3. Serve index.html
       │
       │ 4. React App Loads
       │
       │ 5. API Call (GET /api/v1/analytics/dashboard)
       ▼
┌─────────────┐
│ ALB         │
└──────┬──────┘
       │ 6. Route to API Container
       ▼
┌─────────────────┐
│  API Service    │  (FastAPI + Gunicorn)
│  Port: 80       │
│                 │
│  ┌───────────┐  │  7. Authenticate JWT
│  │ Middleware│  │
│  └─────┬─────┘  │
│        │        │  8. Route to Controller
│  ┌─────▼──────┐ │
│  │Controller  │ │
│  └─────┬──────┘ │
│        │        │  9. Call Service
│  ┌─────▼──────┐ │
│  │ Service    │ │
│  │ (Cache?)   │ │
│  └─────┬──────┘ │
└────────┼────────┘
         │ 10. Query Database
         ▼
┌──────────────────┐
│   PostgreSQL     │
│   (RDS)          │
└────────┬─────────┘
         │ 11. Return Data
         │
         │ 12. Response flows back up
         │     (Service → Controller → FastAPI)
         │
         │ 13. JSON Response
         ▼
    User Browser
```

---

## 📦 Deployment Architecture (CI/CD)

```
Developer
    │
    │ 1. git push origin dev
    ▼
┌──────────────────┐
│  CodeCommit      │  (Git Repository)
│  (Git Repo)      │
└────────┬─────────┘
         │ 2. Trigger Pipeline
         ▼
┌──────────────────┐
│  CodePipeline    │  (Orchestration)
│  ├─ Source       │
│  ├─ Build        │
│  └─ Deploy       │
└────────┬─────────┘
         │ 3. Start Build
         ▼
┌──────────────────┐
│  CodeBuild       │  (Docker Build)
│  ├─ cd frontend  │
│  │  docker build │
│  │  push to ECR  │
│  │               │
│  ├─ cd backend   │
│  │  docker build │
│  │  push to ECR  │
└────────┬─────────┘
         │ 4. Images in ECR
         ▼
┌──────────────────┐
│  ECR             │  (Container Registry)
│  ├─ UI Image     │
│  └─ API Image    │
└────────┬─────────┘
         │ 5. Deploy to ECS
         ▼
┌──────────────────┐
│  ECS Fargate     │  (Container Service)
│  ├─ UI Service   │
│  │  └─ Task Def  │
│  │                │
│  └─ API Service  │
│     └─ Task Def  │
└────────┬─────────┘
         │ 6. Register with ALB
         ▼
┌──────────────────┐
│  ALB             │  (Traffic Routing)
│  ├─ UI:3001     │
│  └─ API:80      │
└──────────────────┘
         │
         ▼
    Live Application
```

---

## 📊 Database Schema (Key Tables)

```
┌─────────────────────────────────────────────────────────┐
│                     users                                │
├─────────────────────────────────────────────────────────┤
│ id, email, name, password_hash, role, phone             │
│ created_at, updated_at                                  │
└──────────────┬──────────────────────────────────────────┘
               │
      ┌────────┴──────┬─────────────┬──────────────┐
      │               │             │              │
      ▼               ▼             ▼              ▼
┌────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│universities│  │ programs │  │referrals │  │ rewards  │
├────────────┤  ├──────────┤  ├──────────┤  ├──────────┤
│ id, name   │  │ id, name │  │ id       │  │ id       │
│ location   │  │ fees     │  │ referee_*│  │ amount   │
│ logo_url   │◄─┤ univ_id  │◄─┤ program_*│  │ status   │
│ status     │  │ duration │  │ counselor│  │ referral │
└────────────┘  └──────────┘  │ status   │  └──────────┘
                              │ assigned │
                              └──────────┘
```

---

## 📁 Project Structure

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/         # Sidebar, Header, Footer
│   │   ├── common/         # Reusable components
│   │   └── forms/          # Form components
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Referrals.tsx
│   │   ├── Counselors.tsx
│   │   ├── Universities.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── Rewards.tsx
│   │   ├── Analytics.tsx
│   │   └── Settings.tsx
│   ├── lib/
│   │   ├── api/            # API client
│   │   └── utils/          # Utility functions
│   └── types/              # TypeScript types
├── Dockerfile
├── nginx.conf
├── buildspec.yml
└── package.json
```

### Backend Structure
```
backend/
├── app/
│   ├── api/
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── universities.py
│   │       ├── programs.py
│   │       ├── referrals.py
│   │       ├── rewards.py
│   │       ├── leaderboard.py
│   │       ├── analytics.py
│   │       └── notifications.py
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   ├── models/             # Database models
│   ├── schemas/            # Pydantic schemas
│   ├── core/
│   │   ├── cache.py
│   │   ├── exceptions.py
│   │   └── logging.py
│   ├── config.py
│   ├── database.py
│   ├── dependencies.py
│   └── main.py
├── Dockerfile
├── buildspec.yml
└── requirements.txt
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/profile` - Get user profile

### Users
- `GET /api/v1/users` - List users
- `GET /api/v1/users/{id}` - Get user by ID
- `POST /api/v1/users` - Create user
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user

### Universities
- `GET /api/v1/universities` - List universities
- `GET /api/v1/universities/{id}` - Get university
- `POST /api/v1/universities` - Create university
- `PUT /api/v1/universities/{id}` - Update university
- `DELETE /api/v1/universities/{id}` - Delete university

### Programs
- `GET /api/v1/programs` - List programs
- `GET /api/v1/programs/{id}` - Get program
- `POST /api/v1/programs` - Create program
- `PUT /api/v1/programs/{id}` - Update program
- `DELETE /api/v1/programs/{id}` - Delete program

### Referrals
- `GET /api/v1/referrals` - List referrals
- `GET /api/v1/referrals/{id}` - Get referral
- `POST /api/v1/referrals` - Create referral
- `PUT /api/v1/referrals/{id}` - Update referral
- `PUT /api/v1/referrals/{id}/status` - Update status
- `DELETE /api/v1/referrals/{id}` - Delete referral

### Rewards
- `GET /api/v1/rewards` - List rewards
- `GET /api/v1/rewards/{id}` - Get reward
- `PUT /api/v1/rewards/{id}/status` - Update reward status

### Leaderboard
- `GET /api/v1/leaderboard` - Get leaderboard
- `GET /api/v1/leaderboard/my-rank` - Get current user rank

### Analytics
- `GET /api/v1/analytics/dashboard` - Dashboard stats
- `GET /api/v1/analytics/referrals` - Referral analytics

### Health Checks
- `GET /health` - Full health check (DB + API)
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe

---

## 🔑 Environment Variables

### Frontend (UI)
```json
{
  "VITE_API_URL": "http://your-backend-alb-url"
}
```

### Backend (API)
```json
{
  "DATABASE_HOST": "your-rds-endpoint",
  "DATABASE_PORT": "5432",
  "DATABASE_NAME": "referral",
  "DATABASE_USER": "postgres",
  "DATABASE_PASSWORD": "your-db-password",
  "JWT_SECRET_KEY": "your-jwt-secret",
  "JWT_ALGORITHM": "HS256",
  "ACCESS_TOKEN_EXPIRE_MINUTES": "60",
  "REFRESH_TOKEN_EXPIRE_DAYS": "7",
  "DEBUG": "False",
  "ENVIRONMENT": "production",
  "CORS_ORIGINS": "http://your-frontend-alb-url",
  "LOG_LEVEL": "INFO"
}
```

---

## 📏 Resource Specifications

### Container Resources

#### Frontend (UI)
- **CPU**: 0.25 vCPU (256)
- **Memory**: 512 MB
- **Port**: 3001
- **Image Size**: ~50-80 MB

#### Backend (API)
- **CPU**: 0.5 vCPU (512)
- **Memory**: 1024 MB
- **Port**: 80
- **Workers**: 4 Gunicorn workers
- **Image Size**: ~200-300 MB

### Source Code Size
- **Frontend Source**: ~721 KB (122 files)
- **Backend Source**: ~219 KB (61 files)
- **Total Source Code**: ~1 MB (183 files)

---

## 🔍 Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Counselor, Referrer)
- Secure password hashing (bcrypt)
- Token refresh mechanism

### Referral Management
- Submit and track referrals
- Status workflow (Pending → Approved → Enrolled)
- Counselor assignment
- University and program selection

### Rewards System
- Automatic reward calculation
- Reward approval workflow
- Disbursement tracking
- Commission structure

### Analytics & Reporting
- Dashboard with key metrics
- Referral conversion analytics
- Performance tracking
- Leaderboard rankings

### Performance Features
- Query optimization (N+1 prevention)
- In-memory caching
- Connection pooling
- Async operations
- Database indexing

### Security Features
- HTTPS/TLS encryption
- CORS configuration
- Security headers
- Input validation
- SQL injection prevention
- XSS protection

---

## 🚀 Deployment Process

1. **Code Commit**: Developer pushes to `dev` branch
2. **Pipeline Trigger**: CodePipeline detects changes
3. **Build Phase**: CodeBuild runs buildspec files
   - Frontend: `cd frontend` → Docker build → Push to ECR
   - Backend: `cd backend` → Docker build → Push to ECR
4. **Deploy Phase**: ECS updates services with new images
5. **Health Checks**: ALB verifies containers are healthy
6. **Traffic Routing**: ALB routes traffic to new containers

---

## 📊 Monitoring & Logging

### CloudWatch Logs
- Application logs (stdout/stderr)
- Access logs (Nginx, Gunicorn)
- Error logs

### CloudWatch Metrics
- CPU utilization
- Memory utilization
- Request count
- Response time
- Error rate

### Health Checks
- **Liveness**: `/health/live` - Is the app running?
- **Readiness**: `/health/ready` - Can it handle requests?
- **Full Health**: `/health` - Database connectivity

---

## 🛠️ Maintenance & Scaling

### Auto-scaling
- ECS Service auto-scaling based on CPU/Memory
- Target tracking scaling policies
- Min/Max task count configuration

### Database Maintenance
- RDS automated backups
- Multi-AZ deployment for HA
- Read replicas for read-heavy workloads

### Updates & Rollbacks
- Blue/Green deployments
- Rolling updates
- Quick rollback capability

---

## 📚 Additional Resources

- **API Documentation**: `/docs` (Swagger UI)
- **Alternative Docs**: `/redoc` (ReDoc)
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Source Repository**: AWS CodeCommit

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintained By**: TeamLease EdTech Development Team

