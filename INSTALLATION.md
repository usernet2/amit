# 📖 GUIDE D'INSTALLATION COMPLET

## 1. Prérequis

- **Node.js** (v14 ou supérieur) - [Télécharger](https://nodejs.org/)
- **MySQL** (v5.7 ou supérieur) - [Télécharger](https://www.mysql.com/downloads/)
- **Git** (optionnel) - [Télécharger](https://git-scm.com/)

## 2. Installation sur Windows

### Étape 1: Configurer MySQL

1. Ouvrir **MySQL Command Line Client** ou **MySQL Workbench**
2. Exécuter les commandes:

```sql
-- Se connecter à MySQL
mysql -u root -p

-- Créer la base de données
CREATE DATABASE adherant_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Vérifier la création
SHOW DATABASES;
```

### Étape 2: Installation Backend

1. Ouvrir **PowerShell** ou **Command Prompt** dans le dossier `backend`

```powershell
# Naviguer vers le dossier backend
cd c:\Users\User\Desktop\AMIT\backend

# Installer les dépendances
npm install

# Copier le fichier .env
copy .env.example .env
```

2. Éditer le fichier `.env` avec vos paramètres:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=adherant_platform
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=7d
PORT=5000
NODE_ENV=development
```

3. Démarrer le serveur:

```powershell
npm start
```

✅ Le serveur doit afficher: `✅ Server running on port 5000`

### Étape 3: Installation Frontend

1. Ouvrir une **nouvelle** **PowerShell** dans le dossier `frontend`

```powershell
# Naviguer vers le dossier frontend
cd c:\Users\User\Desktop\AMIT\frontend

# Installer les dépendances
npm install

# Démarrer l'application
npm start
```

✅ L'application s'ouvrira automatiquement sur `http://localhost:3000`

## 3. Ajouter des Données de Test

```powershell
# Dans le dossier backend
cd c:\Users\User\Desktop\AMIT\backend

# Exécuter le script de seeding
node scripts\seed.js
```

**Identifiants de test:**
- Email: `alice@example.com` ou `bob@example.com`
- Mot de passe: `password123`

## 4. Structure du Projet

```
AMIT/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── db/
│   │   └── init.js
│   ├── scripts/
│   │   └── seed.js
│   ├── server.js
│   ├── package.json
│   └── .env (à créer)
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── README.md
```

## 5. Ports et URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend React | http://localhost:3000 | 3000 |
| Backend API | http://localhost:5000 | 5000 |
| MySQL | localhost | 3306 |

## 6. Dépannage

### Erreur: "Cannot find module"
```powershell
# Réinstaller les dépendances
npm install
```

### Erreur: "Port already in use"
```powershell
# Changer le port dans .env (backend)
PORT=5001
```

### Erreur: "MySQL Connection refused"
- Vérifier que MySQL est en cours d'exécution
- Vérifier les paramètres DB_* dans .env
- Vérifier que la base de données existe

```powershell
# Vérifier la connexion MySQL
mysql -u root -p
mysql> SHOW DATABASES;
```

### Erreur: "CORS error"
- Vérifier que le backend est actif sur le port 5000
- Vérifier le proxy dans `frontend/package.json`

## 7. Utilisation de l'Application

### 1. Inscription
1. Aller sur `http://localhost:3000`
2. Cliquer sur "S'inscrire"
3. Remplir les informations

### 2. Connexion
1. Entrer votre email et mot de passe
2. Cliquer sur "Se connecter"

### 3. Dashboard
- **Visites**: Affiche les visites d'entreprise et systématiques
- **Formations**: Affiche vos formations et les formations disponibles
- **Sensibilisations**: Affiche les sensibilisations (si prévues cette année)

### 4. Annuler une Activité
- Cliquer sur le bouton "Annuler" à côté de l'activité
- L'activité sera marquée comme non valide

## 8. Commandes Utiles

```powershell
# Backend
npm start              # Démarrer le serveur
npm run dev           # Mode développement avec nodemon

# Frontend
npm start             # Démarrer l'app React
npm run build         # Générer la version de production
npm test              # Exécuter les tests
```

## 9. Production (Conseils)

Avant de déployer en production:

1. **Sécurité**:
   - Changer JWT_SECRET dans .env
   - Ajouter https
   - Configurer CORS correctement
   - Utiliser des variables d'environnement

2. **Base de données**:
   - Sauvegarder les données
   - Configurer les backups automatiques
   - Vérifier les permissions MySQL

3. **Frontend**:
   ```powershell
   npm run build
   ```
   - Déployer le dossier `build/` sur un serveur

4. **Backend**:
   - Utiliser PM2 ou autre gestionnaire de processus
   - Configurer les logs
   - Monitorer les performances

---

**✅ Installation complète! Vous êtes prêt à démarrer la plateforme Adhérants!**
