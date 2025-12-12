# Referral Management System - Backend API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Authentication APIs](#authentication-apis)
4. [User Management APIs](#user-management-apis)
5. [University & Program APIs](#university--program-apis)
6. [Referral APIs](#referral-apis)
7. [Reward APIs](#reward-apis)
8. [Leaderboard APIs](#leaderboard-apis)
9. [Analytics APIs](#analytics-apis)
10. [Settings APIs](#settings-apis)
11. [Notification APIs](#notification-apis)
12. [Export APIs](#export-apis)

---

## Overview

### Technology Stack Recommendation
- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL 14+
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT (PyJWT)
- **Cache**: Redis (optional, for leaderboard caching)
- **File Storage**: AWS S3 / Local storage
- **API Documentation**: Auto-generated via FastAPI (Swagger/OpenAPI)

### Base URL
```
Production: https://api.teamlease-edtech.com/v1
Development: http://localhost:8000/v1
```

### Authentication
All endpoints (except public and auth) require Bearer token:
```
Authorization: Bearer <jwt_token>
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "errors": null
}
```

### Error Response Format
```json
{
  "success": false,
  "data": null,
  "message": "Error message",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

---

## Database Schema

### Tables Overview

| Table | Description |
|-------|-------------|
| `users` | All system users (admins, managers, counselors, referrers) |
| `universities` | Partner universities |
| `programs` | Academic programs offered by universities |
| `referrals` | Student referral records |
| `rewards` | Reward ledger for tracking payments |
| `reward_tiers` | Tier/slab configuration for rewards |
| `notifications` | System notifications |
| `audit_logs` | System audit trail |
| `settings` | System configuration |
| `sessions` | User sessions (optional, if not using JWT only) |

---

### Table: `users`

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'manager', 'counselor', 'referrer')),
    avatar_url TEXT,
    organization VARCHAR(255),
    university_id UUID REFERENCES universities(id),
    referral_code VARCHAR(50) UNIQUE,
    tier VARCHAR(50) DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_university ON users(university_id);
```

---

### Table: `universities`

```sql
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    logo_url TEXT,
    website VARCHAR(255),
    description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_universities_code ON universities(code);
CREATE INDEX idx_universities_status ON universities(status);
```

---

### Table: `programs`

```sql
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    duration VARCHAR(50),
    fee_structure DECIMAL(12, 2) NOT NULL,
    commission_rate DECIMAL(5, 2) NOT NULL,
    reward_amount DECIMAL(12, 2) NOT NULL,
    reward_tier VARCHAR(50) DEFAULT 'bronze' CHECK (reward_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    eligibility_criteria TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(university_id, code)
);

CREATE INDEX idx_programs_university ON programs(university_id);
CREATE INDEX idx_programs_status ON programs(status);
```

---

### Table: `referrals`

```sql
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    
    -- Referrer (person who made the referral)
    referrer_id UUID REFERENCES users(id),
    referrer_name VARCHAR(255) NOT NULL,
    referrer_email VARCHAR(255) NOT NULL,
    referrer_phone VARCHAR(20) NOT NULL,
    
    -- Referee (student being referred)
    referee_name VARCHAR(255) NOT NULL,
    referee_email VARCHAR(255) NOT NULL,
    referee_phone VARCHAR(20) NOT NULL,
    
    -- Program details
    university_id UUID NOT NULL REFERENCES universities(id),
    program_id UUID NOT NULL REFERENCES programs(id),
    
    -- Assignment
    counselor_id UUID REFERENCES users(id),
    assigned_at TIMESTAMP,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'assigned', 'contacted', 'admitted', 'rejected')),
    status_notes TEXT,
    
    -- Dates
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    contacted_date TIMESTAMP,
    admission_date TIMESTAMP,
    rejection_date TIMESTAMP,
    
    -- Reward calculation
    slab_tier INTEGER DEFAULT 1,
    expected_reward DECIMAL(12, 2),
    
    -- Metadata
    source VARCHAR(100),
    utm_campaign VARCHAR(255),
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referee_email ON referrals(referee_email);
CREATE INDEX idx_referrals_university ON referrals(university_id);
CREATE INDEX idx_referrals_program ON referrals(program_id);
CREATE INDEX idx_referrals_counselor ON referrals(counselor_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_submission_date ON referrals(submission_date);
CREATE INDEX idx_referrals_referral_code ON referrals(referral_code);
```

---

### Table: `rewards`

```sql
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('referrer', 'counselor', 'referee')),
    reward_type VARCHAR(50) NOT NULL CHECK (reward_type IN ('voucher', 'points', 'cashback')),
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'disbursed', 'cancelled')),
    
    -- Approval tracking
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    approval_notes TEXT,
    
    -- Disbursement tracking
    disbursed_by UUID REFERENCES users(id),
    disbursed_at TIMESTAMP,
    disbursement_method VARCHAR(50),
    transaction_reference VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rewards_referral ON rewards(referral_id);
CREATE INDEX idx_rewards_user ON rewards(user_id);
CREATE INDEX idx_rewards_status ON rewards(status);
CREATE INDEX idx_rewards_user_type ON rewards(user_type);
```

---

### Table: `reward_tiers`

```sql
CREATE TABLE reward_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_name VARCHAR(50) NOT NULL,
    min_referrals INTEGER NOT NULL,
    max_referrals INTEGER,
    multiplier DECIMAL(4, 2) DEFAULT 1.00,
    bonus_amount DECIMAL(12, 2) DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default tiers
INSERT INTO reward_tiers (tier_name, min_referrals, max_referrals, multiplier, bonus_amount, description) VALUES
('Bronze', 1, 5, 1.00, 0, '1-5 successful referrals'),
('Silver', 6, 10, 1.25, 500, '6-10 successful referrals'),
('Gold', 11, 20, 1.50, 1500, '11-20 successful referrals'),
('Platinum', 21, NULL, 2.00, 5000, '21+ successful referrals');
```

---

### Table: `notifications`

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) CHECK (type IN ('info', 'success', 'warning', 'error')),
    category VARCHAR(50) CHECK (category IN ('referral', 'reward', 'system', 'assignment')),
    reference_type VARCHAR(50),
    reference_id UUID,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

---

### Table: `audit_logs`

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
```

---

### Table: `settings`

```sql
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    category VARCHAR(50),
    description TEXT,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default settings
INSERT INTO settings (key, value, category, description) VALUES
('system_name', '"TeamLease EdTech Referral Portal"', 'general', 'System display name'),
('default_timezone', '"Asia/Kolkata"', 'general', 'Default timezone'),
('referrer_base_reward', '100', 'rewards', 'Base reward for referrers in INR'),
('counselor_base_reward', '75', 'rewards', 'Base reward for counselors in INR'),
('default_reward_type', '"cashback"', 'rewards', 'Default reward type'),
('slab_wise_progression', 'true', 'rewards', 'Enable tiered rewards'),
('session_timeout_minutes', '30', 'security', 'Session timeout in minutes'),
('require_2fa', 'false', 'security', 'Require 2FA for admin users'),
('audit_logging', 'true', 'security', 'Enable audit logging');
```

---

### Table: `password_reset_tokens`

```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(user_id);
```

---

## Authentication APIs

### POST `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "admin"  // "admin" | "referrer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin",
      "avatar_url": null
    }
  }
}
```

---

### POST `/auth/register`

Register a new user (referrer only from public).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+911234567890",
  "password": "password123",
  "confirm_password": "password123",
  "organization": "Company Name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "referrer",
    "referral_code": "JOHN-REF-2024",
    "is_verified": false
  },
  "message": "Registration successful. Please verify your email."
}
```

---

### POST `/auth/refresh`

Refresh access token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### POST `/auth/logout`

Logout user and invalidate tokens.

**Headers:** `Authorization: Bearer <token>`

---

### POST `/auth/forgot-password`

Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

---

### POST `/auth/reset-password`

Reset password with token.

**Request Body:**
```json
{
  "token": "reset-token-string",
  "password": "newpassword123",
  "confirm_password": "newpassword123"
}
```

---

### GET `/auth/me`

Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+911234567890",
    "role": "admin",
    "avatar_url": null,
    "organization": "Company Name",
    "referral_code": "JOHN-REF-2024",
    "tier": "Gold",
    "is_active": true,
    "is_verified": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## User Management APIs

### GET `/users`

List all users (admin only).

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number (default: 1) |
| `limit` | int | Items per page (default: 20) |
| `role` | string | Filter by role |
| `search` | string | Search by name/email |
| `is_active` | bool | Filter by active status |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "counselor",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

---

### POST `/users`

Create a new user (admin only).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+911234567890",
  "role": "counselor",
  "university_id": "uuid",
  "password": "temppassword123"
}
```

---

### GET `/users/{id}`

Get user details.

---

### PUT `/users/{id}`

Update user details.

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+911234567890",
  "is_active": true
}
```

---

### DELETE `/users/{id}`

Delete user (soft delete).

---

### GET `/users/counselors`

List all counselors.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `university_id` | uuid | Filter by university |
| `is_active` | bool | Filter by active status |

---

### GET `/users/referrers`

List all referrers.

---

## University & Program APIs

### GET `/universities`

List all universities.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number |
| `limit` | int | Items per page |
| `status` | string | active/inactive |
| `search` | string | Search by name/code |
| `sort_by` | string | name/code/referrals/admissions/date |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Massachusetts Institute of Technology",
        "code": "MIT",
        "logo_url": null,
        "status": "active",
        "created_at": "2024-01-01T00:00:00Z",
        "stats": {
          "total_programs": 5,
          "total_referrals": 45,
          "total_admissions": 22,
          "conversion_rate": 48.9
        }
      }
    ],
    "total": 4,
    "page": 1,
    "limit": 20
  }
}
```

---

### POST `/universities`

Create a new university.

**Request Body:**
```json
{
  "name": "New University",
  "code": "NWU",
  "logo_url": "https://example.com/logo.png",
  "website": "https://newuniversity.edu",
  "description": "Description text",
  "contact_email": "admin@newuniversity.edu",
  "contact_phone": "+911234567890",
  "address": "University Address",
  "status": "active"
}
```

---

### GET `/universities/{id}`

Get university details with programs and stats.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Massachusetts Institute of Technology",
    "code": "MIT",
    "status": "active",
    "programs": [
      {
        "id": "uuid",
        "name": "MBA Program",
        "code": "MBA",
        "fee_structure": 85000,
        "reward_amount": 2975,
        "status": "active"
      }
    ],
    "stats": {
      "total_programs": 5,
      "total_referrals": 45,
      "total_admissions": 22,
      "conversion_rate": 48.9,
      "total_rewards_disbursed": 125000
    }
  }
}
```

