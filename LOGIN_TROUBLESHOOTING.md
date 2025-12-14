# 🔧 LOGIN TROUBLESHOOTING GUIDE

**Status:** Backend Working ✅ | Frontend Running ✅  
**Updated:** December 12, 2025

---

## ✅ **VERIFIED WORKING CREDENTIALS**

```
Email:    alex@example.com
Password: password123
```

**Backend API Test:** ✅ PASSED  
**CORS Test:** ✅ PASSED

---

## 🧪 **QUICK TEST OPTIONS**

### **Option 1: Test with HTML File (Recommended)**

1. Open `test_login.html` in your browser:
   ```
   file:///C:/Users/tledt/OneDrive/Documents/refreel%20management/referral-management/test_login.html
   ```

2. Click "Test Login" button
3. Should show ✅ Login Successful with user details

---

### **Option 2: Test in Browser Console**

1. Open `http://localhost:8080`
2. Press `F12` to open Developer Tools
3. Go to "Console" tab
4. Paste and run:

```javascript
fetch('http://localhost:8000/api/v1/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        email: 'alex@example.com',
        password: 'password123'
    })
})
.then(r => r.json())
.then(d => console.log('SUCCESS:', d))
.catch(e => console.error('ERROR:', e));
```

---

### **Option 3: Clear Browser Cache & Try Again**

1. Go to `http://localhost:8080/login`
2. Press `Ctrl + Shift + Delete`
3. Clear:
   - ✅ Cookies and other site data
   - ✅ Cached images and files
4. Close browser completely
5. Reopen browser
6. Go to `http://localhost:8080/login`
7. Enter credentials and login

---

## 🔍 **COMMON ISSUES & SOLUTIONS**

### **Issue 1: "Invalid email or password"**

**Causes:**
- Wrong password
- User doesn't exist in database

**Solutions:**
```powershell
# Reset password
cd backend
python -c "from app.database import get_db; from app.models import User; from app.core.security import get_password_hash; from sqlalchemy import select; db = next(get_db()); alex = db.execute(select(User).where(User.email == 'alex@example.com')).scalar_one(); alex.password_hash = get_password_hash('password123'); db.commit(); print('Password reset to: password123')"
```

---

### **Issue 2: "Network Error" or "Unable to connect"**

**Check:**
```powershell
# Test backend
Test-NetConnection -ComputerName localhost -Port 8000

# If fails, restart backend
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

### **Issue 3: "Session Expired" immediately after login attempt**

**Cause:** Frontend receiving 401 error

**Solutions:**

1. **Check browser console for actual error**
   - Press `F12`
   - Go to "Network" tab
   - Try logging in
   - Click on "login" request
   - Check "Response" tab

2. **Clear all localStorage**
   ```javascript
   // In browser console (F12)
   localStorage.clear();
   location.reload();
   ```

---

### **Issue 4: Login button does nothing**

**Causes:**
- JavaScript error
- Form validation issue

**Solutions:**

1. **Check console for errors**
   - Press `F12`
   - Look for red errors
   
2. **Try test page**
   - Open `test_login.html`
   - If that works, it's a frontend issue

---

## 🔄 **NUCLEAR OPTION: Complete Reset**

If nothing works, do a complete reset:

```powershell
# Step 1: Stop everything
# Press Ctrl+C in backend terminal
# Press Ctrl+C in frontend terminal

# Step 2: Kill all processes
Get-Process | Where-Object {$_.ProcessName -like "*python*"} | Stop-Process -Force
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force

# Step 3: Clear frontend cache
cd frontend
Remove-Item -Recurse -Force node_modules/.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# Step 4: Start backend
cd ../backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Step 5: In NEW terminal, start frontend
cd frontend
npm run dev

# Step 6: Clear browser
# Close ALL browser windows
# Reopen browser
# Go to http://localhost:8080/login
```

---

## 📊 **DIAGNOSTIC COMMANDS**

### **Check if user exists:**
```powershell
cd backend
python -c "from app.database import get_db; from app.models import User; from sqlalchemy import select; db = next(get_db()); user = db.execute(select(User).where(User.email == 'alex@example.com')).scalar_one_or_none(); print(f'User exists: {user is not None}'); print(f'Name: {user.name if user else None}'); print(f'Role: {user.role if user else None}')"
```

### **Test login via API:**
```powershell
$body = @{email='alex@example.com'; password='password123'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8000/api/v1/auth/login' -Method POST -Body $body -ContentType 'application/json'
```

### **Check backend logs:**
```powershell
# Look at terminal where backend is running
# Should see HTTP requests when you try to login
```

### **Check frontend logs:**
```powershell
# Open browser console (F12)
# Try login
# Look for errors in Console tab
# Look for failed requests in Network tab
```

---

## 🎯 **WHAT SHOULD WORK**

After following any of the solutions above:

1. Go to `http://localhost:8080/login`
2. Enter:
   - Email: `alex@example.com`
   - Password: `password123`
3. Click "Sign In"
4. Should redirect to dashboard
5. Should see user name in top right

---

## 📞 **NEXT STEPS**

If login still doesn't work:

1. ✅ Test with `test_login.html` - does it work?
   - **YES** → Frontend issue, check browser console
   - **NO** → Backend issue, check backend logs

2. ✅ Check browser Network tab - what's the actual error?
   - Status 401 → Wrong password
   - Status 422 → Validation error  
   - Status 500 → Backend error
   - No request → Frontend not sending request

3. ✅ Check browser Console tab - any JavaScript errors?
   - Yes → Frontend code issue
   - No → Backend/network issue

---

## 💡 **TIP: Use Test HTML**

The `test_login.html` file bypasses the React app entirely and tests the API directly. If this works, you know:
- ✅ Backend is working
- ✅ CORS is configured
- ✅ Credentials are correct
- ⚠️ Issue is in the React frontend

---

**Remember:** We verified the backend API is working perfectly. The issue is likely:
1. Browser cache/localStorage
2. Frontend code not properly sending request
3. Browser console showing the actual error

**Check `test_login.html` first to confirm backend!**

