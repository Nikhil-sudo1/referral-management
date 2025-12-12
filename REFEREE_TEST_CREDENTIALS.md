# Referee (Student) Registration - Test Credentials

## 🎓 What is a Referee?
A **Referee** is a STUDENT who is being referred to university programs. Anyone can register as a referee through the public registration form.

---

## 📝 Test Credentials for New Referee Registration

### Option 1: Sarah Student
```
Name:        Sarah Student
Email:       sarah.student@example.com
Phone:       +1234567890
Password:    Student123!
Confirm:     Student123!
Organization: MIT
```

### Option 2: John Doe
```
Name:        John Doe
Email:       john.doe@example.com
Phone:       +9876543210
Password:    JohnDoe2024!
Confirm:     JohnDoe2024!
Organization: Harvard University
```

### Option 3: Emma Wilson
```
Name:        Emma Wilson
Email:       emma.wilson@example.com
Phone:       +1555123456
Password:    Emma@2024
Confirm:     Emma@2024
Organization: Stanford University
```

### Option 4: Make Your Own!
```
Name:        [Any name]
Email:       [Any email - must be unique]
Phone:       [Any phone number]
Password:    [Min 6 characters]
Confirm:     [Same as password]
Organization: [Optional]
```

---

## 🌐 How to Register a Referee

### Method 1: From Homepage (Easiest!)
1. Go to: **http://localhost:8080**
2. Click the **"Join as Student"** button (big button on homepage)
3. Fill in the form with credentials above
4. Click **"Sign Up"**

### Method 2: Direct URL
- Go directly to: **http://localhost:8080/register/referee**

### Method 3: From Login Page
1. Go to: **http://localhost:8080**
2. Click **"Login"** in the header
3. Click **"Sign Up"** tab
4. Fill in the form
5. Click **"Sign Up"**

---

## ✅ What Happens After Registration?

1. ✓ Account is created in the database
2. ✓ Role is set to **"referrer"** (this is normal - represents someone who can make or receive referrals)
3. ✓ You're **automatically logged in**
4. ✓ You're redirected to the **Dashboard**
5. ✓ You receive a **Welcome** toast notification

---

## 🔐 Existing Test Account (Already Created)

If you want to LOGIN instead of registering:
```
Email:    alex@example.com
Password: SecurePass123!
Role:     referrer
```

---

## ⚠️ Important Notes

### Password Requirements:
- Minimum 6 characters
- Must match in both Password and Confirm Password fields
- Recommended: Include uppercase, lowercase, number, and special character

### Email Requirements:
- Must be valid email format
- Must be unique (not already registered)
- Will be converted to lowercase

### Registration Creates "referrer" Role:
- The system currently creates all registrations as "referrer" role
- "Referrer" represents anyone who can participate in the referral system
- This includes both people who refer students AND students themselves

---

## 🧪 Testing Tips

### Test 1: Successful Registration
- Use any of the credentials above
- Should see success message
- Should be logged in automatically
- Should see dashboard

### Test 2: Duplicate Email
- Try registering with: alex@example.com
- Should see error: "Email already registered"

### Test 3: Password Mismatch
- Enter different passwords in Password and Confirm fields
- Should see validation error

### Test 4: Invalid Email
- Try: "notanemail"
- Should see validation error

---

## 📞 If Registration Fails

### Check:
1. **Backend is running** (should see it in PowerShell window)
2. **Frontend is running** (http://localhost:8080 loads)
3. **Browser console** (F12) for error messages
4. **Network tab** (F12) to see API requests

### Common Issues:
- **"Unable to connect"** = Backend not running
- **"Session Expired"** = Token/authentication issue
- **"Validation Error"** = Check all required fields are filled
- **"Email already registered"** = Use a different email

---

**Last Updated:** December 12, 2025  
**System Version:** 1.0.0

