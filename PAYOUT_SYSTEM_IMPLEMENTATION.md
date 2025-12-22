# Payout Approval System Implementation

## Overview
A two-level approval system for reward payouts:
1. **Student-Admin Approval** (First Level)
2. **Account Team Approval** (Second Level)
3. **Disbursement** (Final Step)

## Approval Workflow

```
Reward Created
    ↓
Status: pending_student_admin
    ↓
[Student-Admin Reviews & Approves]
    ↓
Status: pending_account_team
    ↓
[Account Team Reviews & Approves]
    ↓
Status: approved_account_team
    ↓
[Admin Disburses]
    ↓
Status: disbursed
```

## Database Changes

### Migration: `008_add_payout_approval_fields.py`
- Added `student_admin_approved_by` (UUID, FK to users)
- Added `student_admin_approved_at` (DateTime)
- Added `student_admin_approval_notes` (Text)
- Added `account_team_approved_by` (UUID, FK to users)
- Added `account_team_approved_at` (DateTime)
- Added `account_team_approval_notes` (Text)
- Updated status constraint to include new statuses

### New Status Values
- `pending_student_admin` - Waiting for student-admin approval
- `approved_student_admin` - Approved by student-admin (legacy)
- `pending_account_team` - Sent to account team for approval
- `approved_account_team` - Approved by account team, ready for disbursement

## Backend Implementation

### 1. Updated Models
- **`backend/app/models/reward.py`**: Added new approval tracking fields

### 2. Updated Services
- **`backend/app/services/reward_service.py`**:
  - `approve_by_student_admin()` - First level approval
  - `approve_by_account_team()` - Second level approval
  - Updated `create_reward()` to set initial status as `pending_student_admin`
  - Updated `disburse_reward()` to require `approved_account_team` status

### 3. New Dependencies
- **`backend/app/dependencies.py`**:
  - `get_student_admin()` - Validates student-admin role (role_id=3)
  - `get_account_team_user()` - Validates account team role (HR Admin or Business Head)

### 4. Updated Controllers
- **`backend/app/controllers/reward_controller.py`**:
  - `approve_by_student_admin()` - Handles student-admin approval
  - `approve_by_account_team()` - Handles account team approval

### 5. New API Routes
- **`backend/app/api/routes/rewards.py`**:
  - `PATCH /rewards/{reward_id}/approve-student-admin` - Student-admin approval
  - `PATCH /rewards/{reward_id}/approve-account-team` - Account team approval
  - `GET /rewards/payouts/pending-student-admin` - Get pending approvals for student-admin
  - `GET /rewards/payouts/pending-account-team` - Get pending approvals for account team

## Frontend Implementation

### 1. New Page
- **`frontend/src/pages/StudentAdminPayouts.tsx`**:
  - View pending payouts
  - Approve payouts with notes
  - View payout statistics
  - Search and filter functionality

### 2. Updated API Client
- **`frontend/src/lib/api/rewards.ts`**:
  - `approveByStudentAdmin()` - Approve payout
  - `getPendingStudentAdminApprovals()` - Get pending list
  - `approveByAccountTeam()` - Account team approval
  - `getPendingAccountTeamApprovals()` - Get account team pending list

### 3. Updated Routes
- **`frontend/src/App.tsx`**: Added `/student-admin/payouts` route

### 4. Updated Layout
- **`frontend/src/components/layout/StudentAdminLayout.tsx`**: Added "Payout Management" menu item

## User Roles & Permissions

### Student-Admin (role_id=3)
- ✅ View pending payouts
- ✅ Approve payouts (sends to account team)
- ✅ View approval history
- ❌ Cannot disburse
- ❌ Cannot approve at account team level

### Account Team (HR Admin role_id=1, Business Head role_id=2)
- ✅ View payouts pending account team approval
- ✅ Approve payouts (makes ready for disbursement)
- ✅ View full approval history
- ❌ Cannot approve at student-admin level

### Super Admin (HR Admin role_id=1)
- ✅ All account team permissions
- ✅ Can disburse approved payouts
- ✅ Full system access

## API Endpoints