---

### PUT `/universities/{id}`

Update university.

---

### DELETE `/universities/{id}`

Delete university (fails if has referrals/programs).

---

### PATCH `/universities/{id}/status`

Toggle university active/inactive status.

**Request Body:**
```json
{
  "status": "inactive"
}
```

---

### GET `/universities/{id}/programs`

List programs for a university.

---

### POST `/universities/{id}/programs`

Create a new program for university.

**Request Body:**
```json
{
  "name": "MS Data Science",
  "code": "MSDS",
  "description": "Program description",
  "duration": "2 years",
  "fee_structure": 75000,
  "commission_rate": 3.0,
  "reward_amount": 2250,
  "reward_tier": "gold",
  "eligibility_criteria": "Bachelor's degree required",
  "status": "active"
}
```

---

### GET `/programs`

List all programs (with filtering).

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `university_id` | uuid | Filter by university |
| `status` | string | active/inactive |
| `reward_tier` | string | bronze/silver/gold/platinum |

---

### GET `/programs/{id}`

Get program details.

---

### PUT `/programs/{id}`

Update program.

---

### DELETE `/programs/{id}`

Delete program.

---

## Referral APIs

### GET `/referrals`

List all referrals (with filtering).

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number |
| `limit` | int | Items per page |
| `status` | string | submitted/assigned/contacted/admitted/rejected |
| `university_id` | uuid | Filter by university |
| `program_id` | uuid | Filter by program |
| `counselor_id` | uuid | Filter by assigned counselor |
| `referrer_id` | uuid | Filter by referrer |
| `search` | string | Search by name/email/code |
| `date_from` | date | Filter from date |
| `date_to` | date | Filter to date |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "referral_code": "MIT-MBA-12345",
        "referrer": {
          "id": "uuid",
          "name": "John Smith",
          "email": "john@example.com",
          "phone": "+911234567890"
        },
        "referee": {
          "name": "Alice Johnson",
          "email": "alice@example.com",
          "phone": "+912222222222"
        },
        "university": {
          "id": "uuid",
          "name": "MIT",
          "code": "MIT"
        },
        "program": {
          "id": "uuid",
          "name": "MBA Program",
          "code": "MBA"
        },
        "counselor": {
          "id": "uuid",
          "name": "Sarah Johnson"
        },
        "status": "admitted",
        "submission_date": "2024-10-01T00:00:00Z",
        "admission_date": "2024-11-15T00:00:00Z",
        "expected_reward": 2975
      }
    ],
    "total": 156,
    "page": 1,
    "limit": 20,
    "stats": {
      "total": 156,
      "submitted": 12,
      "assigned": 8,
      "contacted": 45,
      "admitted": 67,
      "rejected": 24
    }
  }
}
```

---

### POST `/referrals`

Create a new referral (admin/manager).

**Request Body:**
```json
{
  "referrer_name": "John Smith",
  "referrer_email": "john@example.com",
  "referrer_phone": "+911234567890",
  "referee_name": "Alice Johnson",
  "referee_email": "alice@example.com",
  "referee_phone": "+912222222222",
  "university_id": "uuid",
  "program_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "referral_code": "MIT-MBA-12345",
    "status": "submitted",
    "expected_reward": 2975
  },
  "message": "Referral created successfully"
}
```

---

### POST `/referrals/submit` (Public/Referrer)

Submit a referral as a referrer.

**Request Body:**
```json
{
  "referee_name": "Alice Johnson",
  "referee_email": "alice@example.com",
  "referee_phone": "+912222222222",
  "university_id": "uuid",
  "program_id": "uuid"
}
```
*Note: Referrer info is taken from authenticated user*

---

### GET `/referrals/{id}`

Get referral details.

---

### PUT `/referrals/{id}`

Update referral.

---

### PATCH `/referrals/{id}/status`

Update referral status.

**Request Body:**
```json
{
  "status": "contacted",
  "notes": "Called and discussed program details"
}
```

---

### POST `/referrals/{id}/assign`

Assign counselor to referral.

**Request Body:**
```json
{
  "counselor_id": "uuid"
}
```

---

### GET `/referrals/my-referrals`

Get referrals for current referrer.

---

### GET `/referrals/assigned`

Get referrals assigned to current counselor.

---

### GET `/referrals/stats`

Get referral statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_referrals": 156,
    "pending_assignment": 12,
    "total_admissions": 67,
    "conversion_rate": 42.9,
    "total_rewards": 45600,
    "by_status": {
      "submitted": 12,
      "assigned": 8,
      "contacted": 45,
      "admitted": 67,
      "rejected": 24
    },
    "by_university": [
      { "university_id": "uuid", "name": "MIT", "count": 45 }
    ],
    "by_month": [
      { "month": "2024-10", "referrals": 35, "admissions": 15 }
    ]
  }
}
```

