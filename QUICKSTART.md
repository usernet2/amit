# 🚀 DÉMARRAGE RAPIDE (5 minutes)

## Étape 1️⃣: Créer la Base de Données (1 min)

Ouvrir MySQL Command Line ou Workbench:

```sql
CREATE DATABASE adherant_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Étape 2️⃣: Configuration Backend (2 min)

```powershell
cd backend
npm install
```

Créer `backend/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=adherant_platform
JWT_SECRET=adherant_secret_2025
PORT=5000
```

Démarrer:
```powershell
npm start
```
✅ Vous devriez voir: `✅ Server running on port 5000`

## Étape 3️⃣: Configuration Frontend (2 min)

Dans un **nouveau terminal**:

```powershell
cd frontend
npm install
npm start
```

✅ L'app s'ouvre automatiquement sur `http://localhost:3000`

## Étape 4️⃣: Ajouter Données de Test (Optionnel)

Dans le terminal du backend (arrêter npm start d'abord):

```powershell
node scripts\seed.js
```

**Identifiants de test:**
```
Email: alice@example.com
Mot de passe: password123
```

## 🎯 Test Rapide

1. Aller sur `http://localhost:3000`
2. Cliquer "Se connecter"
3. Entrer: alice@example.com / password123
4. Cliquer "Visites", "Formations", "Sensibilisations"
5. Tester l'annulation d'une activité

## ⚠️ Problèmes Courants

| Problème | Solution |
|----------|----------|
| Port 5000 occupé | `PORT=5001` dans .env |
| MySQL connection error | Vérifier password dans .env |
| npm ERR! | Supprimer node_modules et `npm install` |
| CORS error | Vérifier backend sur port 5000 |

## 📱 Accès

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MySQL**: localhost:3306

## 📚 Documentation Complète

- Pour détails: voir **INSTALLATION.md**
- Pour architecture: voir **ARCHITECTURE.md**
- Pour développement: voir **DEVELOPMENT.md**

---

**Prêt en 5 minutes! 🎉**
