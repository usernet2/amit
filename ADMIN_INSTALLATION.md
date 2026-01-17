# Installation et Déploiement du Module Admin

## ✅ Étape 1 : Vérifier les Prérequis

### Vérifier Node.js et npm
```powershell
node --version  # v14+
npm --version   # v6+
```

### Vérifier MySQL
```powershell
mysql --version  # MySQL 5.7+
```

### Vérifier la base de données
```sql
USE plateforme_adherants;
SHOW TABLES;
DESC users;  -- Vérifier que la colonne 'role' existe
```

## 📦 Étape 2 : Vérifier les Fichiers Créés

### Backend - Controllers (5 fichiers)
```
backend/controllers/
├── adminFormationsController.js ✓
├── adminVisitesController.js ✓
├── adminSensibilisationsController.js ✓
├── adminParticiparionsController.js ✓
└── adminCancelledController.js ✓
```

### Backend - Routes (1 fichier)
```
backend/routes/
└── admin.js ✓
```

### Frontend - Pages (6 fichiers)
```
frontend/src/pages/
├── AdminDashboard.js ✓
├── AdminFormations.js ✓
├── AdminVisites.js ✓
├── AdminSensibilisations.js ✓
├── AdminParticipations.js ✓
└── AdminCancelled.js ✓
```

### Frontend - Styles (7 fichiers)
```
frontend/src/styles/
├── AdminCommon.css ✓
├── AdminDashboard.css ✓
├── AdminFormations.css ✓
├── AdminVisites.css ✓
├── AdminSensibilisations.css ✓
├── AdminParticipations.css ✓
└── AdminCancelled.css ✓
```

### Frontend - Services (1 fichier)
```
frontend/src/services/
└── adminApi.js ✓
```

### Documentation (3 fichiers)
```
ADMIN_MODULE.md ✓
ADMIN_USAGE_GUIDE.md ✓
ADMIN_API_TEST.sh ✓
```

## 🔧 Étape 3 : Configuration Backend

### 3.1 Vérifier `backend/server.js`

Assurez-vous que cette ligne existe :
```javascript
app.use('/api/admin', require('./routes/admin'));
```

Location: Après les autres routes, avant le health check.

### 3.2 Vérifier `backend/middleware/auth.js`

Vérifiez que les deux fonctions existent :
```javascript
exports.verifyToken = (req, res, next) => { ... }
exports.verifyAdmin = (req, res, next) => { ... }
```

## 🖥️ Étape 4 : Configuration Frontend

### 4.1 Vérifier `frontend/src/App.js`

Vérifiez que les 6 routes admin existent :
```javascript
<Route path="/admin/dashboard" element={...} />
<Route path="/admin/formations" element={...} />
<Route path="/admin/visites" element={...} />
<Route path="/admin/sensibilisations" element={...} />
<Route path="/admin/participations" element={...} />
<Route path="/admin/cancelled" element={...} />
```

### 4.2 Vérifier les imports

Les pages doivent être importées :
```javascript
import AdminDashboard from './pages/AdminDashboard';
import AdminFormations from './pages/AdminFormations';
// ... etc
```

## 👤 Étape 5 : Créer un Utilisateur Admin

### Méthode 1 : Directement en base de données

```sql
-- Créer un utilisateur admin
-- IMPORTANT: Remplacez '$2a$10$...' par un hash bcrypt valide
INSERT INTO users (email, password, role, is_valid, created_at, updated_at) 
VALUES (
  'admin@example.com',
  '$2a$10$...hash_bcrypt_du_mot_de_passe...',
  'admin',
  true,
  NOW(),
  NOW()
);
```

Pour générer un hash bcrypt, utilisez Node.js :
```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('password123', 10, (err, hash) => {
  console.log(hash);
});
```

### Méthode 2 : Via le formulaire d'enregistrement

Si vous avez un moyen de créer un admin via l'interface, utilisez-le.

## 🚀 Étape 6 : Démarrer l'Application

### Terminal 1 - Backend
```powershell
cd backend
npm install  # Si besoin
npm start
# Output: ✅ Server running on port 5000
```

### Terminal 2 - Frontend
```powershell
cd frontend
npm install  # Si besoin
npm start
# Output: Compiled successfully!
# http://localhost:3000
```

## 🧪 Étape 7 : Tester l'Application

### 7.1 Test de Login Admin

1. Ouvrez http://localhost:3000
2. Cliquez sur "Login"
3. Entrez les credentials admin
4. Attendez la redirection vers `/admin/dashboard`

### 7.2 Test des Pages