---

### GET `/referrals/referee/{email}`

Get referral history for a specific referee (by email).

---

## Reward APIs

### GET `/rewards`

List all rewards.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number |
| `limit` | int | Items per page |
| `status` | string | pending/approved/disbursed/cancelled |
| `user_type` | string | referrer/counselor/referee |
| `user_id` | uuid | Filter by user |
| `referral_id` | uuid | Filter by referral |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "referral_code": "MIT-MBA-12345",
        "user": {
          "id": "uuid",
          "name": "John Smith",
          "type": "referrer"
        },
        "reward_type": "cashback",
        "amount": 2975,
        "status": "pending",
        "created_at": "2024-11-15T00:00:00Z"
      }
    ],
    "total": 50,
    "stats": {
      "total_pending": 25000,
      "total_approved": 15000,
      "total_disbursed": 125000,
      "average_reward": 2500
    }
  }
}
```

---

### POST `/rewards`

Create a reward entry (auto-created on admission, but can be manual).

**Request Body:**
```json
{
  "referral_id": "uuid",
  "user_id": "uuid",
  "user_type": "referrer",
  "reward_type": "cashback",
  "amount": 2975
}
```

---

### GET `/rewards/{id}`

Get reward details.

---

### PATCH `/rewards/{id}/approve`

Approve a pending reward.

**Request Body:**
```json
{
  "notes": "Verified admission confirmation"
}
```

---

### PATCH `/rewards/{id}/disburse`

Disburse an approved reward.

**Request Body:**
```json
{
  "disbursement_method": "bank_transfer",
  "transaction_reference": "TXN123456789"
}
```

---

### PATCH `/rewards/{id}/cancel`

Cancel a reward.

**Request Body:**
```json
{
  "reason": "Duplicate entry"
}
```

---

### GET `/rewards/my-rewards`

Get rewards for current user (referrer/counselor).

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "summary": {
      "total_earned": 85000,
      "total_pending": 25000,
      "total_withdrawn": 60000,
      "available_for_withdrawal": 25000
    }
  }
}
```

