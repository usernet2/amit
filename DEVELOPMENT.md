# Configuration de développement

## Fichiers .env requis

### Backend: `backend/.env`

```env
# MySQL Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root_password
DB_NAME=adherant_platform
DB_PORT=3306

# JWT Configuration
JWT_SECRET=adherant_platform_secret_key_2025
JWT_EXPIRY=7d

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Variables d'environnement disponibles

### Backend

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| DB_HOST | Hôte MySQL | localhost |
| DB_USER | Utilisateur MySQL | root |
| DB_PASSWORD | Mot de passe MySQL | - |
| DB_NAME | Nom base de données | adherant_platform |
| DB_PORT | Port MySQL | 3306 |
| JWT_SECRET | Clé secrète JWT | - |
| JWT_EXPIRY | Expiration JWT | 7d |
| PORT | Port serveur | 5000 |
| NODE_ENV | Environnement | development |

## Scripts disponibles

### Backend
```bash
npm start         # Démarrer le serveur
npm run dev       # Mode développement (nodemon)
node scripts/seed.js  # Ajouter données de test
```

### Frontend
```bash
npm start         # Démarrer en développement
npm run build     # Build production
npm test          # Tests
```

## Connexion MySQL pour développement

```bash
# Créer la base de données
mysql -u root -p
> CREATE DATABASE adherant_platform;
> EXIT;

# Ou avec une commande directe
mysql -u root -p -e "CREATE DATABASE adherant_platform;"
```

## Données de test par défaut

Après exécution de `seed.js`:

**Adhérant 1:**
- Email: alice@example.com
- Mot de passe: password123
- Siège: Paris
- Contact: 01 23 45 67 89

**Adhérant 2:**
- Email: bob@example.com
- Mot de passe: password123
- Siège: Lyon
- Contact: 04 12 34 56 78

## Tests API avec curl/Postman

### Inscription
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "nom": "Test Company",
  "siege": "Paris",
  "contact": "01 23 45 67 89"
}
```

### Connexion
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "password123"
}

# Réponse:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "alice@example.com",
    "adherantId": 1
  }
}
```

### Récupérer les visites
```bash
GET http://localhost:5000/api/visites
Authorization: Bearer YOUR_TOKEN
```

### Récupérer les formations
```bash
GET http://localhost:5000/api/formations
Authorization: Bearer YOUR_TOKEN
```

### Récupérer les sensibilisations
```bash
GET http://localhost:5000/api/sensibilisations
Authorization: Bearer YOUR_TOKEN
```

## Points importants pour le développement

1. **JWT Token**: Stocké dans `localStorage` côté frontend
2. **Sécurité**: Les mots de passe sont hachés avec bcryptjs
3. **CORS**: Configuré pour communiquer entre ports 3000 et 5000
4. **Prepared Statements**: Toutes les requêtes utilisent des paramètres bindés
5. **Isolation des données**: Chaque adhérant ne voit que ses données

## Debugging

### Voir les logs du backend
```bash
# Dans le terminal du backend
# Les requêtes et erreurs s'affichent automatiquement
```

### Voir les logs du frontend
```bash
# Ouvrir DevTools (F12) dans le navigateur
# Onglet Console
```

### Vérifier la connexion MySQL
```bash
mysql -u root -p
mysql> USE adherant_platform;
mysql> SHOW TABLES;
mysql> SELECT * FROM users;
```

---

**Prêt pour le développement! 🚀**
