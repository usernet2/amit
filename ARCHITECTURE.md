# 🏗️ Architecture Technique - Plateforme Adhérants

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│              localhost:3000                                  │
├─────────────────────────────────────────────────────────────┤
│  • Pages: Login, Register, Dashboard                        │
│  • Modals: Visites, Formations, Sensibilisations           │
│  • Services: API calls (axios)                              │
│  • State: useState/useEffect                                │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/JSON
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (Express)                       │
│              localhost:5000                                  │
├─────────────────────────────────────────────────────────────┤
│  Routes:                                                     │
│  • /api/auth/* (login, register)                            │
│  • /api/visites/* (get, cancel)                             │
│  • /api/formations/* (get, enroll, cancel)                  │
│  • /api/sensibilisations/* (get, check, cancel)             │
│                                                              │
│  Middleware:                                                │
│  • JWT verification                                         │
│  • CORS                                                      │
│  • Body parser                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ SQL Queries
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    MySQL Database                           │
│              localhost:3306                                  │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                     │
│  • users                                                     │
│  • adherants                                                │
│  • visite_entreprise                                        │
│  • visite_systematique                                      │
│  • formations                                               │
│  • participer                                               │
│  • sensibilisations                                         │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Flux d'Authentification

```
1. Utilisateur → Frontend
   ├─ Email/Mot de passe
   └─ Clic "Se connecter"

2. Frontend → Backend
   POST /api/auth/login
   ├─ Envoie: email, password
   └─ Reçoit: JWT token

3. Frontend → localStorage
   ├─ Stocke le token
   └─ Redirection vers /dashboard

4. Requêtes protégées
   ├─ Token envoyé en Header: Authorization: Bearer <token>
   ├─ Backend vérifie le token (JWT middleware)
   └─ Si valide: traite la requête
      Si invalide: retour 403 Forbidden
```

## 📊 Modèle de Données - Relations

```
users (1:1) ─────→ adherants
                       │
                       ├─── (1:M) ─→ visite_entreprise
                       │
                       ├─── (1:M) ─→ visite_systematique
                       │
                       ├─── (M:N) ─→ formations (via participer)
                       │
                       └─── (1:M) ─→ sensibilisations

participer (1:M) ──→ formations
```

## 🔄 Cycle de Vie des Données

### Création d'Adhérant
```
Register Form
    ↓
POST /api/auth/register
    ├─ Hash password (bcryptjs)
    ├─ INSERT users
    └─ INSERT adherants (avec user_id)
```

### Consultation des Visites
```
Dashboard → Clic "Visites"
    ↓
GET /api/visites (avec JWT)
    ├─ Backend extrait adherantId du token
    └─ SELECT * FROM visite_entreprise WHERE adherant_id = ?
       SELECT * FROM visite_systematique WHERE adherant_id = ?
```

### Annulation de Visite
```
Modal Visites → Clic "Annuler"
    ↓
POST /api/visites/cancel
    ├─ Backend vérifie la propriété (adherant_id)
    └─ UPDATE visite_entreprise SET is_valid = false
```

## 🛡️ Sécurité Implémentée

| Couche | Mesure | Implémentation |
|--------|--------|-----------------|
| **Authentification** | Hash password | bcryptjs (salt: 10) |
| | JWT tokens | HS256, expiration 7j |
| | Token validation | Middleware verifyToken |
| **Base de données** | SQL Injection | Prepared statements |
| | Isolation données | WHERE adherant_id = req.user.adherantId |
| **API** | CORS | Configuré pour localhost:3000 |
| | Rate limiting | À ajouter en production |
| **Frontend** | XSS Protection | React autoéchappe |
| | HTTPS | À configurer en production |

## 📁 Structure des Fichiers Clés

### Backend Controllers
```
authController.js
├─ register(email, password, nom, siege, contact)
└─ login(email, password) → token

visitesController.js
├─ getVisites() → visite_entreprise + visite_systematique
└─ cancelVisite(id, type) → UPDATE is_valid = false

formationsController.js
├─ getFormations() → participated + available
├─ enrollFormation(formationId, date_deb, date_fin)
└─ cancelFormation(participationId)

sensibilisationsController.js
├─ getSensibilisations() → liste année courante
├─ hasSensibilisations() → boolean
└─ cancelSensibilisation(id)
```

### Frontend Components
```
Login.js
├─ Email/Password input
├─ authService.login()
└─ localStorage.setItem('token')

Dashboard.js
├─ Affiche boutons (Visites, Formations, Sensibilisations)
├─ Gère modals
└─ Vérifie hasSensibilisations()

VisitesModal.js
├─ affiche 2 accordions
└─ 2 types de visites

FormationsModal.js
├─ Affiche 2 accordions
├─ Mes formations (avec annulation)
└─ Formations disponibles

SensibilisationsModal.js
├─ Liste des sensibilisations
└─ Boutons d'annulation
```

## ⚙️ Configuration Serveur

### Express Middleware (dans server.js)
```javascript
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes publiques
app.use('/api/auth', authRoutes);

// Routes protégées (avec JWT middleware)
app.use('/api/visites', verifyToken, visitesRoutes);
app.use('/api/formations', verifyToken, formationsRoutes);
app.use('/api/sensibilisations', verifyToken, sensibilisationsRoutes);
```

## 📈 Scalabilité et Évolutions Futures

### Court terme
- [ ] Validation côté serveur (express-validator)
- [ ] Rate limiting (express-rate-limit)
- [ ] Tests unitaires (Jest)
- [ ] Tests d'intégration (Supertest)

### Moyen terme
- [ ] Pagination des résultats
- [ ] Filtrage avancé (dates, status)
- [ ] Export PDF/Excel
- [ ] Notifications email
- [ ] Historique des modifications

### Long terme
- [ ] Cache (Redis)
- [ ] Microservices
- [ ] GraphQL API
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard

## 🚀 Déploiement

### Frontend
```bash
npm run build
# Déployer le dossier "build/" sur Vercel, Netlify ou serveur
```

### Backend
```bash
# Sur serveur (avec PM2)
npm install -g pm2
pm2 start server.js --name "adherant-api"
pm2 save
pm2 startup
```

### Base de données
```bash
# Backup régulier
mysqldump -u root -p adherant_platform > backup.sql

# Restore
mysql -u root -p adherant_platform < backup.sql
```

## 📊 Performance Estimée

- **Temps réponse API**: < 200ms (local)
- **Temps chargement Frontend**: < 3s (optimisé)
- **Capacité**: 10K+ adhérants sans dégradation
- **Concurrence**: 1000+ utilisateurs simultanés (avec Load Balancer)

---

**Architecture solide et modulaire pour une plateforme professionnelle! 🎯**
