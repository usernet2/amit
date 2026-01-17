# 🌱 User Seeding Guide

## Overview

This guide explains how to seed demo users for each role in the AMIT platform.

## Demo Users

The seeding script creates three demo users, one for each role:

### 1. **Admin** 👨‍💼
- **Email**: `admin@amit.com`
- **Password**: `Admin@123`
- **Role**: Administrator
- **Access**: Full system access - manage all features

### 2. **Médecin Chef** 🩺
- **Email**: `medecin-nord@amit.com`
- **Password**: `Medecin@123`
- **Role**: Médecin Chef (Chief Physician)
- **Access**: Center supervision and oversight

### 3. **Adhérant (Enterprise)** 🏭
- **Email**: `acme@example.com`
- **Password**: `Adherant@123`
- **Role**: Adhérant (Enterprise)
- **Enterprise**: ACME Corporation
- **Access**: Enterprise management

## How to Run

### Prerequisites
- Backend server running and database configured
- Node.js installed
- All dependencies installed (`npm install`)

### Method 1: Using npm script (Recommended)

```bash
# Navigate to backend directory
cd backend

# Run the seeding script
npm run seed
```

### Method 2: Direct Node execution

```bash
node scripts/seedUsers.js
```

### Method 3: Production environment

```bash
npm run seed:prod
```

## What the Script Does

1. **Creates Admin User**
   - Email: `admin@amit.com`
   - Role: `admin`
   - No center assignment

2. **Creates Centre**
   - Name: `Centre Nord Santé`
   - Location: `123 Rue Principale, Rabat`
   - Used for Médecin Chef and Adhérant

3. **Creates Médecin Chef User**
   - Email: `medecin-nord@amit.com`
   - Role: `medecin_chef`
   - Assigned to Centre Nord Santé

4. **Creates Adhérant User with Enterprise**
   - Email: `acme@example.com`
   - Role: `adherant`
   - Creates associated enterprise: `ACME Corporation`
   - Assigned to Centre Nord Santé

## Important Notes

⚠️ **Duplicate Prevention**
- The script checks for existing users before inserting
- If a user already exists, it will skip creation and show a warning
- If a centre already exists, it will reuse the existing one

✅ **Password Security**
- All passwords are hashed using bcryptjs before storage
- Passwords are never displayed in the database
- Use the credentials above only for testing

🔄 **Idempotent**
- Safe to run multiple times (won't create duplicates)
- Useful for resetting demo credentials

## Testing After Seeding

1. **Start the frontend**:
   ```bash
   cd frontend
   npm start
   ```

2. **Navigate to Login Page**: `http://localhost:3000/login`

3. **Test each account**:
   - Admin account → Full dashboard access
   - Médecin Chef → Center management features
   - Adhérant → Enterprise features

## Troubleshooting

### Error: "Error: connect ECONNREFUSED"
- Ensure database server is running
- Check `backend/.env` database configuration

### Error: "ER_DUP_ENTRY"
- User already exists in database
- Either delete existing users or update the email in the script

### Password Hash Issues
- Ensure `bcryptjs` is installed: `npm install bcryptjs`

## Adding More Users

To add additional users, edit `backend/scripts/seedUsers.js` and add more user creation blocks following the same pattern.

Example:
```javascript
// Create another Médecin Chef
const [medecin2] = await connection.execute(
  'INSERT INTO users (email, password, role, centre_id) VALUES (?, ?, ?, ?)',
  ['medecin-sud@amit.com', medecinPassword, 'medecin_chef', centreId]
);
```

## Manual User Creation via API

Alternatively, you can create users through the API endpoints:

### Register Adhérant
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "new@example.com",
  "password": "SecurePass@123",
  "raison_sociale": "New Company",
  "contact": "+212600000000",
  "centre_id": 1
}
```

### Admin/Médecin Chef Creation
These roles require direct database insertion or admin API (if implemented).

## Security Reminder

⚠️ **For Development Only**
- These are demo credentials for testing purposes
- Never use these credentials in production
- Change all passwords before deploying to production
- Implement proper user management for real users

---

For more information, see [ADMIN_START_HERE.md](../ADMIN_START_HERE.md)