---

### POST `/rewards/withdraw`

Request withdrawal (for referrers).

**Request Body:**
```json
{
  "amount": 15000,
  "bank_account_id": "uuid"
}
```

---

### GET `/rewards/tiers`

Get reward tier configuration.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tier_name": "Bronze",
      "min_referrals": 1,
      "max_referrals": 5,
      "multiplier": 1.0,
      "bonus_amount": 0,
      "description": "1-5 successful referrals"
    },
    {
      "tier_name": "Gold",
      "min_referrals": 11,
      "max_referrals": 20,
      "multiplier": 1.5,
      "bonus_amount": 1500,
      "description": "11-20 successful referrals"
    }
  ]
}
```

---

## Leaderboard APIs

### GET `/leaderboard/referrers`

Get referrer leaderboard.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | string | all_time/monthly/weekly |
| `limit` | int | Number of entries (default: 10) |

**Response:**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "rank": 1,
        "user_id": "uuid",
        "user_name": "John Smith",
        "avatar_url": null,
        "total_referrals": 45,
        "total_admissions": 32,
        "conversion_rate": 71.1,
        "total_rewards": 450000,
        "tier": "Platinum",
        "growth_rate": 12.5
      }
    ],
    "current_user": {
      "rank": 12,
      "user_id": "uuid",
      "total_referrals": 15,
      "total_admissions": 8
    },
    "period": "monthly",
    "updated_at": "2024-12-10T00:00:00Z"
  }
}
```

