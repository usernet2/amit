# 🎯 QUICK START - Testing Users

## ⚡ Instant Access

All user accounts have been created and are ready for testing!

### Login Credentials

Copy and paste to test each role:

#### 👨‍💼 Admin Account
```
Email:    admin@amit.com
Password: Admin@123
URL:      http://localhost:3000/login
```

#### 🩺 Médecin Chef Account
```
Email:    medecin-nord@amit.com
Password: Medecin@123
URL:      http://localhost:3000/login
```

#### 🏭 Adhérant (Enterprise) Account
```
Email:    acme@example.com
Password: Adherant@123
URL:      http://localhost:3000/login
```

---

## 🚀 How to Test

1. **Start Frontend**
   ```bash
   cd frontend
   npm start
   ```
   Opens at `http://localhost:3000`

2. **Go to Login Page**
   ```
   http://localhost:3000/login
   ```

3. **Copy a credential** from above

4. **Paste into login form**

5. **Click "Se Connecter"**

6. **You'll be redirected to your dashboard!**

---

## 📊 What Each User Can Do

### Admin 👨‍💼
Dashboard: `/admin/v2`

- ✅ View all statistics
- ✅ Manage enterprises
- ✅ Manage formations
- ✅ Manage visits
- ✅ Manage sensibilisations
- ✅ View cancelled activities
- ✅ Full system access

### Médecin Chef 🩺
Dashboard: `/medecin-chef/v2`

- ✅ View center statistics
- ✅ Manage center formations
- ✅ View adherants in center
- ✅ Oversee center activities
- ✅ Generate center reports

### Adhérant 🏭
Dashboard: `/adherant/v2`

- ✅ View company profile
- ✅ Register for formations
- ✅ Schedule visits
- ✅ View sensibilisations
- ✅ Track participations
- ✅ Manage company data

---

## 🔄 Reset Users

If you accidentally modify user data and want to reset:

```bash
cd backend
npm run seed
```

This will:
- ✅ Check for existing users
- ✅ Skip if already created (no duplicates)
- ✅ Restore demo credentials if needed

---

## 📝 Notes

- ⏱️ Login session lasts 24 hours
- 🔒 Passwords are securely hashed
- 🌐 Works on all pages with unified styling
- 📱 Responsive on mobile devices
- 🎨 Professional UI matching login page design

---

## ❓ Forgot Password?

Since this is demo/development:

1. Use password from this guide
2. If lost, run: `npm run seed` (resets demo accounts)
3. Or create new account via registration

---

**Happy Testing! 🎉**
