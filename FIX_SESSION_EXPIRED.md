# Fix "Session Expired" Error

## 🔴 Problem

You're seeing "Session Expired" message when trying to login because there's an **old/expired authentication token** stored in your browser's localStorage.

### What's Happening:
1. You previously logged in (or attempted to)
2. An authentication token was saved in localStorage
3. That token has now expired
4. When you load the page, the app tries to verify the old token
5. Backend returns 401 Unauthorized
6. Frontend shows "Session Expired" message

---

## ✅ Solution: Clear Browser Storage

You need to clear the old token from your browser. Here are 3 methods:

---

### **METHOD 1: Clear localStorage via Console** ⭐ (FASTEST)

1. **Open Developer Tools**
   - Press `F12` on your keyboard
   - Or right-click anywhere → "Inspect"

2. **Go to Console Tab**
   - Click the "Console" tab at the top

3. **Run this command**
   - Type: `localStorage.clear()`
   - Press `Enter`

4. **Refresh the page**
   - Press `F5`
   - Or click the refresh button

5. **Try logging in again**
   - The "Session Expired" message should be gone!

---

### **METHOD 2: Clear from Application Tab**

1. **Open Developer Tools**
   - Press `F12`

2. **Go to Application Tab**
   - Click "Application" tab (might be hidden under >> if window is narrow)

3. **Find Local Storage**
   - In the left sidebar, expand "Local Storage"
   - Click on `http://localhost:5173`

4. **Clear the storage**
   - You'll see items like `authToken`, `user`, etc.
   - Right-click in the main area
   - Select "Clear"
   - Or select all items and press Delete

5. **Refresh the page**
   - Press `F5`

---

### **METHOD 3: Clear Browser Data** (NUCLEAR OPTION)

1. **Open Clear Browsing Data**
   - Press `Ctrl + Shift + Delete`
   - Or go to browser Settings → Privacy → Clear browsing data

2. **Select what to clear**
   - Check "Cookies and other site data"
   - Time range: "Last hour" is enough

3. **Clear data**
   - Click "Clear data" button

4. **Refresh the page**
   - Go back to `http://localhost:5173`
   - Press `F5`

---

## 🎯 After Clearing Storage

Once you've cleared the storage:

✅ The "Session Expired" message will be gone  
✅ You'll see a fresh login page  
✅ You can login with your credentials  

### Login Credentials:
```
Email:    admin@teamlease.com
Password: Password123!
```

Or click the **"Super Admin"** quick login button!

---

## 🔍 How to Verify It's Fixed

1. Open Developer Tools (`F12`)
2. Go to "Console" tab
3. Type: `localStorage.getItem('authToken')`
4. Press Enter
5. It should return `null` (meaning no old token)

---

## 🛡️ Preventing This in the Future

This happens when:
- Tokens expire (after 1 hour by default)
- Backend is restarted with database changes
- You close browser while logged in

**To avoid this:**
- Always logout properly before closing
- Or just clear localStorage when you see "Session Expired"

---

## 🆘 Still Not Working?

If you still see "Session Expired" after clearing storage:

1. **Check if backend is running**
   ```powershell
   # Test backend health
   Invoke-RestMethod -Uri "http://localhost:8000/health"
   ```

2. **Check browser console for errors**
   - Press F12
   - Look for red error messages
   - Share the error with support

3. **Try incognito/private mode**
   - Open browser in incognito mode
   - Go to `http://localhost:5173`
   - Try logging in
   - This ensures no cached data

---

## 📝 Quick Reference

| Issue | Solution |
|-------|----------|
| "Session Expired" on page load | Clear localStorage |
| Can't login after clearing | Check credentials |
| Still getting error | Restart backend server |
| Nothing works | Try incognito mode |

---

## ✅ Expected Behavior After Fix

1. **Page loads** → No "Session Expired" message
2. **See login form** → Clean, ready to use
3. **Enter credentials** → admin@teamlease.com / Password123!
4. **Click Sign In** → Redirects to dashboard
5. **Dashboard loads** → See analytics and data

---

**TL;DR**: Press `F12` → Console → Type `localStorage.clear()` → Enter → Refresh page (F5) → Login again! 🚀