---

### GET `/leaderboard/counselors`

Get counselor leaderboard.

---

### GET `/leaderboard/my-rank`

Get current user's rank and stats.

---

## Analytics APIs

### GET `/analytics/dashboard`

Get dashboard analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_referrals": 156,
      "pending_assignment": 12,
      "total_admissions": 67,
      "conversion_rate": 42.9,
      "total_rewards": 45600,
      "active_universities": 4
    },
    "recent_referrals": [...],
    "top_referrers": [...],
    "top_counselors": [...]
  }
}
```

---

### GET `/analytics/referrals`

Get detailed referral analytics.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `date_from` | date | Start date |
| `date_to` | date | End date |
| `group_by` | string | day/week/month |

**Response:**
```json
{
  "success": true,
  "data": {
    "time_series": [
      { "date": "2024-10", "referrals": 35, "admissions": 15 }
    ],
    "by_university": [
      { "university": "MIT", "referrals": 45, "admissions": 22, "conversion_rate": 48.9 }
    ],
    "by_program": [...],
    "by_status": {
      "submitted": 12,
      "assigned": 8,
      "contacted": 45,
      "admitted": 67,
      "rejected": 24
    },
    "conversion_funnel": {
      "submitted": 156,
      "assigned": 144,
      "contacted": 112,
      "admitted": 67
    },
    "avg_conversion_time_days": 32,
    "peak_month": "November",
    "top_program": "MBA Program"
  }
}
```

---

### GET `/analytics/rewards`

Get reward analytics.

---

### GET `/analytics/universities`

Get university-wise analytics.

---

### GET `/analytics/performance`

Get counselor/referrer performance analytics.

---

### GET `/analytics/my-analytics`

Get analytics for current referrer.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_referrals": 15,
    "successful_admissions": 8,
    "pending_referrals": 5,
    "rejected_referrals": 2,
    "conversion_rate": 53.3,
    "total_earnings": 85000,
    "pending_earnings": 25000,
    "withdrawn_earnings": 60000,
    "rank": 12,
    "tier": "Gold",
    "monthly_trend": [
      { "month": "2024-10", "referrals": 3, "admissions": 2 }
    ],
    "by_university": [
      { "university": "MIT", "count": 10 }
    ],
    "next_tier": {
      "name": "Platinum",
      "required_admissions": 10,
      "current_admissions": 8,
      "progress": 80
    }
  }
}
```

