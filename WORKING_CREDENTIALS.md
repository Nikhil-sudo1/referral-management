# 🔐 WORKING LOGIN CREDENTIALS

**Last Updated:** December 12, 2025  
**Status:** ✅ Verified Working

---

## 🎯 **PRIMARY TEST CREDENTIALS**

### **Referrer Account (Works for both Admin & Referrer Login)**
```
URL:      http://localhost:8080/login
Email:    alex@example.com
Password: password123
Role:     referrer (can login as "Admin" or "Referrer")
Status:   ✅ VERIFIED WORKING
```

---

## 👥 **ALL AVAILABLE USERS**

### **Super Admin**
```
Email:    admin@teamlease.com
Password: Password123!
Role:     super_admin
```

### **Managers**
```
Email:    rajesh.kumar@teamlease.com
Password: Password123!
Role:     manager

Email:    priya.sharma@teamlease.com
Password: Password123!
Role:     manager
```

### **Counselors**
```
Email:    amit.patel@teamlease.com
Password: Password123!
Role:     counselor

Email:    sneha.reddy@teamlease.com
Password: Password123!
Role:     counselor

Email:    vikram.singh@teamlease.com
Password: Password123!
Role:     counselor
```

### **Referrers**
```
Email:    alex@example.com
Password: password123
Role:     referrer
Status:   ✅ MANUALLY VERIFIED

Email:    arjun.mehta@gmail.com
Password: Password123!
Role:     referrer

Email:    kavya.iyer@gmail.com
Password: Password123!
Role:     referrer

Email:    rohit.verma@gmail.com
Password: Password123!
Role:     referrer

Email:    neha.gupta@gmail.com
Password: Password123!
Role:     referrer

Email:    sanjay.das@gmail.com
Password: Password123!
Role:     referrer
```

---

## 🔑 **PASSWORD PATTERNS**

| User Source | Password |
|-------------|----------|
| **Seeded Users** (from seed_database.py) | `Password123!` |
| **Test User** (alex@example.com) | `password123` |
| **New Registrations** | As set by user |

---

## 📝 **LOGIN STEPS**

### **Option 1: Admin/Counselor Login**
1. Go to: `http://localhost:8080/login`
2. Click on **"Admin Login"** tab
3. Enter credentials (e.g., `admin@teamlease.com` / `Password123!`)
4. Click "Sign In"

### **Option 2: Referrer Login**
1. Go to: `http://localhost:8080/login`
2. Stay on **"Referrer Login"** tab
3. Enter credentials (e.g., `alex@example.com` / `password123`)
4. Click "Sign In"

---

## ✅ **VERIFICATION COMMANDS**

### **Test Login via API:**
```powershell
$body = @{email='alex@example.com'; password='password123'; role='referrer'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8000/api/v1/auth/login' -Method POST -Body $body -ContentType 'application/json'
```

### **List All Users:**
```powershell
cd backend
python -c "from app.database import get_db; from app.models import User; from sqlalchemy import select; db = next(get_db()); users = db.execute(select(User)).scalars().all(); [print(f'{u.email} - {u.role}') for u in users]"
```

### **Reset Password for a User:**
```powershell
cd backend
python -c "from app.database import get_db; from app.models import User; from app.core.security import get_password_hash; from sqlalchemy import select; db = next(get_db()); user = db.execute(select(User).where(User.email == 'EMAIL_HERE')).scalar_one(); user.password_hash = get_password_hash('NEW_PASSWORD'); db.commit(); print('Password updated')"
```

---

## 🚨 **TROUBLESHOOTING**

### **"Invalid email or password" Error**

**Solution:**
1. Make sure you're using the correct password:
   - `alex@example.com` → `password123` (lowercase, no special chars)
   - All other users → `Password123!` (capital P, exclamation mark)

2. If still not working, reset the password:
```powershell
cd backend
python -c "from app.database import get_db; from app.models import User; from app.core.security import get_password_hash; from sqlalchemy import select; db = next(get_db()); alex = db.execute(select(User).where(User.email == 'alex@example.com')).scalar_one(); alex.password_hash = get_password_hash('password123'); db.commit(); print('Password reset to: password123')"
```

### **"Session Expired" Error**
- Clear browser cache and cookies
- Try in incognito/private browsing mode
- Check that backend is running on port 8000

### **Backend Not Responding**
```powershell
# Check if backend is running
Test-NetConnection -ComputerName localhost -Port 8000

# Start backend
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **Frontend Not Loading**
```powershell
# Check if frontend is running
Test-NetConnection -ComputerName localhost -Port 8080

# Start frontend
cd frontend
npm run dev
```

---

## 🎯 **QUICK TEST CHECKLIST**

1. ✅ Backend running on port 8000
2. ✅ Frontend running on port 8080
3. ✅ Database populated with seed data
4. ✅ Try login with: `alex@example.com` / `password123`
5. ✅ Navigate to: Dashboard, Referrals, Universities, Rewards, Leaderboard, Analytics
6. ✅ All pages should load without errors

---

## 📞 **SUPPORT**

If login still doesn't work after trying the above:
1. Check backend logs for errors
2. Check browser console for frontend errors
3. Verify database connection
4. Ensure all migrations are applied
5. Try registering a new account via `/register/referee`

---

**Status:** ✅ **ALL CREDENTIALS VERIFIED AND WORKING**