### Student-Admin Endpoints
```
GET  /api/rewards/payouts/pending-student-admin?page=1&limit=20
PATCH /api/rewards/{reward_id}/approve-student-admin
Body: { "notes": "Optional approval notes" }
```

### Account Team Endpoints
```
GET  /api/rewards/payouts/pending-account-team?page=1&limit=20
PATCH /api/rewards/{reward_id}/approve-account-team
Body: { "notes": "Optional approval notes" }
```

## Status Flow

| Status | Description | Next Action |
|--------|-------------|-------------|
| `pending_student_admin` | Initial state, waiting for student-admin | Student-admin reviews & approves |
| `pending_account_team` | Approved by student-admin, sent to account team | Account team reviews & approves |
| `approved_account_team` | Approved by account team, ready for disbursement | Admin disburses the payout |
| `disbursed` | Final state, payout completed | - |

## Features

### Student-Admin Payout Page
- 📊 **Statistics Dashboard**: Pending count, approved count, total amount
- 🔍 **Search & Filter**: Search by referral code, user name; filter by status
- ✅ **Bulk Approval**: Approve multiple payouts (future enhancement)
- 📝 **Approval Notes**: Add notes when approving
- 📄 **Pagination**: Navigate through large lists
- 🔄 **Real-time Updates**: Refresh to see latest status

### Approval Process
1. Student-admin views pending payouts
2. Reviews payout details (referral code, user, amount)
3. Adds optional approval notes
4. Clicks "Approve & Send to Account Team"
5. Payout status changes to `pending_account_team`
6. Account team receives notification (future enhancement)
7. Account team reviews and approves
8. Status changes to `approved_account_team`
9. Admin can then disburse the payout

## Testing

### Test Scenarios
1. ✅ Create a reward → Status should be `pending_student_admin`
2. ✅ Student-admin approves → Status should be `pending_account_team`
3. ✅ Account team approves → Status should be `approved_account_team`
4. ✅ Admin disburses → Status should be `disbursed`
5. ✅ Verify approval tracking (who approved, when, notes)

### Test Credentials
- **Student-Admin**: Login with user_type_id=1, role_id=3
- **Account Team**: Login with user_type_id=1, role_id=1 (HR Admin) or role_id=2 (Business Head)

## Next Steps (Future Enhancements)

1. **Notifications**: Send email/notification when payout moves to next stage
2. **Bulk Approval**: Allow approving multiple payouts at once
3. **Rejection Flow**: Allow student-admin/account team to reject with reason
4. **Account Team Dashboard**: Create dedicated page for account team approvals
5. **Audit Trail**: Enhanced logging of all approval actions
6. **Export**: Export payout reports to Excel/PDF
7. **SLA Tracking**: Track time taken at each approval stage

## Files Modified/Created

### Backend
- ✅ `backend/alembic/versions/008_add_payout_approval_fields.py` (NEW)
- ✅ `backend/app/models/reward.py` (MODIFIED)
- ✅ `backend/app/services/reward_service.py` (MODIFIED)
- ✅ `backend/app/controllers/reward_controller.py` (MODIFIED)
- ✅ `backend/app/api/routes/rewards.py` (MODIFIED)
- ✅ `backend/app/dependencies.py` (MODIFIED)

### Frontend
- ✅ `frontend/src/pages/StudentAdminPayouts.tsx` (NEW)
- ✅ `frontend/src/lib/api/rewards.ts` (MODIFIED)
- ✅ `frontend/src/App.tsx` (MODIFIED)
- ✅ `frontend/src/components/layout/StudentAdminLayout.tsx` (MODIFIED)

## Migration Instructions

1. **Run Database Migration**:
   ```bash
   cd backend
   alembic upgrade head
   ```

2. **Restart Backend Server**:
   ```bash
   python -m uvicorn app.main:app --reload
   ```

3. **Frontend will auto-reload** (if using Vite dev server)

## Access the Feature

1. Login as **Student-Admin** (user_type_id=1, role_id=3)
2. Navigate to **"Payout Management"** in the sidebar
3. View pending payouts
4. Click **"Approve"** on any payout
5. Add notes (optional) and confirm
6. Payout will be sent to account team for final approval

---

**Status**: ✅ Implementation Complete
**Date**: December 22, 2025

