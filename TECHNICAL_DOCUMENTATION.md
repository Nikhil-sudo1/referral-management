# TeamLease EdTech Referral Portal - Technical Documentation

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Author:** Development Team  
**Classification:** Internal Use

---

## 📋 Table of Contents

1. [Overview / Introduction](#1-overview--introduction)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Application Flow](#4-application-flow)
5. [Environment Details](#5-environment-details)
6. [Configuration & Environment Variables](#6-configuration--environment-variables)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [API Documentation](#8-api-documentation)
9. [Database Design](#9-database-design)
10. [Frontend Structure](#10-frontend-structure)
11. [Backend Structure](#11-backend-structure)
12. [Deployment & Setup Guide](#12-deployment--setup-guide)
13. [CI/CD Pipeline](#13-cicd-pipeline)
14. [Logging & Monitoring](#14-logging--monitoring)
15. [Security Measures](#15-security-measures)
16. [Performance & Scalability](#16-performance--scalability)
17. [Backup & Disaster Recovery](#17-backup--disaster-recovery)
18. [Known Issues & Limitations](#18-known-issues--limitations)
19. [Maintenance & Operations](#19-maintenance--operations)
20. [Troubleshooting Guide](#20-troubleshooting-guide)
21. [Change Log / Version History](#21-change-log--version-history)
22. [Contact & Ownership](#22-contact--ownership)

---

## 1️⃣ Overview / Introduction

### 1.1 Purpose of the Document

This document provides comprehensive technical documentation for the **TeamLease EdTech Referral Portal**, covering system architecture, deployment procedures, maintenance guidelines, and troubleshooting information. It serves as the primary technical reference for developers, DevOps engineers, and system administrators.

### 1.2 What the Application Does

The TeamLease EdTech Referral Portal is a comprehensive web-based referral management system designed to streamline the student referral process for educational institutions. It enables:

- **Referral Submission**: Users can submit student referrals for various university programs
- **Counselor Assignment**: Automatic and manual assignment of referrals to counselors
- **Status Tracking**: Real-time tracking of referral status from submission to admission
- **Reward Management**: Automated calculation and disbursement of rewards based on tiered system
- **Analytics & Reporting**: Comprehensive analytics dashboards for all stakeholders
- **Leaderboard**: Gamified experience with performance leaderboards

### 1.3 Target Users

| User Role | Description | Key Features |
|-----------|-------------|--------------|
| **Super Admin** | System administrators with full access | User management, system configuration, analytics |
| **Manager** | Team managers overseeing operations | Team analytics, referral management, reporting |
| **Counselor** | University counselors managing referrals | Assigned referrals, status updates, communication |
| **Referrer** | External referrers submitting leads | Referral submission, reward tracking, leaderboard |

### 1.4 Problem It Solves

**Challenges Addressed:**
- Manual referral tracking across spreadsheets
- Inconsistent reward calculation and disbursement
- Lack of real-time visibility into referral pipeline
- Poor communication between referrers and counselors
- Difficulty in managing multiple universities and programs
- No standardized performance metrics

**Solution Provided:**
- Centralized digital platform for all referral activities
- Automated reward calculation with tiered multipliers
- Real-time status updates and notifications
- Role-based access and automated workflows
- Multi-university support with program management
- Advanced analytics and performance dashboards

### 1.5 High-Level Functionality

```
┌─────────────────────────────────────────────────────────────────┐
│                    Referral Portal Workflow                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Referrer → Submit Referral → Counselor Assignment →             │
│  Contact Student → Admission Decision → Reward Calculation →     │
│  Reward Approval → Reward Disbursement                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Core Modules:**
1. **Authentication & User Management**: Secure login, role-based access control
2. **Referral Management**: Submit, track, and manage student referrals
3. **University & Program Management**: Configure partner universities and programs
4. **Reward System**: Tiered reward calculation and disbursement
5. **Analytics & Reporting**: Comprehensive dashboards and exports
6. **Notification System**: Real-time notifications for all stakeholders

---

## 2️⃣ System Architecture

### 2.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Web Browser (Chrome, Firefox, Safari, Edge)                         │
│  React SPA with TypeScript + Vite                                    │
│                                                                        │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             │ HTTPS / REST API
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                      PRESENTATION LAYER                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Nginx (Static File Serving + Reverse Proxy)                         │
│  - Port 80/443                                                        │
│  - SSL/TLS Termination                                                │
│  - Static Asset Caching                                               │
│                                                                        │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                      APPLICATION LAYER                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  FastAPI Backend (Python 3.12)                                       │
│  - Port 8000                                                          │
│  - JWT Authentication                                                 │
│  - RESTful API Endpoints                                              │
│  - Business Logic Layer                                               │
│  - SQLAlchemy ORM                                                     │
│                                                                        │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             │ Database Connection Pool
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                         DATA LAYER                                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  PostgreSQL 15                                                        │
│  - Port 5432                                                          │
│  - Relational Database                                                │
│  - Connection Pooling                                                 │
│  - Transaction Management                                             │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 AWS ECS Architecture (Production)

```
                                    Internet
                                       │
                                       ▼
                            ┌──────────────────┐
                            │   CloudFront      │
                            │   (CDN - Optional)│
                            └─────────┬─────────┘
                                      │
                                      ▼
                        ┌────────────────────────┐
                        │  Application Load      │
                        │  Balancer (ALB)        │
                        │  - Health Checks       │
                        │  - SSL Termination     │
                        └────────┬───────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
    ┌─────────────────────┐        ┌─────────────────────┐
    │  ECS Fargate         │        │  ECS Fargate         │
    │  Service (UI)        │        │  Service (API)       │
    │  - Port 80           │        │  - Port 8000         │
    │  - Nginx Container   │        │  - Python Container  │
    │  - Auto-scaling      │        │  - Auto-scaling      │
    └──────────────────────┘        └────────┬─────────────┘
                                             │
                                             ▼
                                  ┌───────────────────┐
                                  │  RDS PostgreSQL    │
                                  │  - Multi-AZ        │
                                  │  - Automated       │
                                  │    Backups         │
                                  └───────────────────┘
```

### 2.3 Component Responsibilities

| Component | Responsibility | Technology |
|-----------|---------------|------------|
| **Frontend** | User interface, client-side logic, routing | React 18, TypeScript, Vite |
| **Nginx** | Static file serving, reverse proxy, load balancing | Nginx 1.25 |
| **Backend API** | Business logic, authentication, data processing | FastAPI, Python 3.12 |
| **Database** | Data persistence, integrity, queries | PostgreSQL 15 |
| **Load Balancer** | Traffic distribution, health checks, SSL | AWS ALB |
| **ECS Fargate** | Container orchestration, auto-scaling | AWS ECS |
| **ECR** | Docker image repository | AWS ECR |
| **CloudWatch** | Logging, monitoring, alerting | AWS CloudWatch |
| **SSM Parameter Store** | Secrets management | AWS Systems Manager |

---

## 3️⃣ Technology Stack

### 3.1 Complete Technology Matrix

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend Framework** | React | 18.3.1 | UI component library |
| **UI Components** | Radix UI + shadcn/ui | Latest | Accessible component system |
| **State Management** | React Query | 5.83.0 | Server state management |
| **Routing** | React Router | 6.30.1 | Client-side routing |
| **Styling** | TailwindCSS | 3.4.17 | Utility-first CSS |
| **Form Handling** | React Hook Form | 7.61.1 | Form validation |
| **Schema Validation** | Zod | 3.25.76 | Runtime type checking |
| **Charts** | Recharts | 2.15.4 | Data visualization |
| **HTTP Client** | Axios | 1.13.2 | API communication |
| **Build Tool** | Vite | 7.2.6 | Fast build tool |
| **Language** | TypeScript | 5.8.3 | Type-safe JavaScript |
| **Backend Framework** | FastAPI | 0.109.2 | Modern Python web framework |
| **ASGI Server** | Uvicorn | 0.27.1 | ASGI server |
| **ORM** | SQLAlchemy | 2.0.25 | Database ORM |
| **Database** | PostgreSQL | 15 | Relational database |
| **Database Driver** | psycopg2-binary | 2.9.9 | PostgreSQL adapter |
| **Authentication** | python-jose | 3.3.0 | JWT implementation |
| **Password Hashing** | bcrypt | 4.1.2 | Secure password hashing |
| **Validation** | Pydantic | 2.6.1 | Data validation |
| **Migration** | Alembic | 1.13.1 | Database migrations |
| **Logging** | Loguru | 0.7.2 | Advanced logging |
| **Web Server** | Nginx | 1.25 (Alpine) | Reverse proxy, static files |
| **Container** | Docker | 24+ | Containerization |
| **Orchestration** | AWS ECS Fargate | - | Container orchestration |
| **Load Balancer** | AWS ALB | - | Application load balancing |
| **CDN** | CloudFront (Optional) | - | Content delivery |
| **Cloud Provider** | AWS | - | Cloud infrastructure |
| **CI/CD** | AWS CodePipeline | - | Continuous deployment |
| **Build Service** | AWS CodeBuild | - | Build automation |
| **Image Registry** | AWS ECR | - | Docker image storage |
| **Secrets** | AWS SSM Parameter Store | - | Secrets management |
| **Monitoring** | AWS CloudWatch | - | Logging and monitoring |

### 3.2 Development Tools

| Tool | Purpose |
|------|---------|
| **Node.js** | JavaScript runtime (v18+) |
| **npm** | Package manager |
| **Python** | Backend language (v3.12+) |
| **pip** | Python package manager |
| **Git** | Version control |
| **AWS CLI** | AWS management |
| **Docker** | Local containerization |
| **VS Code / Cursor** | IDE |

---

## 4️⃣ Application Flow

### 4.1 User Authentication Flow

```
┌────────────┐
│   Browser  │
└─────┬──────┘
      │
      │ 1. Login Request (POST /api/v1/auth/login)
      │    { email, password, role }
      ▼
┌──────────────────┐
│   FastAPI        │
│   Auth Endpoint  │
└─────┬────────────┘
      │
      │ 2. Validate Credentials
      ▼
┌──────────────────┐
│   Database       │
│   (users table)  │
└─────┬────────────┘
      │
      │ 3. User Found & Password Match
      ▼
┌──────────────────┐
│   JWT Token      │
│   Generation     │
└─────┬────────────┘
      │
      │ 4. Return Token + User Data
      ▼
┌────────────┐
│   Browser  │
│   (Store)  │
└────────────┘
```

### 4.2 Referral Submission Flow

```
User → Fills Referral Form → Validate Input → Check Duplicate →
Create Referral Record → Generate Referral Code → Calculate Expected Reward →
Send Notifications (Referrer, Admin) → Auto-assign Counselor (if enabled) →
Return Success Response
```

**Detailed Steps:**

1. **User Input**: Referrer provides referee details and selects university/program
2. **Frontend Validation**: Zod schema validates form data
3. **API Request**: POST /api/v1/referrals with referral data
4. **Backend Validation**: Pydantic schema validates request
5. **Duplicate Check**: Check if referee email exists for same program
6. **Database Insert**: Create referral record with status "submitted"
7. **Code Generation**: Auto-generate unique referral code (UNI-PROG-XXXXX)
8. **Reward Calculation**: Calculate expected reward based on program and tier
9. **Notification**: Create notifications for relevant parties
10. **Auto-assignment**: Optionally assign to available counselor
11. **Response**: Return referral details with tracking code

### 4.3 Request → Response Lifecycle

```
Client Request
    ↓
Nginx (Port 80)
    ↓
Route to Backend (Port 8000) OR Serve Static Files
    ↓
FastAPI Application
    ↓
Middleware (CORS, Authentication)
    ↓
Route Handler
    ↓
Controller Layer (Business Logic)
    ↓
Service Layer (Data Operations)
    ↓
SQLAlchemy ORM
    ↓
PostgreSQL Database
    ↓
Response Back Through Layers
    ↓
JSON Response to Client
```

### 4.4 Authentication Flow Details

**Login Process:**
1. User submits credentials (email, password, role)
2. Backend validates email format and required fields
3. Query database for user with matching email and role
4. Verify password using bcrypt hash comparison
5. Generate JWT access token (expires in 60 minutes)
6. Generate refresh token (expires in 7 days)
7. Update last_login_at timestamp
8. Return tokens and user profile data

**Protected Route Access:**
1. Client includes token in Authorization header: `Bearer <token>`
2. FastAPI dependency extracts token from header
3. Decode and verify JWT signature using secret key
4. Check token expiration
5. Extract user_id from token payload
6. Query database for current user data
7. Inject user object into route handler
8. Process request with authenticated user context

### 4.5 Error Handling Flow

```
Error Occurs
    ↓
Application Exception (AppException)
    ↓
Exception Handler
    ↓
Log Error (CloudWatch)
    ↓
Format Error Response
    ↓
Return JSON { success: false, message, errors }
    ↓
Client Displays Error
```

---

## 5️⃣ Environment Details

### 5.1 Environment Matrix

| Environment | URL | Purpose | Infrastructure |
|------------|-----|---------|----------------|
| **Development** | http://localhost:8080 | Local development and testing | Docker Compose on developer machine |
| **Staging** | https://stage.referral.teamlease.com | Pre-production testing | AWS ECS Fargate (ap-south-1) |
| **Production** | https://referral.teamlease.com | Live user environment | AWS ECS Fargate (ap-south-1) |

### 5.2 Development Environment

**Access:**
- Frontend: http://localhost:8080 or http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database: localhost:5432

**Setup:**
- Docker Compose OR separate terminal sessions
- PostgreSQL database (local or Docker)
- Hot reload enabled for both frontend and backend

### 5.3 Production Environment

**Infrastructure:**
- **Cluster**: hackathon (ECS)
- **Region**: ap-south-1 (Mumbai)
- **UI Service**: dev-referral-mgmt-ui-service
- **API Service**: dev-referral-mgmt-apii-service
- **Database**: RDS PostgreSQL Multi-AZ

**Access Points:**
- UI: Via ALB DNS
- API: Via ALB DNS:8000
- Database: RDS endpoint (private subnet)

---

## 6️⃣ Configuration & Environment Variables

### 6.1 Backend Environment Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `DATABASE_HOST` | PostgreSQL host | Yes | localhost | db.example.com |
| `DATABASE_PORT` | PostgreSQL port | Yes | 5432 | 5432 |
| `DATABASE_NAME` | Database name | Yes | referral | referral_db |
| `DATABASE_USER` | Database username | Yes | postgres | app_user |
| `DATABASE_PASSWORD` | Database password | Yes | - | StrongPass123! |
| `JWT_SECRET_KEY` | JWT signing key | Yes | - | 32+ character secret |
| `JWT_ALGORITHM` | JWT algorithm | No | HS256 | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry | No | 60 | 60 |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token expiry | No | 7 | 7 |
| `CORS_ORIGINS` | Allowed CORS origins | Yes | - | https://app.com,https://www.app.com |
| `DEBUG` | Debug mode | No | false | true/false |
| `ENVIRONMENT` | Environment name | No | production | development/staging/production |
| `LOG_LEVEL` | Logging level | No | INFO | DEBUG/INFO/WARNING/ERROR |

### 6.2 Frontend Environment Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `VITE_API_URL` | Backend API base URL | Yes | - | http://localhost:8000/api/v1 |

**Note:** Frontend variables are baked into the build at build-time.

### 6.3 AWS SSM Parameters (Production)

Sensitive configuration stored in AWS Systems Manager Parameter Store:

| Parameter Path | Type | Description |
|---------------|------|-------------|
| `/referral/dev/db-host` | String | RDS endpoint |
| `/referral/dev/db-password` | SecureString | Database password |
| `/referral/dev/jwt-secret` | SecureString | JWT secret key (min 32 chars) |
| `/referral/dev/cors-origins` | String | Allowed CORS origins |
| `/referral/dev/api-url` | String | API URL for UI build |

### 6.4 Configuration Files

**Backend:** `.env` file in backend directory
```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=referral_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
JWT_SECRET_KEY=your-super-secret-key-min-32-characters
CORS_ORIGINS=http://localhost:8080,http://localhost:5173
DEBUG=true
ENVIRONMENT=development
```

**Frontend:** `.env` file in frontend directory
```bash
VITE_API_URL=http://localhost:8000/api/v1
```

⚠️ **Security Note:** Never commit `.env` files to version control. Use `.env.example` templates.

---

## 7️⃣ Authentication & Authorization

### 7.1 Authentication Method

**JWT (JSON Web Token) Based Authentication**

- **Access Token**: Short-lived (60 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to obtain new access tokens
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Token Format**: Bearer token in Authorization header

**Token Payload:**
```json
{
  "sub": "user_id_uuid",
  "email": "user@example.com",
  "role": "admin",
  "exp": 1702934400,
  "iat": 1702930800,
  "type": "access"
}
```

### 7.2 User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **super_admin** | System administrator | Full access to all features and data |
| **manager** | Team manager | Manage team members, view all referrals, analytics |
| **counselor** | University counselor | View assigned referrals, update status, communicate |
| **referrer** | External referrer | Submit referrals, view own referrals, track rewards |

### 7.3 Permission Model

**Role-Based Access Control (RBAC)**

```python
# Permission Matrix
Permissions = {
    "super_admin": ["*"],  # All permissions
    "manager": [
        "view:all_referrals",
        "view:all_users",
        "create:referral",
        "update:referral",
        "assign:counselor",
        "view:analytics",
        "export:data"
    ],
    "counselor": [
        "view:assigned_referrals",
        "update:referral_status",
        "view:own_analytics",
        "communicate:referee"
    ],
    "referrer": [
        "create:referral",
        "view:own_referrals",
        "view:own_rewards",
        "view:leaderboard",
        "withdraw:rewards"
    ]
}
```

### 7.4 Protected Routes

**Frontend Route Protection:**
```typescript
// Protected by role
<ProtectedRoute allowedRoles={["super_admin", "manager"]}>
  <AdminDashboard />
</ProtectedRoute>
```

**Backend Endpoint Protection:**
```python
@router.get("/users")
async def get_users(
    current_user: User = Depends(get_current_active_user),
    _: None = Depends(require_roles(["super_admin", "manager"]))
):
    # Only super_admin and manager can access
    ...
```

### 7.5 Password Policy

- **Minimum Length**: 8 characters
- **Complexity**: No specific requirements (can be enhanced)
- **Hashing Algorithm**: bcrypt with 12 rounds
- **Password Reset**: Time-limited token (24 hours)
- **Failed Login Attempts**: Currently not limited (can be implemented)

### 7.6 Session Management

- **Session Type**: Stateless JWT
- **Token Storage**: LocalStorage on client (HttpOnly cookies recommended for production)
- **Token Refresh**: Automatic refresh before expiration
- **Logout**: Client-side token deletion (token blacklist can be implemented)

---

## 8️⃣ API Documentation

### 8.1 Base URLs

| Environment | Base URL |
|------------|----------|
| Development | http://localhost:8000/api/v1 |
| Production | https://api.referral.teamlease.com/api/v1 |

### 8.2 Authentication

All protected endpoints require Bearer token:
```
Authorization: Bearer <jwt_access_token>
```

### 8.3 Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 8.4 Core API Endpoints

#### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | User login | No |
| POST | `/auth/register` | Register referrer | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | Logout user | Yes |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |

#### User Management Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/users` | List all users | super_admin, manager |
| POST | `/users` | Create user | super_admin |
| GET | `/users/{id}` | Get user details | super_admin, manager |
| PUT | `/users/{id}` | Update user | super_admin |
| DELETE | `/users/{id}` | Delete user | super_admin |
| GET | `/users/counselors` | List counselors | All authenticated |
| GET | `/users/referrers` | List referrers | super_admin, manager |

#### University & Program Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/universities` | List universities | All |
| POST | `/universities` | Create university | super_admin, manager |
| GET | `/universities/{id}` | Get university details | All |
| PUT | `/universities/{id}` | Update university | super_admin, manager |
| DELETE | `/universities/{id}` | Delete university | super_admin |
| GET | `/universities/{id}/programs` | List programs | All |
| POST | `/universities/{id}/programs` | Create program | super_admin, manager |
| GET | `/programs` | List all programs | All |
| GET | `/programs/{id}` | Get program details | All |
| PUT | `/programs/{id}` | Update program | super_admin, manager |
| DELETE | `/programs/{id}` | Delete program | super_admin |

#### Referral Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/referrals` | List referrals (filtered by role) | All |
| POST | `/referrals` | Create referral | super_admin, manager |
| POST | `/referrals/submit` | Submit referral (as referrer) | referrer |
| GET | `/referrals/{id}` | Get referral details | All |
| PUT | `/referrals/{id}` | Update referral | super_admin, manager |
| PATCH | `/referrals/{id}/status` | Update status | super_admin, manager, counselor |
| POST | `/referrals/{id}/assign` | Assign counselor | super_admin, manager |
| GET | `/referrals/my-referrals` | Get own referrals | referrer |
| GET | `/referrals/assigned` | Get assigned referrals | counselor |
| GET | `/referrals/stats` | Get statistics | All |

#### Reward Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/rewards` | List rewards | super_admin, manager |
| POST | `/rewards` | Create reward | super_admin, manager |
| GET | `/rewards/{id}` | Get reward details | super_admin, manager |
| PATCH | `/rewards/{id}/approve` | Approve reward | super_admin, manager |
| PATCH | `/rewards/{id}/disburse` | Disburse reward | super_admin |
| PATCH | `/rewards/{id}/cancel` | Cancel reward | super_admin |
| GET | `/rewards/my-rewards` | Get own rewards | referrer, counselor |
| GET | `/rewards/tiers` | Get reward tiers | All |

#### Analytics Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/analytics/dashboard` | Dashboard stats | super_admin, manager |
| GET | `/analytics/referrals` | Referral analytics | super_admin, manager |
| GET | `/analytics/rewards` | Reward analytics | super_admin, manager |
| GET | `/analytics/universities` | University analytics | super_admin, manager |
| GET | `/analytics/my-analytics` | Personal analytics | referrer, counselor |

#### Leaderboard Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/leaderboard/referrers` | Referrer leaderboard | All |
| GET | `/leaderboard/counselors` | Counselor leaderboard | super_admin, manager |
| GET | `/leaderboard/my-rank` | Get own rank | referrer, counselor |

### 8.5 Sample API Requests

**Login:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@teamlease.com",
    "password": "admin123",
    "role": "admin"
  }'
```

**Submit Referral:**
```bash
curl -X POST http://localhost:8000/api/v1/referrals/submit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "referee_name": "John Doe",
    "referee_email": "john@example.com",
    "referee_phone": "+911234567890",
    "university_id": "uuid",
    "program_id": "uuid"
  }'
```

### 8.6 API Documentation Access

- **Swagger UI**: http://localhost:8000/docs (Development only)
- **ReDoc**: http://localhost:8000/redoc (Development only)
- **OpenAPI JSON**: http://localhost:8000/openapi.json (Development only)

⚠️ API documentation endpoints are disabled in production for security.

---

## 9️⃣ Database Design

### 9.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌──────────────────┐
│  universities   │◄──────┤    programs      │
│                 │       │                  │
│  id (PK)        │       │  id (PK)         │
│  name           │       │  university_id   │
│  code           │       │  name            │
│  status         │       │  reward_amount   │
└────────┬────────┘       └────────┬─────────┘
         │                         │
         │                         │
         │  ┌──────────────────────┘
         │  │
         ▼  ▼
┌──────────────────────┐
│     referrals        │
│                      │
│  id (PK)             │
│  referral_code       │
│  referrer_id (FK)    │◄───────┐
│  university_id (FK)  │        │
│  program_id (FK)     │        │
│  counselor_id (FK)   │        │
│  status              │        │
└──────────┬───────────┘        │
           │                    │
           ▼                    │
┌──────────────────────┐   ┌────────────────┐
│      rewards         │   │     users      │
│                      │   │                │
│  id (PK)             │   │  id (PK)       │
│  referral_id (FK)    │   │  email         │
│  user_id (FK)        ├──►│  role          │
│  amount              │   │  referral_code │
│  status              │   │  tier          │
└──────────────────────┘   └────────────────┘
```

### 9.2 Core Tables

#### users
Primary table for all system users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| name | VARCHAR(255) | NOT NULL | Full name |
| phone | VARCHAR(20) | | Contact number |
| role | VARCHAR(50) | NOT NULL | super_admin/manager/counselor/referrer |
| avatar_url | TEXT | | Profile picture URL |
| organization | VARCHAR(255) | | Organization name |
| university_id | UUID | FK → universities | Associated university |
| referral_code | VARCHAR(50) | UNIQUE | Personal referral code |
| tier | VARCHAR(50) | | Bronze/Silver/Gold/Platinum |
| is_active | BOOLEAN | DEFAULT true | Active status |
| is_verified | BOOLEAN | DEFAULT false | Email verified |
| last_login_at | TIMESTAMP | | Last login timestamp |
| created_at | TIMESTAMP | | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

#### universities
Partner universities configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(255) | NOT NULL | University name |
| code | VARCHAR(20) | UNIQUE, NOT NULL | Short code (e.g., MIT) |
| logo_url | TEXT | | Logo image URL |
| website | VARCHAR(255) | | Official website |
| description | TEXT | | Description |
| contact_email | VARCHAR(255) | | Contact email |
| contact_phone | VARCHAR(20) | | Contact phone |
| address | TEXT | | Physical address |
| status | VARCHAR(20) | | active/inactive |
| created_at | TIMESTAMP | | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

#### programs
Academic programs offered by universities.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| university_id | UUID | FK → universities | Parent university |
| name | VARCHAR(255) | NOT NULL | Program name |
| code | VARCHAR(50) | NOT NULL | Program code |
| description | TEXT | | Program description |
| duration | VARCHAR(50) | | Duration (e.g., "2 years") |
| fee_structure | DECIMAL(12,2) | NOT NULL | Program fee |
| commission_rate | DECIMAL(5,2) | NOT NULL | Commission percentage |
| reward_amount | DECIMAL(12,2) | NOT NULL | Reward amount |
| reward_tier | VARCHAR(50) | | bronze/silver/gold/platinum |
| eligibility_criteria | TEXT | | Eligibility requirements |
| status | VARCHAR(20) | | active/inactive |
| created_at | TIMESTAMP | | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

#### referrals
Student referral records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| referral_code | VARCHAR(50) | UNIQUE, NOT NULL | Tracking code |
| referrer_id | UUID | FK → users | Referrer user |
| referrer_name | VARCHAR(255) | NOT NULL | Referrer name |
| referrer_email | VARCHAR(255) | NOT NULL | Referrer email |
| referrer_phone | VARCHAR(20) | NOT NULL | Referrer phone |
| referee_name | VARCHAR(255) | NOT NULL | Student name |
| referee_email | VARCHAR(255) | NOT NULL | Student email |
| referee_phone | VARCHAR(20) | NOT NULL | Student phone |
| university_id | UUID | FK → universities | Target university |
| program_id | UUID | FK → programs | Target program |
| counselor_id | UUID | FK → users | Assigned counselor |
| assigned_at | TIMESTAMP | | Assignment timestamp |
| status | VARCHAR(50) | | submitted/assigned/contacted/admitted/rejected |
| status_notes | TEXT | | Status update notes |
| submission_date | TIMESTAMP | | Submission timestamp |
| contacted_date | TIMESTAMP | | Contact timestamp |
| admission_date | TIMESTAMP | | Admission timestamp |
| rejection_date | TIMESTAMP | | Rejection timestamp |
| slab_tier | INTEGER | | Reward tier number |
| expected_reward | DECIMAL(12,2) | | Calculated reward |
| source | VARCHAR(100) | | Referral source |
| created_at | TIMESTAMP | | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

#### rewards
Reward ledger for tracking payments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| referral_id | UUID | FK → referrals | Associated referral |
| user_id | UUID | FK → users | Reward recipient |
| user_type | VARCHAR(50) | | referrer/counselor/referee |
| reward_type | VARCHAR(50) | | voucher/points/cashback |
| amount | DECIMAL(12,2) | NOT NULL | Reward amount |
| status | VARCHAR(50) | | pending/approved/disbursed/cancelled |
| approved_by | UUID | FK → users | Approver |
| approved_at | TIMESTAMP | | Approval timestamp |
| approval_notes | TEXT | | Approval notes |
| disbursed_by | UUID | FK → users | Disburser |
| disbursed_at | TIMESTAMP | | Disbursement timestamp |
| disbursement_method | VARCHAR(50) | | Payment method |
| transaction_reference | VARCHAR(255) | | Transaction ID |
| created_at | TIMESTAMP | | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

### 9.3 Supporting Tables

- **reward_tiers**: Tier configuration (Bronze, Silver, Gold, Platinum)
- **notifications**: User notifications
- **audit_logs**: System audit trail
- **settings**: System configuration
- **password_reset_tokens**: Password reset tokens
- **bank_accounts**: User bank account details
- **withdrawal_requests**: Withdrawal request tracking

### 9.4 Database Indexes

**Performance Indexes:**
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_referral_code ON users(referral_code);

-- Referrals
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_submission_date ON referrals(submission_date);
CREATE INDEX idx_referrals_university ON referrals(university_id);
CREATE INDEX idx_referrals_program ON referrals(program_id);
CREATE INDEX idx_referrals_counselor ON referrals(counselor_id);

-- Rewards
CREATE INDEX idx_rewards_user ON rewards(user_id);
CREATE INDEX idx_rewards_status ON rewards(status);
CREATE INDEX idx_rewards_referral ON rewards(referral_id);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

### 9.5 Database Constraints

- **Foreign Keys**: ON DELETE CASCADE/SET NULL based on relationship
- **Unique Constraints**: Email, referral codes, university codes
- **Check Constraints**: Role enums, status enums, tier enums
- **Not Null**: Critical fields like email, name, status

---

## 10 Frontend Structure

### 10.1 Project Structure

```
frontend/
├── public/                    # Static assets
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   ├── index.css             # Global styles
│   ├── components/           # Reusable components
│   │   ├── ui/              # Base UI components (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   └── ...
│   │   ├── AnimatedCounter.tsx
│   │   ├── NotificationBell.tsx
│   │   ├── Sidebar.tsx
│   │   └── ...
│   ├── pages/               # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Referrals.tsx
│   │   ├── Analytics.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── Rewards.tsx
│   │   ├── Universities.tsx
│   │   ├── Programs.tsx
│   │   ├── Settings.tsx
│   │   └── PublicReferral.tsx
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.tsx
│   │   ├── useAnimatedCounter.tsx
│   │   └── useNotifications.tsx
│   ├── lib/                 # Utilities
│   │   ├── api.ts          # API client
│   │   ├── utils.ts        # Helper functions
│   │   └── constants.ts    # Constants
│   ├── types/               # TypeScript types
│   │   ├── auth.ts
│   │   ├── referral.ts
│   │   ├── user.ts
│   │   └── index.ts
│   └── utils/               # Utility functions
│       ├── formatters.ts
│       └── validators.ts
├── .env                      # Environment variables
├── .env.example             # Example env file
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
├── tailwind.config.ts       # Tailwind config
└── postcss.config.js        # PostCSS config
```

### 10.2 State Management

**React Query for Server State:**
- Caching API responses
- Background refetching
- Optimistic updates
- Query invalidation

**React Context for Global State:**
- Authentication state (AuthContext)
- Theme state (ThemeContext)
- User preferences

**Local Component State:**
- Form inputs
- UI interactions
- Temporary data

### 10.3 Routing Structure

```typescript
/ → Login Page (Public)
/register → Registration Page (Public)
/referral → Public Referral Form (Public)

/dashboard → Admin/Manager Dashboard (Protected)
/referrals → Referrals List (Protected)
/referrals/:id → Referral Details (Protected)
/analytics → Analytics Dashboard (Protected)
/leaderboard → Leaderboard Page (Protected)
/rewards → Rewards List (Protected)
/universities → Universities Management (Protected - Admin only)
/programs → Programs Management (Protected - Admin only)
/users → User Management (Protected - Admin only)
/settings → Settings Page (Protected - Admin only)
/profile → User Profile (Protected)
```

### 10.4 UI Framework

**shadcn/ui + Radix UI:**
- Accessible components
- Customizable with Tailwind
- Dark mode support
- Consistent design system

**Component Categories:**
- **Form Components**: Input, Select, Checkbox, Radio, Switch
- **Feedback Components**: Toast, Dialog, Alert, Skeleton
- **Navigation**: Tabs, Accordion, Dropdown Menu
- **Data Display**: Card, Badge, Avatar, Table
- **Overlay**: Modal, Popover, Tooltip

### 10.5 Key Features

1. **Dark Mode**: Toggle between light and dark themes
2. **Responsive Design**: Mobile-first approach
3. **Animated Counters**: Smooth number animations
4. **Notification System**: Real-time notification center
5. **Data Visualization**: Interactive charts with Recharts
6. **Form Validation**: React Hook Form + Zod schemas
7. **Loading States**: Skeleton loaders for better UX
8. **Error Boundaries**: Graceful error handling

---

## 11 Backend Structure

### 11.1 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI application entry
│   ├── config.py                # Configuration management
│   ├── database.py              # Database connection
│   ├── dependencies.py          # Dependency injection
│   ├── api/                     # API routes
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── auth.py         # Authentication routes
│   │       ├── users.py        # User management
│   │       ├── universities.py # University routes
│   │       ├── programs.py     # Program routes
│   │       ├── referrals.py    # Referral routes
│   │       ├── rewards.py      # Reward routes
│   │       ├── analytics.py    # Analytics routes
│   │       └── leaderboard.py  # Leaderboard routes
│   ├── controllers/             # Business logic controllers
│   │   ├── __init__.py
│   │   ├── auth_controller.py
│   │   ├── referral_controller.py
│   │   └── ...
│   ├── core/                    # Core functionality
│   │   ├── __init__.py
│   │   ├── security.py         # Security functions
│   │   ├── exceptions.py       # Custom exceptions
│   │   └── logging.py          # Logging configuration
│   ├── models/                  # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── university.py
│   │   ├── program.py
│   │   ├── referral.py
│   │   ├── reward.py
│   │   └── ...
│   ├── schemas/                 # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── referral.py
│   │   ├── auth.py
│   │   └── ...
│   ├── services/                # Service layer
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── referral_service.py
│   │   ├── reward_service.py
│   │   └── ...
│   └── utils/                   # Utility functions
│       ├── __init__.py
│       ├── email.py
│       └── helpers.py
├── alembic/                     # Database migrations
│   ├── versions/
│   └── env.py
├── tests/                       # Unit tests
│   ├── __init__.py
│   ├── test_auth.py
│   └── ...
├── .env                         # Environment variables
├── .env.example                 # Example env file
├── alembic.ini                  # Alembic configuration
├── requirements.txt             # Python dependencies
├── Dockerfile                   # Docker image
└── README.md                    # Backend documentation
```

### 11.2 Application Layers

**1. Route Layer (API Routes)**
- HTTP request handling
- Input validation
- Response formatting
- Route decorators

**2. Controller Layer**
- Business logic orchestration
- Request processing
- Response preparation
- Error handling

**3. Service Layer**
- Core business operations
- Database interactions
- Transaction management
- External API calls

**4. Model Layer (SQLAlchemy)**
- Database table definitions
- Relationships
- Constraints

**5. Schema Layer (Pydantic)**
- Request/response validation
- Data serialization
- Type checking

### 11.3 Middleware

```python
# CORS Middleware
CORSMiddleware(
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Custom Middleware (if needed)
- Request ID tracking
- Request logging
- Performance monitoring
```

### 11.4 Dependency Injection

```python
# Database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Current user
def get_current_user(token: str = Depends(oauth2_scheme)):
    # Verify JWT and return user
    ...

# Role verification
def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403)
        return current_user
    return role_checker
```

### 11.5 Error Handling

```python
# Custom exception classes
class AppException(Exception):
    def __init__(self, status_code: int, message: str, errors: List = None):
        self.status_code = status_code
        self.message = message
        self.errors = errors or []

# Global exception handlers
@app.exception_handler(AppException)
async def app_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "errors": exc.errors
        }
    )
```

---

## 12 Deployment & Setup Guide

### 12.1 Prerequisites

**Development:**
- Python 3.12 or higher
- Node.js 18 or higher
- PostgreSQL 15 or higher
- Docker (optional, recommended)
- Git

**Production:**
- AWS Account with appropriate permissions
- AWS CLI configured
- Docker installed
- Access to ECR, ECS, RDS

### 12.2 Local Development Setup

**Step 1: Clone Repository**
```bash
git clone <repository-url>
cd referral-management
```

**Step 2: Backend Setup**
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp env.example .env
# Edit .env with your database credentials

# Run database migrations
alembic upgrade head

# Seed database (optional)
python seed_database.py

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Step 3: Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env

# Start development server
npm run dev
```

**Step 4: Access Application**
- Frontend: http://localhost:8080 or http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 12.3 Docker Compose Setup

```bash
# Create .env file in root directory
echo "DB_PASSWORD=your_password" > .env
echo "JWT_SECRET=your_secret_key_min_32_characters" >> .env

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

### 12.4 Production Deployment (AWS ECS)

**Prerequisites:**
- ECR repositories created
- ECS cluster created
- RDS PostgreSQL instance created
- ALB configured
- SSM parameters configured

**Manual Deployment:**

**Deploy Backend:**
```bash
# Login to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  163742846785.dkr.ecr.ap-south-1.amazonaws.com

# Build image
docker build -t dev-referral-mgmt-api:latest -f Dockerfile.api .

# Tag image
docker tag dev-referral-mgmt-api:latest \
  163742846785.dkr.ecr.ap-south-1.amazonaws.com/dev-referral-mgmt-api-ecr:latest

# Push to ECR
docker push 163742846785.dkr.ecr.ap-south-1.amazonaws.com/dev-referral-mgmt-api-ecr:latest

# Force new deployment
aws ecs update-service \
  --cluster hackathon \
  --service dev-referral-mgmt-apii-service \
  --force-new-deployment \
  --region ap-south-1
```

**Deploy Frontend:**
```bash
# Build image
docker build -t dev-referral-mgmt-ui:latest -f Dockerfile.ui .

# Tag image
docker tag dev-referral-mgmt-ui:latest \
  163742846785.dkr.ecr.ap-south-1.amazonaws.com/dev-referral-mgmt-ui-ecr:latest

# Push to ECR
docker push 163742846785.dkr.ecr.ap-south-1.amazonaws.com/dev-referral-mgmt-ui-ecr:latest

# Force new deployment
aws ecs update-service \
  --cluster hackathon \
  --service dev-referral-mgmt-ui-service \
  --force-new-deployment \
  --region ap-south-1
```

### 12.5 Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history

# View current version
alembic current
```

### 12.6 Initial Data Setup

```bash
# Seed database with initial data
python backend/seed_database.py

# Default admin credentials
Email: admin@teamlease.com
Password: admin123
```

---

## 13 CI/CD Pipeline

### 13.1 Pipeline Architecture

```
┌────────────────┐
│  Code Commit   │
│  (GitHub/      │
│   CodeCommit)  │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  CodePipeline  │
│  - Triggered   │
│  - Source      │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  CodeBuild     │
│  - Build Image │
│  - Run Tests   │
│  - Push to ECR │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  ECS Deploy    │
│  - Update Task │
│  - Rolling     │
│    Deployment  │
└────────────────┘
```

### 13.2 Build Specifications

**buildspec-api.yml** (Backend):
```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
  build:
    commands:
      - echo Build started on `date`
      - docker build -t $IMAGE_REPO_NAME:$IMAGE_TAG -f Dockerfile.api .
      - docker tag $IMAGE_REPO_NAME:$IMAGE_TAG $ECR_REGISTRY/$IMAGE_REPO_NAME:$IMAGE_TAG
  post_build:
    commands:
      - echo Pushing the Docker image...
      - docker push $ECR_REGISTRY/$IMAGE_REPO_NAME:$IMAGE_TAG
      - printf '[{"name":"dev-referral-mgmt-api","imageUri":"%s"}]' $ECR_REGISTRY/$IMAGE_REPO_NAME:$IMAGE_TAG > imagedefinitions.json
artifacts:
  files: imagedefinitions.json
```

**buildspec-ui.yml** (Frontend):
```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
  build:
    commands:
      - echo Build started on `date`
      - docker build -t $IMAGE_REPO_NAME:$IMAGE_TAG -f Dockerfile.ui .
      - docker tag $IMAGE_REPO_NAME:$IMAGE_TAG $ECR_REGISTRY/$IMAGE_REPO_NAME:$IMAGE_TAG
  post_build:
    commands:
      - echo Pushing the Docker image...
      - docker push $ECR_REGISTRY/$IMAGE_REPO_NAME:$IMAGE_TAG
      - printf '[{"name":"dev-referral-mgmt-ui","imageUri":"%s"}]' $ECR_REGISTRY/$IMAGE_REPO_NAME:$IMAGE_TAG > imagedefinitions.json
artifacts:
  files: imagedefinitions.json
```

### 13.3 Deployment Strategy

**Rolling Deployment:**
- Minimum healthy percent: 50%
- Maximum percent: 200%
- Ensures zero downtime
- Gradual rollout

**Rollback Strategy:**
- Keep previous task definition
- Manual rollback via console or CLI:
```bash
aws ecs update-service \
  --cluster hackathon \
  --service dev-referral-mgmt-api-service \
  --task-definition dev-referral-mgmt-api:PREVIOUS_REVISION
```

### 13.4 Build Stages

1. **Source Stage**: Pulls code from repository
2. **Build Stage**: Builds Docker image, runs tests
3. **Push Stage**: Pushes image to ECR
4. **Deploy Stage**: Updates ECS service
5. **Post-Deploy**: Health check verification

### 13.5 Approval Steps

- **Staging**: Automatic deployment
- **Production**: Manual approval required (can be configured)

---

## 14 Logging & Monitoring

### 14.1 Logging Strategy

**Backend Logging (Loguru):**
```python
from loguru import logger

# Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
logger.info("User logged in", user_id=user.id)
logger.error("Database connection failed", error=str(e))
```

**Log Format:**
```
2024-12-16 10:30:45.123 | INFO | app.main:login:45 - User logged in | user_id=uuid
```

### 14.2 Log Locations

**Development:**
- Backend: Console output
- Frontend: Browser console

**Production (AWS):**
- ECS Container Logs: CloudWatch Logs
  - `/ecs/dev-referral-mgmt-api`
  - `/ecs/dev-referral-mgmt-ui`
- Application Logs: CloudWatch Logs
- Access Logs: ALB access logs (S3)

### 14.3 CloudWatch Log Groups

| Log Group | Retention | Purpose |
|-----------|-----------|---------|
| `/ecs/dev-referral-mgmt-api` | 7 days | API container logs |
| `/ecs/dev-referral-mgmt-ui` | 7 days | UI container logs |
| `/aws/ecs/hackathon` | 30 days | ECS cluster logs |

### 14.4 Monitoring Dashboards

**AWS CloudWatch Metrics:**
- CPU Utilization
- Memory Utilization
- Network In/Out
- Request Count
- Response Time
- Error Rate (4xx, 5xx)
- Database Connections

**Custom Metrics:**
- Referral submission rate
- User login rate
- API endpoint latency
- Database query performance

### 14.5 Alerting Rules

**Critical Alerts:**
- CPU > 80% for 5 minutes
- Memory > 90% for 5 minutes
- Error rate > 5% for 5 minutes
- Response time > 2s for 5 minutes
- Database connection failures

**Warning Alerts:**
- CPU > 60% for 10 minutes
- Memory > 70% for 10 minutes
- Error rate > 2% for 10 minutes

**Alert Channels:**
- Email notifications
- SMS (for critical alerts)
- Slack integration (optional)

### 14.6 Log Analysis

```bash
# View real-time logs
aws logs tail /ecs/dev-referral-mgmt-api --follow --region ap-south-1

# Filter logs by pattern
aws logs filter-log-events \
  --log-group-name /ecs/dev-referral-mgmt-api \
  --filter-pattern "ERROR" \
  --region ap-south-1

# Export logs to S3 for analysis
aws logs create-export-task \
  --log-group-name /ecs/dev-referral-mgmt-api \
  --from 1702800000000 \
  --to 1702900000000 \
  --destination referral-logs-bucket
```

---

## 15 Security Measures

### 15.1 Application Security

**HTTPS & SSL:**
- SSL/TLS termination at ALB
- Force HTTPS redirect
- TLS 1.2+ only
- Strong cipher suites

**Authentication:**
- JWT token-based authentication
- bcrypt password hashing (12 rounds)
- Token expiration (60 minutes access, 7 days refresh)
- Secure token storage

**Input Validation:**
- Pydantic schema validation on backend
- Zod schema validation on frontend
- SQL injection prevention (SQLAlchemy ORM)
- XSS prevention (React automatic escaping)
- CSRF protection (SameSite cookies if using cookies)

**Rate Limiting:**
- Can be implemented at ALB level
- Login endpoint: 5 requests/minute
- API endpoints: 100 requests/minute
- Export endpoints: 5 requests/minute

### 15.2 HTTP Security Headers (Nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

### 15.3 Network Security

**Security Groups:**

**ALB Security Group:**
- Inbound: 80, 443 from 0.0.0.0/0
- Outbound: All to ECS security group

**ECS Task Security Group:**
- Inbound: 80, 8000 from ALB security group
- Outbound: All

**RDS Security Group:**
- Inbound: 5432 from ECS security group only
- Outbound: None

**VPC Configuration:**
- ECS tasks in private subnets
- ALB in public subnets
- RDS in private subnets
- NAT Gateway for outbound internet access

### 15.4 IAM Roles & Policies

**ECS Task Execution Role:**
- ECR image pull permissions
- CloudWatch Logs write permissions
- SSM Parameter Store read permissions

**ECS Task Role:**
- Application-specific AWS service access
- S3 access (if file upload enabled)

### 15.5 Secrets Management

**AWS Systems Manager Parameter Store:**
- Database credentials stored as SecureString
- JWT secret stored as SecureString
- Encrypted at rest with AWS KMS
- Access controlled via IAM policies
- Automatic rotation (recommended)

**Environment Variables:**
- Non-sensitive config as environment variables
- Sensitive data from SSM Parameter Store
- No secrets in code or Docker images

### 15.6 Data Protection

**At Rest:**
- RDS encryption enabled
- EBS volumes encrypted
- S3 bucket encryption (if used)

**In Transit:**
- HTTPS/TLS for all external communication
- Encrypted database connections

**Backup Encryption:**
- RDS automated backups encrypted
- Snapshot encryption enabled

### 15.7 Compliance & Best Practices

- OWASP Top 10 protections
- Regular security updates
- Dependency vulnerability scanning
- Principle of least privilege
- Audit logging enabled
- Password policy enforcement
- Session management

---

## 16 Performance & Scalability

### 16.1 Caching Strategy

**Frontend:**
- Static asset caching (1 year)
- API response caching with React Query
- Browser caching headers

**Backend:**
- Database query result caching (can be implemented)
- Redis for session storage (can be implemented)
- Leaderboard caching (recommended for high traffic)

**CDN (CloudFront - Optional):**
- Static asset delivery
- Edge caching
- GZIP compression

### 16.2 Database Optimization

**Indexes:**
- All foreign keys indexed
- Frequently queried columns indexed
- Composite indexes for common queries

**Connection Pooling:**
```python
# SQLAlchemy connection pool
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600
)
```

**Query Optimization:**
- Eager loading for relationships
- Pagination for large result sets
- Selective column fetching
- Avoid N+1 queries

### 16.3 Load Balancing

**Application Load Balancer:**
- Round robin algorithm
- Health check based routing
- Sticky sessions (if needed)
- Cross-zone load balancing enabled

**Target Group Configuration:**
- Health check path: `/health`
- Healthy threshold: 2
- Unhealthy threshold: 3
- Timeout: 10 seconds
- Interval: 30 seconds

### 16.4 Auto Scaling

**ECS Service Auto Scaling:**

**Target Tracking Policy:**
- Metric: CPU Utilization
- Target: 70%
- Scale out: Add task when CPU > 70%
- Scale in: Remove task when CPU < 60%

**Configuration:**
- Minimum tasks: 1
- Maximum tasks: 5 (can be increased)
- Scale out cooldown: 60 seconds
- Scale in cooldown: 300 seconds

**RDS Auto Scaling:**
- Storage auto scaling enabled
- Threshold: 90% usage
- Maximum storage: 1 TB

### 16.5 Performance Benchmarks

**Target Metrics:**
- API Response Time: < 200ms (p50), < 500ms (p95), < 1s (p99)
- Page Load Time: < 2 seconds
- Time to Interactive: < 3 seconds
- Database Query Time: < 100ms (average)
- Concurrent Users: 1000+ (with auto scaling)

**Load Testing:**
- Use tools like Apache JMeter, Locust, or k6
- Test before major releases
- Simulate peak load scenarios

### 16.6 CDN Usage (Optional)

**CloudFront Distribution:**
- Origin: ALB DNS
- Cache behaviors: Cache static assets, bypass API
- GZIP compression enabled
- HTTP/2 enabled
- Custom SSL certificate

---

## 17 Backup & Disaster Recovery

### 17.1 Backup Strategy

**Database Backups:**

**Automated Backups (RDS):**
- Backup window: 02:00 - 03:00 UTC (daily)
- Retention period: 7 days (can be increased to 35 days)
- Point-in-time recovery enabled
- Cross-region backup replication (optional, recommended for DR)

**Manual Snapshots:**
- Before major updates/migrations
- Retention: Manual management
- Can be copied to other regions

### 17.2 Backup Frequency

| Data Type | Frequency | Retention | Method |
|-----------|-----------|-----------|--------|
| Database | Daily | 7 days | RDS automated backup |
| Database (manual) | Before changes | Permanent (until deleted) | RDS snapshot |
| Application Code | On commit | Permanent | Git repository |
| Docker Images | On build | Latest 10 tags | ECR |
| Logs | Continuous | 7-30 days | CloudWatch |

### 17.3 Restore Procedures

**Database Restore:**

**From Automated Backup:**
```bash
# Restore to new RDS instance
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier referral-db-restored \
  --db-snapshot-identifier rds:referral-db-2024-12-15-02-00

# Update ECS task definition with new DB endpoint
# Redeploy services
```

**Point-in-Time Recovery:**
```bash
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier referral-db \
  --target-db-instance-identifier referral-db-restored \
  --restore-time 2024-12-15T10:30:00Z
```

**Application Rollback:**
```bash
# Rollback to previous ECS task definition
aws ecs update-service \
  --cluster hackathon \
  --service dev-referral-mgmt-api-service \
  --task-definition dev-referral-mgmt-api:PREVIOUS_REVISION
```

### 17.4 Disaster Recovery Plan

**RTO (Recovery Time Objective):** 4 hours  
**RPO (Recovery Point Objective):** 1 hour (based on backup frequency)

**Failure Scenarios:**

**1. ECS Task Failure:**
- Auto-recovery: ECS automatically restarts failed tasks
- Health checks detect and replace unhealthy tasks
- No manual intervention required

**2. Availability Zone Failure:**
- Multi-AZ deployment ensures availability
- ALB routes traffic to healthy AZ
- RDS automatically fails over to standby

**3. Region Failure:**
- Manual failover to backup region
- Restore database from cross-region backup
- Update DNS to point to DR region
- Estimated recovery time: 2-4 hours

**4. Database Corruption:**
- Restore from most recent clean backup
- Replay transaction logs if available
- Validate data integrity
- Estimated recovery time: 1-2 hours

### 17.5 Failover Strategy

**Database Failover (Multi-AZ):**
- Automatic failover to standby instance
- Failover time: 1-2 minutes
- DNS automatically updated
- No data loss

**Application Failover:**
- ALB health checks detect failures
- Traffic routed to healthy instances
- Auto-scaling replaces failed instances
- Failover time: < 1 minute

### 17.6 Backup Validation

**Monthly Procedures:**
1. Restore database backup to test environment
2. Verify data integrity
3. Test application functionality
4. Document any issues
5. Update recovery procedures if needed

---

## 18 Known Issues & Limitations

### 18.1 Current Limitations

**Technical Limitations:**
1. **Single Region Deployment**: Currently deployed only in ap-south-1 (Mumbai)
2. **No Real-time Updates**: Requires manual refresh to see new data (WebSocket not implemented)
3. **Limited File Upload**: No document upload feature currently
4. **Basic Search**: No full-text search, only basic filtering
5. **No Email Notifications**: Notification system is in-app only
6. **Limited Export Formats**: Only CSV export, no PDF/Excel

**Business Limitations:**
1. **Single Currency**: Only INR supported
2. **Manual Reward Approval**: All rewards require manual approval
3. **No Bulk Operations**: No bulk upload of referrals
4. **Limited Reporting**: Advanced reports not available

### 18.2 Browser Compatibility

**Fully Supported:**
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

**Known Issues:**
- Internet Explorer: Not supported
- Safari < 14: Some CSS animations may not work
- Mobile browsers: Optimized but some features better on desktop

### 18.3 Scaling Constraints

**Current Constraints:**
- Max ECS tasks: 5 (can be increased)
- Database connections: 100 (RDS limit, can be increased)
- File uploads: Not implemented
- Concurrent API requests: Limited by ECS task CPU/memory

### 18.4 Feature Gaps

**Planned Features (Not Yet Implemented):**
- Two-factor authentication (2FA)
- Email notifications
- SMS notifications
- Document upload/management
- Advanced reporting with custom date ranges
- Export to PDF/Excel
- Bulk operations
- Public API for integrations
- Mobile app
- Multi-language support

### 18.5 Security Considerations

**Areas for Improvement:**
- Rate limiting should be implemented at application level
- Token refresh mechanism can be enhanced
- Password reset email functionality pending
- Audit log viewing UI not implemented
- Session management can be improved with Redis

---

## 19 Maintenance & Operations

### 19.1 Routine Maintenance Tasks

**Daily:**
- Monitor CloudWatch dashboards
- Check error logs
- Verify backup completion
- Review security alerts

**Weekly:**
- Review application performance metrics
- Check disk space usage
- Update database statistics
- Review failed API requests

**Monthly:**
- Security updates and patches
- Database maintenance (vacuum, analyze)
- Review and optimize slow queries
- Test backup restoration
- Certificate renewal check

**Quarterly:**
- Dependency updates
- Security audit
- Performance review
- Capacity planning

### 19.2 Restart Procedures

**Restart Backend API:**
```bash
aws ecs update-service \
  --cluster hackathon \
  --service dev-referral-mgmt-apii-service \
  --force-new-deployment \
  --region ap-south-1
```

**Restart Frontend UI:**
```bash
aws ecs update-service \
  --cluster hackathon \
  --service dev-referral-mgmt-ui-service \
  --force-new-deployment \
  --region ap-south-1
```

**Restart Database (Reboot):**
```bash
aws rds reboot-db-instance \
  --db-instance-identifier referral-db \
  --region ap-south-1
```

⚠️ Database reboot causes downtime (1-2 minutes)

### 19.3 Log Cleanup

**CloudWatch Logs:**
- Automatic cleanup based on retention policy (7-30 days)
- Manual cleanup:
```bash
aws logs delete-log-group \
  --log-group-name /ecs/dev-referral-mgmt-api \
  --region ap-south-1
```

**Database Logs:**
- RDS automatically manages log rotation
- Old logs archived to S3 (if configured)

### 19.4 SSL Certificate Renewal

**If using ACM (AWS Certificate Manager):**
- Automatic renewal
- No manual intervention required
- Email notification before expiration

**If using custom certificates:**
- Renewal reminder 30 days before expiration
- Update certificate in ALB
- Verify HTTPS functionality

### 19.5 Dependency Updates

**Backend (Python):**
```bash
cd backend

# Check for outdated packages
pip list --outdated

# Update specific package
pip install --upgrade <package-name>

# Update requirements.txt
pip freeze > requirements.txt

# Test application
pytest

# Deploy
```

**Frontend (Node.js):**
```bash
cd frontend

# Check for outdated packages
npm outdated

# Update specific package
npm update <package-name>

# Update package.json
npm install

# Test application
npm run build

# Deploy
```

### 19.6 Database Maintenance

**PostgreSQL VACUUM:**
```sql
-- Run weekly to reclaim storage
VACUUM ANALYZE;

-- For specific tables
VACUUM ANALYZE referrals;
```

**Index Maintenance:**
```sql
-- Rebuild indexes if needed
REINDEX TABLE referrals;

-- Check for missing indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE tablename = 'referrals';
```

**Statistics Update:**
```sql
-- Update table statistics for query optimization
ANALYZE users;
ANALYZE referrals;
ANALYZE rewards;
```

---

## 20 Troubleshooting Guide

### 20.1 Common Issues & Solutions

#### Issue: 500 Internal Server Error

**Symptoms:**
- API returns 500 error
- Application crashes

**Causes:**
- Database connection failure
- Unhandled exception in code
- Memory/CPU exhaustion

**Solution:**
```bash
# Check CloudWatch logs
aws logs tail /ecs/dev-referral-mgmt-api --follow

# Check ECS task status
aws ecs describe-tasks --cluster hackathon --tasks <task-arn>

# Check database connectivity
psql -h <db-host> -U postgres -d referral_db

# Restart service if needed
aws ecs update-service --cluster hackathon --service dev-referral-mgmt-apii-service --force-new-deployment
```

#### Issue: Login Fails / Invalid Credentials

**Symptoms:**
- Login returns 401 error
- "Invalid credentials" message

**Causes:**
- Incorrect password
- User not in database
- Token generation failure

**Solution:**
```bash
# Check user exists in database
SELECT * FROM users WHERE email = 'user@example.com';

# Verify password hash
# Compare bcrypt hash

# Check JWT secret is correct in environment variables

# Test with known working credentials
Email: admin@teamlease.com
Password: admin123
```

#### Issue: Database Connection Timeout

**Symptoms:**
- API health check fails
- "Could not connect to database" error

**Causes:**
- Database not running
- Security group blocking connection
- Wrong credentials
- Connection limit reached

**Solution:**
```bash
# Check RDS status
aws rds describe-db-instances --db-instance-identifier referral-db

# Verify security group rules
aws ec2 describe-security-groups --group-ids <sg-id>

# Test connection from ECS task
# Connect to ECS task shell and test:
psql -h <db-host> -U postgres -d referral_db

# Check connection count
SELECT count(*) FROM pg_stat_activity;

# Kill idle connections if needed
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle' AND state_change < now() - interval '1 hour';
```

#### Issue: CORS Errors

**Symptoms:**
- Browser console shows CORS error
- API requests blocked

**Causes:**
- Frontend origin not in CORS_ORIGINS
- Incorrect protocol (http vs https)
- Missing preflight OPTIONS response

**Solution:**
```bash
# Update CORS_ORIGINS in SSM Parameter Store
aws ssm put-parameter \
  --name /referral/dev/cors-origins \
  --value "https://your-domain.com,http://localhost:8080" \
  --overwrite

# Restart backend service
aws ecs update-service --cluster hackathon --service dev-referral-mgmt-apii-service --force-new-deployment

# Verify CORS headers in response
curl -H "Origin: https://your-domain.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  http://api-url/api/v1/auth/login -v
```

#### Issue: ECS Task Failing to Start

**Symptoms:**
- ECS service shows tasks stopping repeatedly
- Health check failures

**Causes:**
- Image pull failure
- Environment variable missing
- Health check endpoint failing
- Insufficient memory/CPU

**Solution:**
```bash
# Check task stopped reason
aws ecs describe-tasks --cluster hackathon --tasks <task-arn>

# Check CloudWatch logs for startup errors
aws logs tail /ecs/dev-referral-mgmt-api --since 10m

# Verify task definition
aws ecs describe-task-definition --task-definition dev-referral-mgmt-api

# Check ECR image exists
aws ecr describe-images --repository-name dev-referral-mgmt-api-ecr

# Test health check endpoint
curl http://<task-ip>:8000/health
```

#### Issue: Slow API Response

**Symptoms:**
- API requests taking > 2 seconds
- Timeout errors

**Causes:**
- Slow database queries
- Large result sets without pagination
- N+1 query problem
- Insufficient resources

**Solution:**
```bash
# Check CloudWatch metrics
# Look for high CPU/Memory usage

# Identify slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

# Check for missing indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes;

# Enable query logging (temporarily)
# Add to PostgreSQL config: log_min_duration_statement = 500

# Scale up ECS tasks if needed
aws ecs update-service \
  --cluster hackathon \
  --service dev-referral-mgmt-api-service \
  --desired-count 3
```

### 20.2 Diagnostic Commands

**Check Service Health:**
```bash
# ECS service status
aws ecs describe-services \
  --cluster hackathon \
  --services dev-referral-mgmt-api-service \
  --region ap-south-1

# Running tasks
aws ecs list-tasks \
  --cluster hackathon \
  --service-name dev-referral-mgmt-api-service \
  --region ap-south-1

# Task details
aws ecs describe-tasks \
  --cluster hackathon \
  --tasks <task-arn> \
  --region ap-south-1
```

**Check Database:**
```bash
# RDS status
aws rds describe-db-instances \
  --db-instance-identifier referral-db \
  --region ap-south-1

# Database connections
psql -h <db-host> -U postgres -d referral_db \
  -c "SELECT count(*) FROM pg_stat_activity;"

# Long-running queries
psql -h <db-host> -U postgres -d referral_db \
  -c "SELECT pid, now() - query_start as duration, query FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '30 seconds';"
```

**Check Logs:**
```bash
# Real-time logs
aws logs tail /ecs/dev-referral-mgmt-api --follow --region ap-south-1

# Filter by error
aws logs filter-log-events \
  --log-group-name /ecs/dev-referral-mgmt-api \
  --filter-pattern "ERROR" \
  --region ap-south-1 \
  --start-time $(date -d '1 hour ago' +%s)000

# Filter by time range
aws logs filter-log-events \
  --log-group-name /ecs/dev-referral-mgmt-api \
  --start-time 1702800000000 \
  --end-time 1702900000000 \
  --region ap-south-1
```

### 20.3 Emergency Contacts

See [Section 22: Contact & Ownership](#22-contact--ownership)

---

## 21 Change Log / Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| **1.0.0** | December 2024 | Initial release | Development Team |
| | | - User authentication & authorization | |
| | | - Referral management system | |
| | | - University & program management | |
| | | - Reward calculation & tracking | |
| | | - Analytics & leaderboard | |
| | | - Admin panel | |
| | | - Public referral portal | |
| | | - AWS ECS deployment | |
| **0.9.0** | November 2024 | Beta release | Development Team |
| | | - Core features implemented | |
| | | - Testing phase | |
| **0.5.0** | October 2024 | Alpha release | Development Team |
| | | - Initial prototype | |

### 21.1 Upcoming Features (Roadmap)

**Version 1.1.0 (Q1 2025):**
- Two-factor authentication
- Email notifications
- Advanced reporting
- Bulk operations

**Version 1.2.0 (Q2 2025):**
- Mobile application
- Document upload/management
- Public API for integrations
- Multi-language support

**Version 2.0.0 (Q3 2025):**
- Real-time updates (WebSocket)
- Advanced analytics with AI insights
- Payment gateway integration
- Multi-currency support

---

## 22 Contact & Ownership

### 22.1 Team Contacts

| Role | Name | Email | Phone |
|------|------|-------|-------|
| **Tech Lead** | [Name] | tech.lead@teamlease.com | [Phone] |
| **Backend Developer** | [Name] | backend.dev@teamlease.com | [Phone] |
| **Frontend Developer** | [Name] | frontend.dev@teamlease.com | [Phone] |
| **DevOps Engineer** | [Name] | devops@teamlease.com | [Phone] |
| **QA Lead** | [Name] | qa.lead@teamlease.com | [Phone] |
| **Product Manager** | [Name] | product@teamlease.com | [Phone] |

### 22.2 Escalation Matrix

| Severity | Response Time | Escalation Path |
|----------|--------------|-----------------|
| **Critical** (Service Down) | 15 minutes | DevOps → Tech Lead → CTO |
| **High** (Major Feature Broken) | 1 hour | Developer → Tech Lead |
| **Medium** (Minor Issue) | 4 hours | Developer → QA |
| **Low** (Enhancement Request) | Next Sprint | Product Manager |

### 22.3 Support Channels

**Internal:**
- Slack: #referral-portal-support
- Email: support@teamlease.com
- Jira: https://teamlease.atlassian.net

**External (Users):**
- Help Desk: help@teamlease.com
- Phone: +91-XXXX-XXXX-XX
- WhatsApp: [Number]

### 22.4 On-Call Rotation

**Primary On-Call:**
- Week 1: DevOps Engineer
- Week 2: Backend Developer
- Week 3: Tech Lead
- Week 4: DevOps Engineer

**Backup On-Call:**
- Tech Lead (always available for critical issues)

### 22.5 Documentation Updates

**Responsibility:**
- Tech Lead: Architecture & security updates
- DevOps: Deployment & infrastructure updates
- Developers: Feature documentation

**Review Cycle:**
- Monthly review of technical documentation
- Immediate updates for critical changes
- Version control: Track changes in Git

---

## 📚 Additional Resources

### Quick Links

| Resource | URL |
|----------|-----|
| Git Repository | [Repository URL] |
| API Documentation (Dev) | http://localhost:8000/docs |
| Project Board | [Jira/Trello URL] |
| Wiki | [Confluence URL] |
| Monitoring Dashboard | [CloudWatch URL] |

### Related Documents

- `START_GUIDE.md`: Quick start guide for developers
- `DEPLOYMENT_GUIDE.md`: Detailed AWS deployment guide
- `FEATURES.md`: Feature list and specifications
- `DATABASE_SCHEMA.sql`: Complete database schema
- `BACKEND_API_DOCUMENTATION.md`: Comprehensive API reference

### External Documentation

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Docker Documentation](https://docs.docker.com/)

---

## 📝 Document Information

**Document Version:** 1.0.0  
**Last Updated:** December 16, 2024  
**Next Review:** January 2025  
**Maintained By:** Development Team  
**Approved By:** Tech Lead  

---

**End of Technical Documentation**

