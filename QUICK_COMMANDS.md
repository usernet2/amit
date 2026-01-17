# ⚡ COMMANDES RAPIDES

## 🚀 Démarrage (Copier-Coller)

### 1. Création Base de Données
```powershell
mysql -u root -p
CREATE DATABASE adherant_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2. Backend - Terminal 1
```powershell
cd c:\Users\User\Desktop\AMIT\backend
npm install
copy .env.example .env
# ✏️ Éditer .env - ajouter votre password MySQL
npm start
```

✅ Voir: `✅ Server running on port 5000`

### 3. Frontend - Terminal 2
```powershell
cd c:\Users\User\Desktop\AMIT\frontend
npm install
npm start
```

✅ App ouvre: `http://localhost:3000`

### 4. Données de Test (Backend terminal)
```powershell
node scripts\seed.js
```

✅ Identifiants: `alice@example.com` / `password123`

---

## 📁 Navigation Rapide

### Fichiers Importants
```
00_START_HERE.md        ← COMMENCEZ PAR ICI
WELCOME.md              ← Vue d'ensemble
QUICKSTART.md           ← 5 minutes
INSTALLATION.md         ← Installation détaillée
ARCHITECTURE.md         ← Comment ça marche
DEVELOPMENT.md          ← Développement
API_EXAMPLES.md         ← Tester les APIs
```

### Dossiers
```
backend/                ← Node.js/Express
frontend/               ← React
```

---

## 🔧 Commandes Courantes

### Backend
```powershell
# Installer
npm install

# Lancer
npm start

# Lancer avec nodemon (auto-reload)
npm run dev

# Charger données de test
node scripts\seed.js

# Tuer le port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Frontend
```powershell
# Installer
npm install

# Lancer (ouvre auto)
npm start

# Build production
npm run build

# Tests
npm test

# Tuer le port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### MySQL
```powershell
# Se connecter
mysql -u root -p

# Créer base de données
CREATE DATABASE adherant_platform;

# Voir les tables
USE adherant_platform;
SHOW TABLES;

# Voir un enregistrement
SELECT * FROM users;
```

---

## 🔑 Identifiants de Test

```
Email: alice@example.com
Mot de passe: password123

Email: bob@example.com
Mot de passe: password123
```

---

## 🌐 URLs de Développement

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend | http://localhost:5000 | 5000 |
| MySQL | localhost | 3306 |

---

## 🧪 Tests API Rapides

### Avec PowerShell

#### Login
```powershell
$body = @{
    email = "alice@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
    -Method POST -ContentType "application/json" -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

#### Récupérer Visites
```powershell
$token = "YOUR_TOKEN_HERE"

$headers = @{ "Authorization" = "Bearer $token" }

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/visites" `
    -Method GET -Headers $headers

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

---

## 🐛 Troubleshooting Rapide

### Port occupé
```powershell
# Trouver le PID
netstat -ano | findstr :5000

# Tuer le processus
taskkill /PID <PID> /F
```

### Module manquant
```powershell
cd backend
npm install --force
```

### MySQL non connecté
```powershell
# Vérifier que MySQL est lancé
# Vérifier le password dans .env
# Essayer: mysql -u root -p
```

### CORS error
```
Vérifier que backend est sur port 5000
Vérifier que frontend est sur port 3000
Redémarrer les deux
```

---

## 📝 Fichiers à Éditer

### .env (Backend)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD  ← CHANGER ICI
DB_NAME=adherant_platform
JWT_SECRET=adherant_2025
PORT=5000
```

### Styles (Si modification)
```
frontend/src/styles/App.css
```

### Variables Frontend (Si API URL différente)
```
frontend/src/services/api.js
const API_URL = 'http://localhost:5000/api';
```

---

## 🎯 Checklist Démarrage

- [ ] MySQL lancé
- [ ] Base de données créée
- [ ] Backend installé et configuré
- [ ] Backend lancé (port 5000)
- [ ] Frontend installé
- [ ] Frontend lancé (port 3000)
- [ ] Données de test chargées
- [ ] Login fonctionnel
- [ ] Dashboard visible

---

## 📞 Besoin d'Aide?

| Problème | Solution |
|----------|----------|
| App ne se lance pas | Voir QUICKSTART.md |
| Erreur MySQL | Voir DEVELOPMENT.md |
| API ne répond pas | Vérifier port 5000 |
| Login ne fonctionne pas | Vérifier .env JWT |
| Styles cassés | Vérifier App.css |

---

## 🚀 Commande Magique (Tout d'un coup)

### Première fois (Setup)
```powershell
# Terminal 1
cd c:\Users\User\Desktop\AMIT\backend
npm install
copy .env.example .env
# Éditer .env...
npm start

# Terminal 2
cd c:\Users\User\Desktop\AMIT\frontend
npm install
npm start

# Terminal 3
cd c:\Users\User\Desktop\AMIT\backend
node scripts\seed.js
```

### Chaque fois après (Quick Start)
```powershell
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && npm start
```

---

## 📊 Ports à Retenir

```
3000  = Frontend (React)
5000  = Backend (Express)
3306  = MySQL
```

---

## 🎉 C'est Tout!

Prêt? Commencez par:

1. **00_START_HERE.md** (1 min)
2. **QUICKSTART.md** (5 min)
3. Lancer l'app (1 min)
4. **WELCOME.md** (2 min)

**Total: 10 minutes pour démarrer! ⚡**

---

*Version Rapide - Pour commandes basiques*
*Voir documentation complète pour plus*
