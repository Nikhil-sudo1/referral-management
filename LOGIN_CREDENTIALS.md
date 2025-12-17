# Login Credentials for Testing

## 🔐 Test User Accounts

All test accounts use the same password: **`Password123!`**

---

### 1. **Super Admin** (Full System Access)
```
Email:    admin@teamlease.com
Password: Password123!
Role:     super_admin
```

**Permissions:**
- Full access to all features
- User management
- System configuration
- All reports and analytics

---

### 2. **Manager**
```
Email:    rajesh.kumar@teamlease.com
Password: Password123!
Role:     manager
```

**Permissions:**
- Manage counselors
- View all referrals
- Approve rewards
- Access analytics

---

### 3. **Counselor**
```
Email:    amit.patel@teamlease.com
Password: Password123!
Role:     counselor
```

**Permissions:**
- Manage assigned referrals
- Update referral status
- View universities and programs
- Limited analytics

---

### 4. **Referrer** (Student)
```
Email:    arjun.mehta@gmail.com
Password: Password123!
Role:     referrer
```

**Permissions:**
- Submit new referrals
- View own referrals
- Track rewards
- View leaderboard

---

## 📊 Database Statistics

The database has been seeded with:
- ✅ **11 Users** (various roles)
- ✅ **8 Universities** (IITs, NITs, etc.)
- ✅ **43 Programs** (B.Tech, M.Tech, MBA, etc.)
- ✅ **31 Referrals** (various statuses)
- ✅ **8 Rewards** (pending and approved)
- ✅ **4 Reward Tiers** (Bronze, Silver, Gold, Platinum)

---

## 🧪 Testing Different Roles

### Test as Admin:
1. Login with `admin@teamlease.com`
2. Access all features
3. Manage users, universities, programs
4. View comprehensive analytics

### Test as Referrer:
1. Login with `arjun.mehta@gmail.com`
2. Submit new referrals
3. Track your referrals
4. View rewards and leaderboard

### Test as Counselor:
1. Login with `amit.patel@teamlease.com`
2. Manage assigned referrals
3. Update referral statuses
4. Communicate with referrers

### Test as Manager:
1. Login with `rajesh.kumar@teamlease.com`
2. Oversee all operations
3. Approve rewards
4. Generate reports

---

## 🔄 Re-seeding the Database

If you need to reset the database with fresh data:

```powershell
cd backend
.\venv\Scripts\python.exe seed_database.py
```

This will:
- Clear all existing data
- Create fresh test users
- Populate universities and programs
- Generate sample referrals and rewards

---

## 🌐 Application URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://127.0.0.1:8000
- **API Docs**: http://127.0.0.1:8000/docs
- **Health Check**: http://127.0.0.1:8000/health

---

## ✅ Verified Working

All login endpoints have been tested and verified:
- ✅ Admin login works
- ✅ Manager login works
- ✅ Counselor login works
- ✅ Referrer login works
- ✅ JWT tokens generated correctly
- ✅ User data returned properly

---

## 🔐 Security Notes

**For Production:**
- Change all default passwords
- Use strong, unique passwords
- Enable two-factor authentication
- Implement password policies
- Use environment variables for secrets
- Enable rate limiting on login endpoint

**Current Setup:**
- Passwords are hashed with bcrypt
- JWT tokens expire after 1 hour
- Refresh tokens valid for 7 days
- Role-based access control (RBAC) implemented

---

## 📝 Additional Test Users

The seed script creates these additional users:

| Name | Email | Role |
|------|-------|------|
| Priya Sharma | priya.sharma@teamlease.com | counselor |
| Vikram Singh | vikram.singh@teamlease.com | counselor |
| Sneha Reddy | sneha.reddy@gmail.com | referrer |
| Rahul Verma | rahul.verma@gmail.com | referrer |
| Ananya Iyer | ananya.iyer@gmail.com | referrer |
| Karthik Nair | karthik.nair@gmail.com | referrer |
| Neha Gupta | neha.gupta@gmail.com | referrer |

All use password: **`Password123!`**

---

## 🎯 Quick Start

1. **Start Backend**: Already running on port 8000 ✓
2. **Start Frontend**: Check PowerShell window for status
3. **Open Browser**: http://localhost:5173
4. **Login**: Use any credentials above
5. **Explore**: Test different features and roles!

---

**Last Updated**: December 17, 2024  
**Database Seeded**: Yes ✓  
**Login Status**: Working ✓

