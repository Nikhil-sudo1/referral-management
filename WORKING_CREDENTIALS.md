# 🔐 WORKING LOGIN CREDENTIALS

**Last Updated:** December 22, 2025  
**Status:** ✅ Verified Working

---

## 🎯 **PRIMARY TEST CREDENTIALS**

### **Student Admin (For Payout Management)** ⭐ USE THIS
```
URL:      http://localhost:3001/login
Email:    student.admin@test.com
Password: test123
Role:     Student Admin (role_id = 3)
Status:   ✅ VERIFIED WORKING - API TESTED
```

### Alternative Student Admin Accounts:
```
Email:    amit.student@teamlease.com
Password: Password123!
Role:     Student Admin (role_id = 3)
```

```
Email:    amit.admin@teamlease.com
Password: Password123!
Role:     Student Admin (role_id = 3)
```

---

## 👥 **ALL AVAILABLE USERS BY ROLE**

### **Admin Users (user_type_id = 1)**

#### Human Resources (role_id = 1)
```
Email:    hr@teamlease.com
Password: Password123!
```

#### Business Head (role_id = 2)
```
Email:    businesshead@teamlease.com
Password: Password123!
```

#### Student Admin (role_id = 3) ⭐
```
Email:    amit.student@teamlease.com
Password: Password123!
Role:     Student Admin
Access:   ✅ Payout Management

Email:    amit.admin@teamlease.com  
Password: Password123!
Role:     Student Admin
Access:   ✅ Payout Management
```

### **Referral Partners (user_type_id = 2)**

#### Employee (role_id = 4)
```
Email:    employee@company.com
Password: Password123!
```

#### Student Referrer (role_id = 5)
```
Email:    alex@example.com
Password: password123
Role:     Student Referrer
Status:   ✅ VERIFIED WORKING
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

## 📝 **LOGIN STEPS FOR PAYOUT MANAGEMENT**

### **To Access Payout Management:**
1. Go to: `http://localhost:3001/login`
2. Select "Admin" tab
3. Enter credentials:
   - Email: `student.admin@test.com`
   - Password: `test123`
4. Click Login
5. Navigate to "Payout Management" in sidebar

---

## 🔧 **ROLE HIERARCHY**

```
User Types:
├── Admin (user_type_id = 1)
│   ├── Human Resources (role_id = 1)
│   ├── Business Head (role_id = 2)
│   └── Student Admin (role_id = 3) ⭐ Required for Payout Management
│
└── Referral Partner (user_type_id = 2)
    ├── Employee (role_id = 4)
    └── Student Referrer (role_id = 5)
```

---

## ⚠️ **TROUBLESHOOTING**

### "Validation Error" on Payout Management Page
- **Cause:** You're not logged in as Student Admin (role_id = 3)
- **Solution:** Log out and log in with `amit.student@teamlease.com`

### "Access Denied" Error
- **Cause:** Insufficient permissions for the current role
- **Solution:** Use Student Admin credentials for payout features

### Data Not Loading
1. Check if backend is running: `http://localhost:8000/docs`
2. Check browser console for errors
3. Verify you're logged in as Student Admin

---

## 📊 **TEST DATA AVAILABLE**

### Payout System Test Data:
- **17 rewards** with status `pending_student_admin`
- **Total Amount:** ₹7,18,750
- **Sample Rewards:**
  - ₹48,000 - SR-TES-0026
  - ₹31,250 - SR-ANA-0006
  - ₹33,000 - SR-ANA-0008
  - ₹80,000 - SR-TES-0014

All rewards are linked to real users and referrals.
