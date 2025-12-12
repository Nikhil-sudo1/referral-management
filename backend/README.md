# TeamLease EdTech Referral Portal - Backend

Production-ready FastAPI backend for the Referral Management System.

## Architecture

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── database.py          # Database connection and session
│   ├── dependencies.py      # FastAPI dependencies (auth, etc.)
│   │
│   ├── api/
│   │   └── routes/          # API route definitions
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── universities.py
│   │       ├── programs.py
│   │       ├── referrals.py
│   │       ├── rewards.py
│   │       ├── leaderboard.py
│   │       ├── analytics.py
│   │       └── notifications.py
│   │
│   ├── controllers/         # Request/response mapping
│   │   ├── auth_controller.py
│   │   ├── user_controller.py
│   │   └── ...
│   │
│   ├── services/            # Business logic
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── referral_service.py
│   │   └── ...
│   │
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── university.py
│   │   ├── program.py
│   │   ├── referral.py
│   │   └── ...
│   │
│   ├── schemas/             # Pydantic validation schemas
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── referral.py
│   │   └── ...
│   │
│   ├── core/                # Core utilities
│   │   ├── security.py      # JWT and password hashing
│   │   ├── exceptions.py    # Custom exceptions
│   │   └── logging.py       # Logging configuration
│   │
│   └── utils/               # Helper functions
│       └── helpers.py
│
├── requirements.txt
├── env.example             # Environment variables template
└── README.md
```

## Design Principles

1. **Clean Architecture**: Routes → Controllers → Services → Database
2. **Separation of Concerns**: Each layer has a single responsibility
3. **No Business Logic in Routes**: All logic resides in services
4. **Centralized Error Handling**: Custom exceptions with consistent responses
5. **Request/Response Validation**: Pydantic schemas for all endpoints

## Setup Instructions

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy example environment file
cp env.example .env

# Edit .env with your settings
```

**Required Environment Variables:**
```env
DATABASE_HOST=10.0.3.146
DATABASE_PORT=5432
DATABASE_NAME=referral
DATABASE_USER=referral
DATABASE_PASSWORD=R@f@iia1@2026

JWT_SECRET_KEY=your-secure-secret-key
```

### 4. Initialize Database

Run the database schema from `DATABASE_SCHEMA.sql` in your PostgreSQL database.

### 5. Run the Application

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

Once running, access the API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/register` | Register referrer |
| POST | `/api/v1/auth/refresh` | Refresh token |
| GET | `/api/v1/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | List users |
| POST | `/api/v1/users` | Create user |
| GET | `/api/v1/users/{id}` | Get user |
| PUT | `/api/v1/users/{id}` | Update user |
| DELETE | `/api/v1/users/{id}` | Delete user |

### Universities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/universities` | List universities |
| POST | `/api/v1/universities` | Create university |
| GET | `/api/v1/universities/{id}` | Get university |
| PUT | `/api/v1/universities/{id}` | Update university |
| GET | `/api/v1/universities/{id}/programs` | Get programs |

### Referrals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/referrals` | List referrals |
| POST | `/api/v1/referrals` | Create referral (admin) |
| POST | `/api/v1/referrals/submit` | Submit referral (referrer) |
| GET | `/api/v1/referrals/my-referrals` | My referrals |
| PATCH | `/api/v1/referrals/{id}/status` | Update status |
| POST | `/api/v1/referrals/{id}/assign` | Assign counselor |

### Rewards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/rewards` | List rewards |
| GET | `/api/v1/rewards/my-rewards` | My rewards |
| PATCH | `/api/v1/rewards/{id}/approve` | Approve reward |
| PATCH | `/api/v1/rewards/{id}/disburse` | Disburse reward |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/leaderboard/referrers` | Referrer leaderboard |
| GET | `/api/v1/leaderboard/counselors` | Counselor leaderboard |
| GET | `/api/v1/leaderboard/my-rank` | My rank |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/dashboard` | Dashboard stats |
| GET | `/api/v1/analytics/referrals` | Referral analytics |
| GET | `/api/v1/analytics/my-analytics` | My analytics |

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Token Types
- **Access Token**: Short-lived (60 min), used for API requests
- **Refresh Token**: Long-lived (7 days), used to get new access tokens

### Usage
```bash
# Login to get tokens
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use access token in requests
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <access_token>"
```

## User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| super_admin | Full system access | All operations |
| manager | Admin panel access | Most admin operations |
| counselor | Process referrals | View/update assigned referrals |
| referrer | Submit referrals | Submit and view own referrals |

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

## Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=app tests/
```

## Production Deployment

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Environment Variables for Production

```env
DEBUG=False
ENVIRONMENT=production
JWT_SECRET_KEY=<strong-random-key>
LOG_LEVEL=INFO
```

## License

Proprietary - TeamLease EdTech

