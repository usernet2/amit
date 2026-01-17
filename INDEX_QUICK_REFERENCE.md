# 📚 AMIT Platform - Quick Reference Index

## 🎯 Getting Started

### First Time Setup
1. Read: [`ADMIN_START_HERE.md`](./ADMIN_START_HERE.md)
2. Read: [`QUICK_TEST_USERS.md`](./QUICK_TEST_USERS.md)
3. Run: `npm run seed` (in backend)
4. Start: Frontend and Backend
5. Test: Login with demo credentials

---

## 👥 User Management

### Demo Accounts
- **Admin**: `admin@amit.com` / `Admin@123`
- **Médecin Chef**: `medecin-nord@amit.com` / `Medecin@123`
- **Adhérant**: `acme@example.com` / `Adherant@123`

### Documentation
- [`USER_MANAGEMENT.md`](./USER_MANAGEMENT.md) - Comprehensive user guide
- [`QUICK_TEST_USERS.md`](./QUICK_TEST_USERS.md) - Quick reference
- [`backend/SEED_USERS_GUIDE.md`](./backend/SEED_USERS_GUIDE.md) - Seeding details
- [`USERS_CREATED_SUCCESS.md`](./USERS_CREATED_SUCCESS.md) - Creation summary

### Creating Users
```bash
cd backend
npm run seed          # Create all demo users
node scripts/seedUsers.js    # Manual seeding
node scripts/listUsers.js    # List all users
```

---

## 🎨 Design & Styling

### Unified Design System
- **File**: [`frontend/src/styles/UnifiedStyle.css`](./frontend/src/styles/UnifiedStyle.css)
- **Base**: Login page design applied across entire platform
- **Features**: Professional gradients, buttons, forms, modals
- **Status**: ✅ Applied to all pages

### Design Guide
- Gradient primary: `#667eea` → `#764ba2`
- Responsive design for all devices
- Consistent spacing and typography

---

## 🚀 Quick Commands

### Backend
```bash
cd backend
npm install              # Install dependencies
npm start               # Start server
npm run dev             # Start with nodemon
npm run seed            # Seed demo users
npm run seed:prod       # Seed for production
```

### Frontend
```bash
cd frontend
npm install              # Install dependencies
npm start               # Start dev server
npm run build           # Build for production
```

---

## 📊 Project Structure

```
AMIT/
├── backend/
│   ├── scripts/
│   │   ├── seedUsers.js       # Demo user seeding
│   │   └── listUsers.js       # List users utility
│   ├── controllers/           # API business logic
│   ├── routes/               # API routes
│   ├── config/               # Database config
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── services/         # API services
│   │   └── styles/
│   │       ├── UnifiedStyle.css      # Global design system
│   │       └── [Page].css            # Page-specific styles
│   └── package.json
│
└── Documentation/
    ├── USERS_CREATED_SUCCESS.md
    ├── USER_MANAGEMENT.md
    ├── QUICK_TEST_USERS.md
    ├── ADMIN_START_HERE.md
    └── ...
```

---

## 🔑 Key Features

✅ **User Management**
- Multi-role system (Admin, Médecin Chef, Adhérant)
- Secure password hashing with bcryptjs
- JWT authentication

✅ **Design System**
- Unified styling across all pages
- Professional gradient UI
- Responsive on all devices
- Consistent components

✅ **Database**
- MySQL with proper relationships
- Automatic timestamps
- Foreign key constraints

✅ **API**
- RESTful endpoints
- Role-based access control
- Error handling

---

## 🧪 Testing

### Test Each User Role
```bash
# Admin Features
- View dashboard
- Manage enterprises
- Manage formations
- View all statistics

# Médecin Chef Features
- View center data
- Manage formations
- Oversee enterprises

# Adhérant Features
- View company profile
- Register for formations
- Manage visites
```

### Login Flow
1. Navigate to `http://localhost:3000/login`
2. Use credentials from user management guide
3. Click "Se Connecter"
4. Redirected to dashboard

---

## 📖 Documentation Map

### Administrator Docs
- `ADMIN_START_HERE.md` - Setup guide
- `ADMIN_README.md` - Admin overview
- `ADMIN_INSTALLATION.md` - Installation steps

### User Docs
- `USER_MANAGEMENT.md` - User management guide
- `QUICK_TEST_USERS.md` - Quick credentials
- `backend/SEED_USERS_GUIDE.md` - Seeding guide

### Development Docs
- `DEVELOPMENT.md` - Development guide
- `API_EXAMPLES.md` - API usage
- `ARCHITECTURE.md` - System architecture

### Deployment Docs
- `DEPLOYMENT_CHECKLIST.md` - Deployment steps
- `INSTALLATION.md` - Installation guide

---

## 🔒 Security Notes

⚠️ **Development Only**
- Demo credentials are for testing
- Passwords visible in documentation
- Not suitable for production

✅ **Before Production**
- Change all passwords
- Implement proper authentication
- Add password reset functionality
- Enable HTTPS
- Setup proper database backups
- Implement rate limiting

---

## 🎯 Common Tasks

### Create New User
```bash
cd backend
npm run seed          # Re-seed all users
# OR edit seedUsers.js and add new user
```

### Test New Feature
1. Login with appropriate user
2. Navigate to feature page
3. Test functionality
4. Check console for errors

### Deploy to Production
1. Read `DEPLOYMENT_CHECKLIST.md`
2. Update environment variables
3. Run database migrations
4. Build frontend: `npm run build`
5. Start backend server

---

## 💬 Support & Help

### Common Issues

**Can't login?**
- Check email spelling
- Verify password (case-sensitive)
- Run: `npm run seed` to reset

**Styling looks wrong?**
- Clear browser cache
- Ensure UnifiedStyle.css is imported
- Check developer console for errors

**Database errors?**
- Verify MySQL is running
- Check `.env` configuration
- Ensure all tables are created

---

## 📞 Quick Links

- **Backend**: `http://localhost:3000`
- **Frontend**: `http://localhost:3000`
- **Login**: `http://localhost:3000/login`
- **Admin Dashboard**: `http://localhost:3000/admin/v2`
- **Médecin Dashboard**: `http://localhost:3000/medecin-chef/v2`
- **Adhérant Dashboard**: `http://localhost:3000/adherant/v2`

---

## 🔄 Last Updated

**Date**: December 16, 2025  
**Changes**: User creation & unified styling  
**Status**: ✅ Ready for Testing

---

## 📋 Checklist for New Developers

- [ ] Read ADMIN_START_HERE.md
- [ ] Read QUICK_TEST_USERS.md
- [ ] Run `npm run seed` in backend
- [ ] Start backend and frontend
- [ ] Test login with each user
- [ ] Explore each dashboard
- [ ] Read USER_MANAGEMENT.md
- [ ] Check API_EXAMPLES.md
- [ ] Review ARCHITECTURE.md

---

**Happy Coding! 🚀**
