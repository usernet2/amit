# 🔐 Multi-Role Platform - Security Architecture

## Overview
This platform implements a **strict role-based security model** with three user types:

- **👨‍💼 Admin** - Full platform control (pre-created only)
- **🩺 Manager (Médecin Chef)** - Centre-specific read-only access (pre-created only)
- **🏭 Company (Adhérant)** - Self-service registration, personal planning

## 🛡️ Security Rules

### Registration Policy
```
✅ ALLOWED:    Company accounts (adherant) - Public self-service
❌ BLOCKED:    Admin accounts - Pre-created only
❌ BLOCKED:    Manager accounts - Pre-created only
```

### Backend Enforcement
- **Backend hardcodes role to 'adherant'** in registration endpoint
- **No role parameter** accepted in registration request
- **Middleware validates** every request
- **Database constraints** prevent unauthorized data access

### Frontend Protection
- Registration form **does NOT show role selection**
- Login automatically **redirects by role** to correct dashboard
- Protected routes **verify role before rendering**
- Unauthorized access attempts **redirect to login**

## 🚀 Getting Started

### 1. Initialize Database & Create Admin Accounts
```bash
cd backend
npm install
npm start
```

Wait for database initialization, then in another terminal:
```bash
node scripts/createAdminAccounts.js
```

### 2. Test Accounts

#### 👨‍💼 Admin
- Email: `admin@amit.com`
- Password: `Admin@123`
- Access: Full dashboard at `/admin/v2`

#### 🩺 Manager (Centre Nord)
- Email: `medecin-nord@amit.com`
- Password: `Medecin@123`
- Access: Manager dashboard at `/medecin-chef/v2`

#### 🏭 Create Company Account (Self-Service)
1. Go to http://localhost:3000/register/v2
2. Fill form:
   - Company Name: Your company
   - Phone: Your contact
   - Centre: Select assigned centre
   - Email & Password
3. Submit → Account created as **adherant**
4. Login at `/login/v2` → Auto-redirect to company dashboard

## 📊 API Endpoints

### Public
- `POST /api/v2/auth/register-adherant` - Company self-registration (role hardcoded to 'adherant')
- `POST /api/v2/auth/login` - Login all roles

### Protected by Role

#### Admin Only
- `GET /api/v2/admin/dashboard` - Global stats
- `GET /api/v2/admin/cancelled-activities` - All cancelled activities
- `POST /api/v2/admin/replan-activity` - Reschedule activities

#### Manager Only (Centre-specific)
- `GET /api/v2/medecin-chef/dashboard` - Centre stats
- `GET /api/v2/medecin-chef/visites?month=x&year=y` - Monthly visits
- `GET /api/v2/medecin-chef/formations?month=x&year=y` - Monthly trainings
- `GET /api/v2/medecin-chef/sensibilisations?month=x&year=y` - Monthly awareness

#### Company Only
- `GET /api/v2/adherant/dashboard` - Personal stats
- `GET /api/v2/adherant/visites` - My visits
- `GET /api/v2/adherant/formations` - My trainings
- `PUT /api/v2/adherant/cancel-visite/:id` - Cancel visit
- `PUT /api/v2/adherant/cancel-formation/:id` - Cancel training
- `PUT /api/v2/adherant/cancel-sensibilisation/:id` - Cancel awareness

## 🔒 Security Layers

### 1. Backend Validation
```javascript
// authControllerV2.js - Registration always creates 'adherant'
const [userResult] = await connection.execute(
  'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
  [email, hashedPassword, 'adherant'] // Role HARDCODED
);
```

### 2. Route Protection
```javascript
// apiV2.js - Every route has role verification
router.post('/admin/replan', verifyToken, verifyAdmin, handler);
router.get('/medecin/visites', verifyToken, verifyMedecinChef, handler);
router.get('/adherant/dashboard', verifyToken, verifyAdherant, handler);
```

### 3. Frontend Validation
```javascript
// ProtectedRouteV2 - Role verification before render
if (user.role !== requiredRole) {
  return <Navigate to="/login/v2" />;
}
```

## 📁 File Structure

### Backend
```
backend/
  routes/
    apiV2.js                         # All routes with role protection
  controllers/
    authControllerV2.js              # Auth (registration enforces adherant only)
    adminDashboardController.js      # Admin endpoints
    medecinChefDashboardController.js # Manager endpoints
    adherantDashboardController.js   # Company endpoints
  middleware/
    auth.js                          # Middleware: verifyToken, verifyRole
  scripts/
    createAdminAccounts.js           # Create admin/manager accounts
    seedRoles.js                     # Full database seeding
```

### Frontend
```
frontend/src/
  pages/
    LoginV2.js              # Login with auto-redirect by role
    RegisterV2.js           # Company registration (no role choice)
    AdminDashboardV2.js     # Admin dashboard
    MedecinChefDashboardV2.js # Manager dashboard
    AdherantDashboardV2.js  # Company dashboard
  services/
    apiV2.js                # API calls with JWT
  AppV2.js                  # Routes with role protection
```

## 🔄 Authentication Flow

```
1. User visits /login/v2
   ↓
2. Enters credentials
   ↓
3. Backend validates credentials
   ↓
4. Backend generates JWT with role
   ↓
5. Frontend receives token + role
   ↓
6. Auto-redirect based on role:
   - admin       → /admin/v2
   - medecin_chef → /medecin-chef/v2
   - adherant    → /adherant/v2
   ↓
7. Protected route verifies role
   ↓
8. Dashboard renders
```

## ⚠️ Key Security Features

✅ **Role Hardcoded in Backend**
- Cannot be modified via API
- Cannot be changed by user input

✅ **JWT Contains Role**
- Verified on every protected request
- Cannot be spoofed

✅ **Frontend Route Protection**
- ProtectedRouteV2 component
- Redirects unauthorized access

✅ **No Self-Promotion**
- Company accounts cannot become admin
- No privilege escalation possible

✅ **Data Isolation**
- Companies see only their data
- Managers see only their centre data
- Admin sees all data

## 🧪 Testing Security

### Try Unauthorized Access
```javascript
// Manually change user role in localStorage
localStorage.setItem('user', JSON.stringify({ role: 'admin' }));
// Navigate to /medecin-chef/v2
// Result: Redirects back to login ✅
```

### Try Wrong Endpoint
```javascript
// As company, try to access admin endpoint
GET /api/v2/admin/dashboard
// Result: 403 Forbidden ✅
```

### Try Registration Hack
```javascript
// Attempt to register as admin
POST /api/v2/auth/register-adherant
{ email: "...", role: "admin", ... }
// Result: Role ignored, always created as 'adherant' ✅
```

## 📝 Notes

- Admin and Manager accounts MUST be created manually
- Company accounts are created via self-service registration
- All passwords should be changed after first login in production
- JWT expires after 7 days
- All API calls require valid JWT token

## Support

For security issues, contact: admin@amit.com
