# API Quick Reference Guide

## Base URL
```
http://localhost:8000/v1
```

## Authentication Header
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login user |
| POST | `/auth/register` | Register referrer |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/logout` | Logout user |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |
| GET | `/auth/me` | Get current user |

---

## 👥 Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users |
| POST | `/users` | Create user |
| GET | `/users/{id}` | Get user details |
| PUT | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user |
| GET | `/users/counselors` | List counselors |
| GET | `/users/referrers` | List referrers |

---

## 🏫 Universities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/universities` | List universities |
| POST | `/universities` | Create university |
| GET | `/universities/{id}` | Get university details |
| PUT | `/universities/{id}` | Update university |
| DELETE | `/universities/{id}` | Delete university |
| PATCH | `/universities/{id}/status` | Toggle status |
| GET | `/universities/{id}/programs` | List programs |
| POST | `/universities/{id}/programs` | Create program |

---

## 📚 Programs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/programs` | List all programs |
| GET | `/programs/{id}` | Get program details |
| PUT | `/programs/{id}` | Update program |
| DELETE | `/programs/{id}` | Delete program |

---

## 📝 Referrals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/referrals` | List referrals |
| POST | `/referrals` | Create referral (admin) |
| POST | `/referrals/submit` | Submit referral (referrer) |
| GET | `/referrals/{id}` | Get referral details |
| PUT | `/referrals/{id}` | Update referral |
| PATCH | `/referrals/{id}/status` | Update status |
| POST | `/referrals/{id}/assign` | Assign counselor |
| GET | `/referrals/my-referrals` | Referrer's referrals |
| GET | `/referrals/assigned` | Counselor's referrals |
| GET | `/referrals/stats` | Get statistics |
| GET | `/referrals/referee/{email}` | Referee history |

---

## 💰 Rewards

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rewards` | List rewards |
| POST | `/rewards` | Create reward |
| GET | `/rewards/{id}` | Get reward details |
| PATCH | `/rewards/{id}/approve` | Approve reward |
| PATCH | `/rewards/{id}/disburse` | Disburse reward |
| PATCH | `/rewards/{id}/cancel` | Cancel reward |
| GET | `/rewards/my-rewards` | Current user rewards |
| POST | `/rewards/withdraw` | Request withdrawal |
| GET | `/rewards/tiers` | Get tier config |

---

## 🏆 Leaderboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leaderboard/referrers` | Referrer leaderboard |
| GET | `/leaderboard/counselors` | Counselor leaderboard |
| GET | `/leaderboard/my-rank` | Current user rank |

---

## 📊 Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/dashboard` | Dashboard data |
| GET | `/analytics/referrals` | Referral analytics |
| GET | `/analytics/rewards` | Reward analytics |
| GET | `/analytics/universities` | University analytics |
| GET | `/analytics/performance` | Performance metrics |
| GET | `/analytics/my-analytics` | Referrer analytics |

---

## ⚙️ Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings` | Get all settings |
| PUT | `/settings` | Update settings |
| GET | `/settings/{key}` | Get specific setting |
| PUT | `/settings/{key}` | Update specific setting |

---

## 🔔 Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List notifications |
| GET | `/notifications/unread-count` | Unread count |
| PATCH | `/notifications/{id}/read` | Mark as read |
| PATCH | `/notifications/read-all` | Mark all read |
| DELETE | `/notifications/{id}` | Delete notification |

---

## 📤 Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/export/referrals` | Export referrals CSV |
| GET | `/export/universities` | Export universities CSV |
| GET | `/export/rewards` | Export rewards CSV |
| GET | `/export/users` | Export users CSV |

---

## 📁 Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload file |

---

## Common Query Parameters

### Pagination
```
?page=1&limit=20
```

### Search
```
?search=john
```

### Filtering
```
?status=active&role=counselor
```

### Date Range
```
?date_from=2024-01-01&date_to=2024-12-31
```

### Sorting
```
?sort_by=name&sort_order=asc
```

---

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    { "field": "email", "message": "Invalid email" }
  ]
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |

---

## Total Endpoints: 72