---

## Settings APIs

### GET `/settings`

Get all system settings (admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "general": {
      "system_name": "TeamLease EdTech Referral Portal",
      "default_timezone": "Asia/Kolkata",
      "multi_university_mode": true
    },
    "rewards": {
      "referrer_base_reward": 100,
      "counselor_base_reward": 75,
      "default_reward_type": "cashback",
      "slab_wise_progression": true
    },
    "notifications": {
      "new_referral_submission": true,
      "counselor_assignment": true,
      "status_updates": true,
      "admission_confirmation": true,
      "reward_disbursement": true
    },
    "security": {
      "session_timeout_minutes": 30,
      "require_2fa": false,
      "audit_logging": true
    }
  }
}
```

---

### PUT `/settings`

Update settings (admin only).

**Request Body:**
```json
{
  "category": "rewards",
  "settings": {
    "referrer_base_reward": 150,
    "slab_wise_progression": true
  }
}
```

---

### GET `/settings/{key}`

Get a specific setting.

---

### PUT `/settings/{key}`

Update a specific setting.

---

## Notification APIs

### GET `/notifications`

Get notifications for current user.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number |
| `limit` | int | Items per page |
| `is_read` | bool | Filter by read status |
| `category` | string | Filter by category |

---

### GET `/notifications/unread-count`

Get unread notification count.

---

### PATCH `/notifications/{id}/read`

Mark notification as read.

---

### PATCH `/notifications/read-all`

Mark all notifications as read.

---

### DELETE `/notifications/{id}`

Delete a notification.

---

## Export APIs

### GET `/export/referrals`

Export referrals to CSV.

**Query Parameters:**
Same as GET `/referrals` for filtering.

**Response:** CSV file download

---

### GET `/export/universities`

Export universities to CSV.

---

### GET `/export/rewards`

Export rewards to CSV.

---

### GET `/export/users`

Export users to CSV (admin only).

---

## WebSocket Events (Optional)

For real-time updates, implement WebSocket connections:

### Connection
```
ws://api.domain.com/ws?token=<jwt_token>
```

### Events
| Event | Description |
|-------|-------------|
| `referral.created` | New referral submitted |
| `referral.status_changed` | Referral status updated |
| `referral.assigned` | Counselor assigned |
| `reward.approved` | Reward approved |
| `reward.disbursed` | Reward disbursed |
| `notification.new` | New notification |

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate entry |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

---

## Rate Limiting

| Endpoint Type | Limit |
|---------------|-------|
| Authentication | 5 requests/minute |
| Read (GET) | 100 requests/minute |
| Write (POST/PUT/DELETE) | 30 requests/minute |
| Export | 5 requests/minute |

---

## Pagination Standard

All list endpoints use cursor-based or offset pagination:

```json
{
  "data": {
    "items": [...],
    "total": 156,
    "page": 1,
    "limit": 20,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## File Upload

For logo uploads and documents:

### POST `/upload`

**Request:** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| `file` | file | Image file (max 5MB) |
| `type` | string | logo/document/avatar |

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://storage.example.com/uploads/image.png",
    "filename": "image.png",
    "size": 125000,
    "mime_type": "image/png"
  }
}
```

---

## Versioning

API versioning is done via URL path:
- Current: `/v1/`
- Future: `/v2/`

---

## Summary: Total API Endpoints

| Category | Count |
|----------|-------|
| Authentication | 7 |
| Users | 7 |
| Universities | 8 |
| Programs | 5 |
| Referrals | 12 |
| Rewards | 10 |
| Leaderboard | 3 |
| Analytics | 6 |
| Settings | 4 |
| Notifications | 5 |
| Export | 4 |
| Upload | 1 |
| **Total** | **72** |

---

## Next Steps

1. Set up FastAPI project structure
2. Create SQLAlchemy models
3. Implement Pydantic schemas
4. Create API routers
5. Implement authentication
6. Add validation and error handling
7. Write unit tests
8. Set up CI/CD pipeline
9. Configure production deployment