Vérifiez que vous pouvez accéder à :
- ✅ /admin/dashboard (vue d'ensemble)
- ✅ /admin/formations (gestion formations)
- ✅ /admin/visites (gestion visites)
- ✅ /admin/sensibilisations (gestion sensibilisations)
- ✅ /admin/participations (gestion participations)
- ✅ /admin/cancelled (gestion annulations)

### 7.3 Test des Opérations CRUD

#### Créer une Formation
1. Allez à /admin/formations
2. Cliquez "+ Nouvelle Formation"
3. Remplissez les champs
4. Cliquez "Créer"
5. Vérifiez l'apparition dans la table

#### Modifier une Formation
1. Cliquez "✏️ Modifier" sur une formation
2. Modifiez les données
3. Cliquez "Mettre à jour"
4. Vérifiez la modification

#### Supprimer une Formation
1. Cliquez "🗑️ Supprimer"
2. Confirmez
3. Vérifiez que le statut change à "Inactive"

### 7.4 Test de Replanification

1. Allez à /admin/cancelled
2. Vérifiez la liste des activités annulées
3. Cliquez "🔄 Replanifier" sur une activité
4. Modifiez les dates
5. Vérifiez la réactivation

## 🔒 Étape 8 : Vérifier la Sécurité

### 8.1 Test d'Accès Non-Admin

Créez un utilisateur adhérant :
```sql
INSERT INTO users (email, password, role, is_valid, created_at, updated_at) 
VALUES ('adherant@example.com', '$2a$10$...', 'adherant', true, NOW(), NOW());
```

Testez :
1. Connectez-vous avec le compte adhérant
2. Essayez d'accéder à /admin/dashboard
3. Vérifiez que vous êtes redirigé vers /dashboard

### 8.2 Test sans Token

```bash
# Cela devrait échouer (401 Unauthorized)
curl http://localhost:5000/api/admin/formations
```

### 8.3 Test avec Mauvais Rôle

Loggez-vous en tant qu'adhérant et essayez :
```bash
curl -H "Authorization: Bearer $ADHERANT_TOKEN" \
  http://localhost:5000/api/admin/formations
# Résultat: 403 Forbidden
```

## 📊 Étape 9 : Vérifier la Base de Données

### Vérifier les Données Créées

```sql
-- Vérifier les formations créées
SELECT * FROM formations;

-- Vérifier les participations
SELECT * FROM participer;

-- Vérifier les visites
SELECT * FROM visite_entreprise;
SELECT * FROM visite_systematique;

-- Vérifier les sensibilisations
SELECT * FROM sensibilisations;
```

### Vérifier les Soft Deletes

```sql
-- Voir TOUTES les formations (inclus annulées)
SELECT * FROM formations WHERE is_valid = false;

-- Voir seulement les actives
SELECT * FROM formations WHERE is_valid = true;
```

## 📋 Étape 10 : Tester les API

Utilisez le script de test fourni :

```powershell
# Sur Windows, utilisez Git Bash ou convertissez en PowerShell

# Ou utilisez Postman/Insomnia
# URL de base: http://localhost:5000/api/admin
# Header: Authorization: Bearer <JWT_TOKEN>

GET    /formations
POST   /formations
PUT    /formations/1
DELETE /formations/1

# ... etc pour tous les endpoints
```

## 🐛 Étape 11 : Dépannage

### Erreur: "Role-based access denied"
- Vérifiez que le JWT contient le champ `role`
- Vérifiez que `role === 'admin'`
- Vérifiez la base de données pour l'utilisateur

### Erreur: "Formation not found"
- Vérifiez que l'ID de formation existe
- Utilisez le bon ID (pas 0 ou valeur négative)
- Vérifiez que la formation est active

### Erreur: "Adherant not found"
- Vérifiez que l'ID adhérant existe
- Allez dans `/admin/cancelled` pour voir les adhérants existants
- Vérifiez l'orthographe de l'ID

### Erreur: "Server error"
- Vérifiez les logs du serveur backend
- Vérifiez la connexion MySQL
- Vérifiez que le PORT n'est pas en conflit

### Page blanche sur /admin/*
- Ouvrez la console du navigateur (F12)
- Cherchez les erreurs JavaScript
- Vérifiez que les imports React sont corrects

## 📝 Étape 12 : Documentation

### Pour les Admins
Donnez-leur : **ADMIN_USAGE_GUIDE.md**
- Guide pas-à-pas
- Bonnes pratiques
- Dépannage

### Pour les Développeurs
Donnez-leur : **ADMIN_MODULE.md**
- Référence technique
- Endpoints API
- Architecture

## ✨ Étape 13 : Production

### Variables d'Environnement (.env)
```
NODE_ENV=production
PORT=5000
DB_HOST=your_host
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=plateforme_adherants
JWT_SECRET=your_secret_key
```

### Optimisations Production
- Minifier le code React : `npm run build`
- Utiliser HTTPS : Configurer avec nginx/Apache
- Limiter les requêtes : Ajouter rate limiting
- Surveiller les logs : Utiliser PM2 ou similarTélécharger

### Déploiement
```bash
# Build frontend
cd frontend
npm run build
# Upload dist/ contents to web server

# Deploy backend
# Upload backend/ to server
# Configure environment variables
# Run: npm start ou pm2 start server.js
```

## ✅ Checklist Finale

- [ ] Tous les fichiers créés et en place
- [ ] server.js contient la route admin
- [ ] auth.js contient verifyAdmin
- [ ] App.js a les 6 routes admin
- [ ] Utilisateur admin créé en base de données
- [ ] Backend démarré sans erreurs
- [ ] Frontend compilé sans erreurs
- [ ] Login admin fonctionne
- [ ] Dashboard admin accessible
- [ ] CRUD formations opérationnel
- [ ] Replanification fonctionne
- [ ] Accès adhérant refusé
- [ ] Documentation distribuée
- [ ] Tests de sécurité passés

## 🎉 Résultat

Vous devez avoir :
- ✅ Un système admin complet et sécurisé
- ✅ 6 pages de gestion différentes
- ✅ CRUD complet pour 5 types de ressources
- ✅ Replanification d'activités annulées
- ✅ Protection d'accès basée sur les rôles
- ✅ Soft delete pattern implémenté
- ✅ Documentation complète

**Félicitations! Le module admin est installé et fonctionnel! 🚀**
