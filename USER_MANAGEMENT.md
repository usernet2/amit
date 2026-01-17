# 👥 User Management & Demo Accounts

## Quick Access to Demo Accounts

### 🎯 Demo Credentials for Testing

All demo accounts have been created and are ready to use:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** 👨‍💼 | `admin@amit.com` | `Admin@123` | Full system access |
| **Médecin Chef** 🩺 | `medecin-nord@amit.com` | `Medecin@123` | Center supervision |
| **Adhérant** 🏭 | `acme@example.com` | `Adherant@123` | Enterprise management |

---

## How to Create Users

### Method 1: Automatic Seeding (Recommended) ⭐

Run the seeding script to create all demo users at once:

```bash
# Navigate to backend directory
cd backend

# Run the seeding script
npm run seed
```

**Benefits:**
- ✅ Creates all 3 role-specific users automatically
- ✅ Idempotent (safe to run multiple times)
- ✅ Creates associated data (centre, enterprise)
- ✅ Passwords are securely hashed

### Method 2: Manual Registration via API

For **Adhérants** (Enterprises), use the registration endpoint:

**Endpoint:** `POST /api/auth/register`

```json
{
  "email": "company@example.com",
  "password": "SecurePass@123",
  "raison_sociale": "Company Name",
  "contact": "+212612345678",
  "centre_id": 1
}
```

### Method 3: Direct Database Insertion

For Admin or Médecin Chef roles, insert directly into database:

```sql
-- Create Admin User
INSERT INTO users (email, password, role) 
VALUES ('admin@example.com', BCRYPT_HASH('Password@123'), 'admin');

-- Create Médecin Chef User
INSERT INTO users (email, password, role, centre_id) 
VALUES ('medecin@example.com', BCRYPT_HASH('Password@123'), 'medecin_chef', 1);
```

---

## User Roles & Permissions

### 👨‍💼 Admin
- Full system access
- Can manage all entities
- Can create/edit/delete other users (when implemented)
- Access all reports

**Dashboard**: `/admin/v2`

### 🩺 Médecin Chef (Chief Physician)
- Center supervision
- View center activities
- Manage formations and sensibilisations
- Oversee adherants in their center
- View reports for their center

**Dashboard**: `/medecin-chef/v2`

### 🏭 Adhérant (Enterprise)
- Manage enterprise profile
- View formations available
- Register for formations
- Manage visites (center and systematic)
- View sensibilisations
- Track participations

**Dashboard**: `/adherant/v2`

---

## User Data Structure

### Users Table
```
id              INT (Primary Key)
email           VARCHAR (Unique)
password        VARCHAR (Hashed with bcryptjs)
role            VARCHAR ('admin', 'medecin_chef', 'adherant')
centre_id       INT (Foreign Key, NULL for admin)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Roles
- **admin**: Full platform access
- **medecin_chef**: Center-specific access
- **adherant**: Enterprise access

---

## Password Management

### Password Requirements
- ✅ Minimum 8 characters
- ✅ Hashed with bcryptjs (10 rounds)
- ✅ Never stored in plain text

### Changing Passwords

**Via API** (when implemented):
```bash
POST /api/auth/change-password
Content-Type: application/json

{
  "email": "user@example.com",
  "oldPassword": "CurrentPass@123",
  "newPassword": "NewPass@123"
}
```

**Direct Database Update**:
```javascript
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash('NewPassword@123', 10);
// UPDATE users SET password = ? WHERE email = ?
```

---

## Testing User Accounts

### Login Flow
1. Navigate to `http://localhost:3000/login`
2. Use credentials from the table above
3. You'll be redirected to your role-specific dashboard

### What to Test

**Admin Account**:
- [ ] Admin dashboard loads
- [ ] Can view all statistics
- [ ] Can access all admin features
- [ ] Can manage all entities

**Médecin Chef Account**:
- [ ] Médecin Chef dashboard loads
- [ ] Can see center-specific data
- [ ] Can manage formations
- [ ] Can view adherants

**Adhérant Account**:
- [ ] Adhérant dashboard loads
- [ ] Can view enterprise info
- [ ] Can see available formations
- [ ] Can manage activities

---

## Troubleshooting

### User Cannot Login
- ❌ Check email spelling
- ❌ Verify password is correct (case-sensitive)
- ❌ Confirm user exists in database
- ✅ Try seeding again: `npm run seed`

### Duplicate User Error
- Users already exist? That's normal!
- The script prevents duplicates automatically
- Each email is unique in the system

### Password Reset Issues
- Ensure bcryptjs is installed: `npm install bcryptjs`
- Check password meets requirements (8+ chars)
- Verify database connection

### Role-Based Access Denied
- Confirm user has correct role
- Check centre_id assignment for médecin_chef
- Verify token is still valid (hasn't expired)

---

## Security Best Practices

⚠️ **For Development Only**

- ❌ Never use these credentials in production
- ❌ Change all passwords before deployment
- ✅ Implement proper user management UI
- ✅ Use environment variables for credentials
- ✅ Implement password reset functionality
- ✅ Add role-based access control (RBAC)
- ✅ Log all user creation/deletion events

---

## Adding Custom Users

### Via Script

Edit `backend/scripts/seedUsers.js` to add more users:

```javascript
// Create additional user
try {
  const [result] = await connection.execute(
    'INSERT INTO users (email, password, role, centre_id) VALUES (?, ?, ?, ?)',
    ['newuser@example.com', hashedPassword, 'medecin_chef', centreId]
  );
  console.log('✅ User created:', result.insertId);
} catch (error) {
  console.error('Error creating user:', error);
}
```

Then run: `npm run seed`

### Via Frontend (When Implemented)

Implement admin user management UI to:
- View all users
- Create new users
- Edit user details
- Reset passwords
- Delete users

---

## Related Documentation

- [SEED_USERS_GUIDE.md](./SEED_USERS_GUIDE.md) - Detailed seeding instructions
- [ADMIN_START_HERE.md](../ADMIN_START_HERE.md) - Admin setup guide
- [LOGIN_PAGE.md](../FRONTEND_SETUP.md) - Frontend login information

---

**Last Updated**: December 16, 2025  
**Status**: ✅ Active & Tested
