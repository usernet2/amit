# Frontend-to-API Matching Report
**Generated:** January 17, 2026

---

## Frontend Pages & Services Alignment

### API Service Configuration
**Base URL:** `http://localhost:5000/api/v2`

**Example:** `/admin/participations` → `http://localhost:5000/api/v2/admin/participations`

---

## PAGE 1: AdminParticipations.js

### File Location
`c:\Users\User\Desktop\AMIT\frontend\src\pages\AdminParticipations.js`

### API Service Methods Used
```javascript
adminServiceV2.getParticipations()
adminServiceV2.getEntreprises()
adminServiceV2.getFormations()
adminServiceV2.createParticipation(formData)
adminServiceV2.updateParticipation(id, formData)
adminServiceV2.deleteParticipation(id)
```

### API Endpoints Called
| Method | Endpoint | Service Method | Status |
|--------|----------|-----------------|--------|
| GET | `/api/v2/admin/participations` | getParticipations | ✅ |
| GET | `/api/v2/admin/entreprises` | getEntreprises | ✅ |
| GET | `/api/v2/admin/formations` | getFormations | ✅ |
| POST | `/api/v2/admin/participations` | createParticipation | ✅ |
| PUT | `/api/v2/admin/participations/:id` | updateParticipation | ✅ |
| DELETE | `/api/v2/admin/participations/:id` | deleteParticipation | ✅ |

### Field Names Used in Frontend
```javascript
formData = {
  formation_id: '',
  adherant_id: '',  // NOTE: Frontend uses "adherant_id"
  date_deb: '',
  date_fin: '',
}
```

### Display Fields (Table)
```javascript
p.formation_designation   // From API
p.adherent_nom           // From API
p.date_deb
p.date_fin
p.status                 // 'complété' or 'annulé'
```

### ⚠️ POTENTIAL ISSUE
**Field Name Mismatch:**
- Backend API returns: `adherent_id`, `adherent_name`
- Frontend expects: `adherent_nom` (correct in display)
- Frontend sends in form: `adherant_id` (note the spelling: adherant vs adherent)

**Database Field:** `adherent_id` (with "e")
**Frontend Form Field:** `adherant_id` (with "a")

---

## PAGE 2: AdminFormations.js

### File Location
`c:\Users\User\Desktop\AMIT\frontend\src\pages\AdminFormations.js`

### API Service Methods Used
```javascript
adminFormations.getAll()
adminFormations.create(formData)
adminFormations.update(id, formData)
adminFormations.delete(id)
```

⚠️ **ISSUE:** Uses `adminFormations` service instead of `adminServiceV2`

### API Endpoints Called
| Method | Endpoint | Service | Status |
|--------|----------|---------|--------|
| GET | `/api/admin/formations` | adminFormations | ❌ WRONG |
| POST | `/api/admin/formations` | adminFormations | ❌ WRONG |
| PUT | `/api/admin/formations/:id` | adminFormations | ❌ WRONG |
| DELETE | `/api/admin/formations/:id` | adminFormations | ❌ WRONG |

**Expected Endpoints:**
- `http://localhost:5000/api/v2/admin/formations`

**Current Endpoints (from adminApi.js):**
- Likely `http://localhost:5000/api/admin/formations` (missing /v2)

---

## PAGE 3: AdminSensibilisations.js

### File Location
`c:\Users\User\Desktop\AMIT\frontend\src\pages\AdminSensibilisations.js`

### API Service Methods Used
```javascript
adminSensibilisations.getAll()
adminSensibilisations.create(formData)
adminSensibilisations.update(id, formData)
adminSensibilisations.delete(id)
adminEntreprises.getAll()
```

⚠️ **ISSUE:** Uses `adminSensibilisations` service instead of `adminServiceV2`

### Field Names
```javascript
formData = {
  sujet: '',
  date: '',
  adherent_id: '',  // Correct spelling here
}
```

### Display Fields
```javascript
sensibilisation.sujet
sensibilisation.date
sensibilisation.adherent_nom
sensibilisation.centre_nom
sensibilisation.is_valid
```

---

## PAGE 4: AdminVisites.js

### File Location
`c:\Users\User\Desktop\AMIT\frontend\src\pages\AdminVisites.js`

