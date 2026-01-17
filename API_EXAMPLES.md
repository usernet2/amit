# 📡 Exemples de Requêtes API

## 🔐 Authentification

### 1. Inscription
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "adhérant@example.com",
  "password": "SecurePassword123!",
  "nom": "Ma Société",
  "siege": "Paris",
  "contact": "01 23 45 67 89"
}

# Réponse 201:
{
  "message": "User registered successfully",
  "userId": 1
}
```

### 2. Connexion
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "password123"
}

# Réponse 200:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "alice@example.com",
    "adherantId": 1
  }
}

# Copier le token pour les requêtes suivantes!
```

## 📅 Visites

### 3. Récupérer les visites
```bash
GET http://localhost:5000/api/visites
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

# Réponse 200:
{
  "visiteEntreprise": [
    {
      "id": 1,
      "date_heure": "2025-01-20T10:00:00.000Z",
      "is_valid": true
    },
    {
      "id": 2,
      "date_heure": "2025-02-15T14:30:00.000Z",
      "is_valid": true
    }
  ],
  "visiteSystematique": [
    {
      "id": 1,
      "date_deb": "2025-03-01",
      "date_fin": "2025-03-15",
      "is_valid": true
    }
  ]
}
```

### 4. Annuler une visite d'entreprise
```bash
POST http://localhost:5000/api/visites/cancel
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "id": 1,
  "type": "entreprise"
}

# Réponse 200:
{
  "message": "Visite cancelled successfully"
}
```

### 5. Annuler une visite systématique
```bash
POST http://localhost:5000/api/visites/cancel
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "id": 1,
  "type": "systematique"
}

# Réponse 200:
{
  "message": "Visite cancelled successfully"
}
```

## 🎓 Formations

### 6. Récupérer les formations
```bash
GET http://localhost:5000/api/formations
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

# Réponse 200:
{
  "participated": [
    {
      "id": 1,
      "designation": "Sécurité au Travail",
      "description": "Formation sur les normes de sécurité...",
      "date_deb": "2025-01-15",
      "date_fin": "2025-01-17",
      "is_valid": true,
      "participation_id": 1
    },
    {
      "id": 2,
      "designation": "Développement Durable",
      "description": "Pratiques durables...",
      "date_deb": "2025-02-01",
      "date_fin": "2025-02-03",
      "is_valid": true,
      "participation_id": 2
    }
  ],
  "available": [
    {
      "id": 1,
      "designation": "Sécurité au Travail",
      "description": "Formation sur les normes de sécurité..."
    },
    {
      "id": 2,
      "designation": "Développement Durable",
      "description": "Pratiques durables..."
    },
    {
      "id": 3,
      "designation": "Leadership et Management",
      "description": "Compétences de leadership pour managers"
    }
  ]
}
```

### 7. S'inscrire à une formation
```bash
POST http://localhost:5000/api/formations/enroll
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "formationId": 3,
  "date_deb": "2025-03-01",
  "date_fin": "2025-03-03"
}

# Réponse 201:
{
  "message": "Enrolled successfully"
}
```

### 8. Annuler une participation à une formation
```bash
POST http://localhost:5000/api/formations/cancel
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "participationId": 1
}

# Réponse 200:
{
  "message": "Participation cancelled successfully"
}
```

## 📢 Sensibilisations

### 9. Vérifier s'il y a des sensibilisations cette année
```bash
GET http://localhost:5000/api/sensibilisations/check
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

# Réponse 200:
{
  "hasSensibilisations": true,
  "count": 2
}
```

### 10. Récupérer les sensibilisations
```bash
GET http://localhost:5000/api/sensibilisations
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

# Réponse 200:
[
  {
    "id": 1,
    "sujet": "Protection des données personnelles",
    "date": "2025-02-10",
    "is_valid": true
  },
  {
    "id": 2,
    "sujet": "Santé mentale au travail",
    "date": "2025-04-05",
    "is_valid": true
  }
]
```

### 11. Annuler une sensibilisation
```bash
POST http://localhost:5000/api/sensibilisations/cancel
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "id": 1
}

# Réponse 200:
{
  "message": "Sensibilisation cancelled successfully"
}
```

## 🧪 Tests avec cURL (Windows PowerShell)

### Inscription
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
    nom = "Test Company"
    siege = "Paris"
    contact = "01234567"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$response.Content
```

### Connexion
```powershell
$body = @{
    email = "alice@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$token = ($response.Content | ConvertFrom-Json).token
Write-Host "Token: $token"
```

### Récupérer visites (avec token)
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/visites" `
    -Method GET `
    -Headers $headers

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

## 🧪 Tests avec Postman

### Collection d'import
```json
{
  "info": {
    "name": "Adhérant Platform API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/api/auth/register",
            "body": {
              "raw": "{\"email\": \"adhérant@example.com\", \"password\": \"password123\", \"nom\": \"Company\", \"siege\": \"Paris\"}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/api/auth/login",
            "body": {
              "raw": "{\"email\": \"alice@example.com\", \"password\": \"password123\"}"
            }
          }
        }
      ]
    }
  ]
}
```

### Variables Postman
```
base_url: http://localhost:5000
token: (obtenir après login)
adherantId: (obtenir après login)
```

## ❌ Réponses d'Erreur

### 400 - Bad Request
```json
{
  "message": "Missing required fields"
}
```

### 401 - Unauthorized (Authentification)
```json
{
  "message": "Invalid email or password"
}
```

### 403 - Forbidden (Token invalide)
```json
{
  "message": "Invalid token"
}
```

### 404 - Not Found
```json
{
  "message": "Visite not found"
}
```

### 409 - Conflict (Ressource existe)
```json
{
  "message": "User already exists"
}
```

### 500 - Server Error
```json
{
  "message": "Server error",
  "error": "Description de l'erreur"
}
```

## 📝 Notes Importantes

1. **Token JWT**:
   - Valable 7 jours
   - Inclure dans header `Authorization: Bearer <token>`
   - Obtenir lors du login

2. **Isolation des données**:
   - Chaque adhérant ne voit que ses données
   - Le token contient l'adherantId
   - Le backend vérifie la propriété

3. **Dates**:
   - Format ISO: `YYYY-MM-DD` ou `YYYY-MM-DDTHH:mm:ss`
   - Stockées UTC en base

4. **is_valid**:
   - `true`: Activité valide
   - `false`: Activité annulée (soft delete)

5. **Types de visites**:
   - `entreprise`: Visite spécifique à une date/heure
   - `systematique`: Période de dates (date_deb à date_fin)

---

**Exemples complets pour tester l'API! 🧪**
