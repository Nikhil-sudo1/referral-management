# Test Credentials

## Test User Account

You can use these credentials to test the system:

### Referrer Account
- **Email:** alex@example.com
- **Password:** SecurePass123!
- **Role:** referrer
- **Name:** Alex Johnson
- **Organization:** Stanford University

## How to Use

### Login to Frontend
1. Open http://localhost:8080
2. Click "Login/Register" or "Join as Student"
3. Use the credentials above
4. You'll be automatically logged in

### API Testing (via Swagger UI)
1. Open http://localhost:8000/docs
2. Click "Authorize" button (top right)
3. First, register or login to get a token:
   - Go to `/api/v1/auth/login` endpoint
   - Click "Try it out"
   - Enter credentials:
     ```json
     {
       "email": "alex@example.com",
       "password": "SecurePass123!",
       "role": "referrer"
     }
     ```
   - Copy the `access_token` from response
4. Paste the token in the authorization modal (with "Bearer " prefix)
5. Now you can test all protected endpoints

## Creating New Users

### Via Frontend
1. Go to http://localhost:8080
2. Click "Join as Student" button
3. Fill in the registration form:
   - Name
   - Email
   - Phone
   - Password (min 6 characters)
   - Confirm Password
   - Organization (optional)
4. Submit - you'll be automatically logged in

### Via API (Swagger UI)
1. Go to http://localhost:8000/docs
2. Find `/api/v1/auth/register` endpoint
3. Click "Try it out"
4. Enter user details:
   ```json
   {
     "name": "Your Name",
     "email": "your.email@example.com",
     "phone": "+1234567890",
     "password": "YourPassword123!",
     "confirm_password": "YourPassword123!",
     "organization": "Your Organization"
   }
   ```
5. Execute - you'll get back tokens and user info

## User Roles

The system supports 4 roles:
- **referrer**: Students who refer other students (default for registration)
- **counselor**: Staff who handle referrals
- **manager**: Managers who oversee operations
- **super_admin**: System administrators

**Note:** Currently, registration only creates `referrer` accounts. To create other roles, you'll need to:
1. Register as referrer
2. Manually update the role in the database, OR
3. Create admin endpoints for user management

## Creating Admin Users

To create an admin user, you can use direct database access:

```sql
-- Connect to your database
psql -h 10.0.3.146 -U referral -d referral

-- Update a user's role
UPDATE users SET role = 'super_admin' WHERE email = 'admin@example.com';
```

Or create a Python script:

```python
from app.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()

admin = User(
    email="admin@example.com",
    password_hash=get_password_hash("AdminPass123!"),
    name="System Admin",
    phone="+1234567890",
    role="super_admin",
    organization="TeamLease EdTech",
    is_active=True,
    is_verified=True
)

db.add(admin)
db.commit()
print(f"Admin created: {admin.email}")
```

## Testing Different Flows

### 1. Referee Registration (Student)
- Use `/register/referee` route or "Join as Student" button
- Creates a `referrer` role account
- Can submit referrals
- Can view their own referrals and rewards

### 2. Referrer Portal
- Login with referrer account
- Access referrer-specific pages
- Submit referrals
- Track rewards

### 3. Admin Portal (Future)
- Login with admin/manager account
- Manage users, universities, programs
- Approve/reject referrals
- Process rewards

## Password Requirements

- Minimum 6 characters
- No special requirements (but recommended: uppercase, lowercase, number, special char)
- Stored as bcrypt hash in database

## Token Information

### Access Token
- **Expires:** 60 minutes (3600 seconds)
- **Type:** JWT (HS256)
- **Use:** Include in Authorization header as `Bearer <token>`

### Refresh Token
- **Expires:** 7 days
- **Type:** JWT (HS256)
- **Use:** Call `/api/v1/auth/refresh` to get new access token

## Security Notes

⚠️ **Development Mode**
- These are test credentials for development
- Do NOT use in production
- Change all credentials and secrets before deploying

🔒 **Production Checklist**
- [ ] Change JWT_SECRET_KEY
- [ ] Enable HTTPS
- [ ] Implement rate limiting
- [ ] Add email verification
- [ ] Enable stronger password requirements
- [ ] Add 2FA (optional)
- [ ] Implement session management
- [ ] Add audit logging

---

**Last Updated:** December 12, 2025

