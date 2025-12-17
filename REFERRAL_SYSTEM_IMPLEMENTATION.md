# Referral Management System - Complete Implementation Guide

## Overview
This document outlines the complete implementation of the Referral Management System with all required features including landing page, sign-up flow, email verification, and comprehensive dashboard.

## ✅ Completed Components

### 1. Landing Page (`frontend/src/pages/Landing.tsx`)
- ✅ Clean, modern design with hero banner
- ✅ Sign-up button and navigation
- ✅ Features section
- ✅ How it works section
- ✅ Stats section
- ✅ Footer with contact information

### 2. Sign-Up Flow
- ✅ **Frontend** (`frontend/src/pages/SignUp.tsx`):
  - Full Name, Mobile, Email, Category (Referee/Vendor) fields
  - Password validation
  - Form submission with API integration
  
- ✅ **Backend**:
  - Updated `RegisterRequest` schema with `category` field
  - Email verification token generation
  - Verification email sending (service created)

### 3. Email Verification
- ✅ **Frontend** (`frontend/src/pages/VerifyEmail.tsx`):
  - Token verification page
  - Success/error states
  - Redirect to login after verification
  
- ✅ **Backend**:
  - `EmailService` for token generation and verification
  - `/auth/verify-email` endpoint
  - Token expiry (24 hours)
  - User verification flag update

### 4. Database Models Updated
- ✅ **User Model**:
  - Added `category` field (Referee/Vendor)
  - Added `verification_token` and `verification_token_expires`
  - Added bank details fields (`bank_name`, `bank_account_number`, `bank_ifsc`, `bank_account_holder_name`)
  - Added `theme_preference` field
  
- ✅ **Referral Model**:
  - Added `region` field for filtering
  - Added `stage` field (New, In-Progress, Closed Won, Closed Lost/Drop)
  - Updated `status` to support Hot/Warm/Cold
  
- ✅ **University Model**:
  - Added `region` field for filtering

### 5. My Referrals Page (`frontend/src/pages/MyReferrals.tsx`)
- ✅ List view with all referrals
- ✅ Add Referral button and form
- ✅ Search functionality
- ✅ Region-based university filtering
- ✅ University-based course filtering
- ✅ Status and Stage badges

## 🔄 In Progress / To Complete

### 6. Dashboard Layout
The existing `ReferrerLayout` component can be enhanced with:
- Profile preview in top navigation
- Enhanced sidebar menu
- Theme toggle integration

### 7. Leaderboard Page
**Requirements:**
- Display top-performing referees/vendors
- Ranking based on conversions (referral → admission)
- Show: Profile image, Name, Rank, Total admissions

**Implementation needed:**
```typescript
// frontend/src/pages/Leaderboard.tsx
- Fetch leaderboard data from API
- Display rankings with profile images
- Show total admissions count
- Pagination for large lists
```

**Backend API needed:**
```python
# GET /api/v1/leaderboard
# Returns: List of users sorted by successful admissions
```

### 8. Referral Status Page
**Requirements:**
- List view with pagination
- Search bar (name, phone, email)
- Filters: University, Course, Status (Hot/Warm/Cold), Stage
- Show: Referral details, Stage, Updated status, Assigned counselor

**Implementation needed:**
```typescript
// frontend/src/pages/ReferralStatus.tsx
- Advanced search and filters
- Paginated table view
- Status and stage filtering
- Counselor assignment display
```

### 9. Rewards Page
**Requirements:**
- Rewards Summary (total admissions, total rewards earned)
- Achievements/Milestones (Bronze: 10, Silver: 25, Gold: 50 admissions)
- Upcoming Rewards (future milestones)

**Implementation needed:**
```typescript
// frontend/src/pages/Rewards.tsx
- Calculate total admissions from referrals
- Calculate total rewards earned
- Display achievement badges
- Show progress to next milestone
```

**Backend API needed:**
```python
# GET /api/v1/rewards/summary
# Returns: Total admissions, total rewards, achievements unlocked
```

### 10. Settings Page
**Requirements:**
- Edit Profile
- Add/Edit Bank Details
- Change Theme (Dark/Light)
- Help & Support section with:
  - FAQ answers
  - Support email: teamlease@edtech.com (opens Gmail)

**Implementation needed:**
```typescript
// frontend/src/pages/Settings.tsx
- Profile edit form
- Bank details form
- Theme toggle
- Help section with FAQ
- Email link that opens Gmail
```

**Backend API needed:**
```python
# PUT /api/v1/users/me/profile
# PUT /api/v1/users/me/bank-details
# PUT /api/v1/users/me/theme
```

## Database Schema Updates

### Migration Required
Create Alembic migration to add new fields:

```python
# alembic/versions/xxx_add_new_fields.py
def upgrade():
    # Add to users table
    op.add_column('users', sa.Column('category', sa.String(50)))
    op.add_column('users', sa.Column('verification_token', sa.String(255)))
    op.add_column('users', sa.Column('verification_token_expires', sa.DateTime()))
    op.add_column('users', sa.Column('bank_name', sa.String(255)))
    op.add_column('users', sa.Column('bank_account_number', sa.String(50)))
    op.add_column('users', sa.Column('bank_ifsc', sa.String(20)))
    op.add_column('users', sa.Column('bank_account_holder_name', sa.String(255)))
    op.add_column('users', sa.Column('theme_preference', sa.String(20), default='light'))
    
    # Add to referrals table
    op.add_column('referrals', sa.Column('region', sa.String(100)))
    op.add_column('referrals', sa.Column('stage', sa.String(50), default='New'))
    
    # Add to universities table
    op.add_column('universities', sa.Column('region', sa.String(100)))
    
    # Create indexes
    op.create_index('idx_users_category', 'users', ['category'])
    op.create_index('idx_users_verification_token', 'users', ['verification_token'])
    op.create_index('idx_referrals_region', 'referrals', ['region'])
    op.create_index('idx_referrals_stage', 'referrals', ['stage'])
    op.create_index('idx_universities_region', 'universities', ['region'])
```

## API Endpoints Structure

### Authentication
- ✅ `POST /api/v1/auth/register` - Register new user with category
- ✅ `GET /api/v1/auth/verify-email?token=xxx` - Verify email
- ✅ `POST /api/v1/auth/login` - Login (requires verified email)
- ✅ `GET /api/v1/auth/me` - Get current user

### Referrals
- ✅ `GET /api/v1/referrals/my-referrals` - Get user's referrals
- ✅ `POST /api/v1/referrals/submit` - Submit new referral
- 🔄 `GET /api/v1/referrals/status` - Get referrals with filters (needs enhancement)
- 🔄 `PUT /api/v1/referrals/{id}/stage` - Update referral stage

### Leaderboard
- 🔄 `GET /api/v1/leaderboard` - Get leaderboard rankings

### Rewards
- 🔄 `GET /api/v1/rewards/summary` - Get rewards summary
- 🔄 `GET /api/v1/rewards/achievements` - Get achievements

### Settings
- 🔄 `PUT /api/v1/users/me/profile` - Update profile
- 🔄 `PUT /api/v1/users/me/bank-details` - Update bank details
- 🔄 `PUT /api/v1/users/me/theme` - Update theme preference

## Frontend Routes

Update `frontend/src/App.tsx` to include:
```typescript
<Route path="/" element={<Landing />} />
<Route path="/signup" element={<SignUp />} />
<Route path="/verify-email" element={<VerifyEmail />} />
<Route path="/my-referrals" element={<MyReferrals />} />
<Route path="/leaderboard" element={<Leaderboard />} />
<Route path="/referral-status" element={<ReferralStatus />} />
<Route path="/rewards" element={<Rewards />} />
<Route path="/settings" element={<Settings />} />
```

## Email Configuration

Update `backend/app/config.py`:
```python
# Email settings
FRONTEND_URL: str = "http://localhost:8080"
EMAIL_FROM: str = "noreply@teamlease.edtech.com"
SMTP_HOST: str = "smtp.gmail.com"
SMTP_PORT: int = 587
SMTP_USER: str = ""
SMTP_PASSWORD: str = ""
```

## Testing Checklist

- [ ] Sign-up flow with email verification
- [ ] Email verification link works
- [ ] Login requires verified email
- [ ] My Referrals page displays correctly
- [ ] Add Referral form works with region/university/course filtering
- [ ] Leaderboard displays rankings
- [ ] Referral Status page with filters
- [ ] Rewards page shows achievements
- [ ] Settings page updates profile/bank/theme
- [ ] Help section email link opens Gmail

## Next Steps

1. **Complete remaining pages:**
   - Leaderboard page
   - Referral Status page
   - Rewards page
   - Settings page

2. **Backend API endpoints:**
   - Leaderboard endpoint
   - Rewards summary endpoint
   - User profile/bank/theme update endpoints

3. **Database migration:**
   - Run Alembic migration to add new fields

4. **Email service integration:**
   - Configure SMTP settings
   - Test email sending

5. **Testing:**
   - End-to-end testing of all flows
   - Integration testing

## Notes

- Email verification is implemented but uses logging in development. Configure SMTP for production.
- Theme preference is stored but theme toggle UI needs to be connected.
- Bank details form needs validation and secure storage.
- All API endpoints follow RESTful conventions and return BaseResponse format.