### API Service Methods Used
```javascript
adminVisites.getAll()
adminVisites.createEntreprise(data)
adminVisites.createSystematique(data)  // Note: typo in name
adminVisites.update(type, id, data)
adminVisites.delete(type, id)
adminEntreprises.getAll()
```

⚠️ **ISSUE:** Uses `adminVisites` service instead of `adminServiceV2`

### Field Names
```javascript
// For visite_entreprise
formData = {
  adherant_id: '',  // NOTE: spelling issue
  date_heure: '',
}

// For visite_systematique
formData = {
  adherant_id: '',  // NOTE: spelling issue
  date_deb: '',
  date_fin: '',
}
```

---

## SERVICE MISMATCH ISSUES

### Issue 1: Mixed Services
**Problem:** Some pages use `adminServiceV2` while others use `adminFormations`, `adminSensibilisations`, `adminVisites`

**Files Affected:**
- ✅ AdminParticipations.js → uses `adminServiceV2` (CORRECT)
- ❌ AdminFormations.js → uses `adminFormations` (INCONSISTENT)
- ❌ AdminSensibilisations.js → uses `adminSensibilisations` (INCONSISTENT)
- ❌ AdminVisites.js → uses `adminVisites` (INCONSISTENT)

### Issue 2: Field Name Spelling
**Problem:** Inconsistent spelling of "adherent" vs "adherant"

| File | Field Name | Correct? |
|------|-----------|----------|
| AdminParticipations.js | `adherant_id` | ❌ Should be `adherent_id` |
| AdminSensibilisations.js | `adherent_id` | ✅ Correct |
| AdminVisites.js | `adherant_id` | ❌ Should be `adherent_id` |
| Database | `adherent_id` | ✅ Source of truth |
| Backend API | `adherent_id` | ✅ Returns correct |

---

## RECOMMENDED FIXES

### Fix 1: Standardize All Pages to Use adminServiceV2

All pages should use:
```javascript
import { adminServiceV2 } from '../services/api';

// Then call:
adminServiceV2.getFormations()
adminServiceV2.getSensibilisations()
adminServiceV2.getVisites()
adminServiceV2.getParticipations()
```

### Fix 2: Correct Field Name Spelling

**In AdminParticipations.js:**
Change: `adherant_id` → `adherent_id`

**In AdminVisites.js:**
Change: `adherant_id` → `adherent_id`

### Fix 3: Check adminApi.js Service Definitions

Need to verify that `adminFormations`, `adminSensibilisations`, `adminVisites` services:
- Are still being imported
- Are using correct base URLs
- OR should be removed in favor of `adminServiceV2`

---

## ALIGNMENT CHECKLIST

### Frontend Pages
- [ ] AdminParticipations.js - Verify all field names match API
- [ ] AdminFormations.js - Switch to adminServiceV2
- [ ] AdminSensibilisations.js - Switch to adminServiceV2
- [ ] AdminVisites.js - Switch to adminServiceV2
- [ ] AdminEntreprises.js - Verify consistency
- [ ] AdminDashboard.js - Verify consistency
- [ ] AdminCancelled.js - Verify consistency

### Service Layer
- [ ] api.js - All adminServiceV2 methods defined correctly
- [ ] adminApi.js - Check if still needed or can be deprecated
- [ ] Verify all base URLs are `/api/v2`

### Field Names
- [ ] Replace all `adherant_id` with `adherent_id`
- [ ] Verify all response fields match display logic
- [ ] Check status field conversions

---

## TEST COMMANDS

### Test With curl
```bash
# Get all participations
curl -X GET http://localhost:5000/api/v2/admin/participations \
  -H "Authorization: Bearer <token>"

# Get all formations
curl -X GET http://localhost:5000/api/v2/admin/formations \
  -H "Authorization: Bearer <token>"

# Create participation
curl -X POST http://localhost:5000/api/v2/admin/participations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "formation_id": 1,
    "adherent_id": 1,
    "date_deb": "2024-01-15",
    "date_fin": "2024-03-15"
  }'
```

---

**Status:** Ready for fixes
**Priority:** HIGH - Inconsistent service imports and field naming could cause API errors
