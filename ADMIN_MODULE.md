# Module Admin - Documentation

## 📋 Vue d'ensemble

Le module admin permet aux administrateurs de gérer complètement la plateforme :
- Formations (création, modification, suppression)
- Visites (d'entreprise et systématiques)
- Sensibilisations
- Participations aux formations
- Activités annulées et replanification

## 🔐 Authentification & Autorisation

### Système de Rôles
- **Admin** : Accès complet à toutes les fonctionnalités d'administration
- **Adherant** : Accès limité au dashboard personnel

### Vérification de l'Accès

Le middleware `verifyAdmin` vérifie que :
1. L'utilisateur est authentifié (JWT valide)
2. Le rôle de l'utilisateur est `'admin'`

```javascript
// routes/admin.js
router.use(verifyToken);      // Vérifie le JWT
router.use(verifyAdmin);      // Vérifie le rôle admin
```

## 📚 API Endpoints

### Base URL
```
http://localhost:5000/api/admin
```

### Authentification
Tous les endpoints requièrent le header :
```
Authorization: Bearer <JWT_TOKEN>
```

### Formations

#### GET /formations
Récupère toutes les formations

**Réponse:**
```json
[
  {
    "id": 1,
    "designation": "Formation React",
    "description": "Apprentissage de React",
    "is_valid": true,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
]
```

#### POST /formations
Crée une nouvelle formation

**Body:**
```json
{
  "designation": "Formation Node.js",
  "description": "Apprentissage de Node.js"
}
```

#### PUT /formations/:id
Met à jour une formation

**Body:**
```json
{
  "designation": "Formation Node.js Avancée",
  "description": "Concepts avancés de Node.js"
}
```

#### DELETE /formations/:id
Supprime une formation (soft delete)

---

### Visites

#### GET /visites
Récupère toutes les visites

**Réponse:**
```json
{
  "visiteEntreprise": [
    {
      "id": 1,
      "date_heure": "2024-02-01T14:00:00Z",
      "adherant_nom": "Jean Dupont",
      "type": "entreprise",
      "is_valid": true
    }
  ],
  "visiteSystematique": [
    {
      "id": 2,
      "date_deb": "2024-02-01",
      "date_fin": "2024-02-28",
      "adherant_nom": "Marie Martin",
      "type": "systematique",
      "is_valid": true
    }
  ]
}
```

#### POST /visites/entreprise
Crée une visite d'entreprise

**Body:**
```json
{
  "adherant_id": 1,
  "date_heure": "2024-02-01T14:00:00"
}
```

#### POST /visites/systematique
Crée une visite systématique

**Body:**
```json
{
  "adherant_id": 1,
  "date_deb": "2024-02-01",
  "date_fin": "2024-02-28"
}
```

#### PUT /visites/:type/:id
Met à jour une visite

**URL Parameters:**
- `type`: `entreprise` ou `systematique`
- `id`: ID de la visite

---

### Sensibilisations

#### GET /sensibilisations
Récupère toutes les sensibilisations

#### POST /sensibilisations
Crée une sensibilisation

**Body:**
```json
{
  "sujet": "Sécurité informatique",
  "date": "2024-02-15",
  "adherant_id": 1
}
```

#### PUT /sensibilisations/:id
Met à jour une sensibilisation

#### DELETE /sensibilisations/:id
Supprime une sensibilisation

---

### Participations

#### GET /participations
Récupère toutes les participations

#### POST /participations
Crée une participation

**Body:**
```json
{
  "formation_id": 1,
  "adherant_id": 1,
  "date_deb": "2024-02-01",
  "date_fin": "2024-02-28"
}
```

#### PUT /participations/:id
Met à jour une participation

#### DELETE /participations/:id
Supprime une participation

---

### Activités Annulées

#### GET /cancelled
Récupère toutes les activités annulées

**Réponse:**
```json
{
  "formations": [...],
  "participations": [...],
  "visites_entreprise": [...],
  "visites_systematique": [...],
  "sensibilisations": [...],
  "total": {
    "formations": 0,
    "participations": 2,
    "visites_entreprise": 1,
    "visites_systematique": 0,
    "sensibilisations": 0
  }
}
```

#### POST /replan/:type/:id
Replanifie une activité annulée

**URL Parameters:**
- `type`: Type d'activité (`visite_entreprise`, `visite_systematique`, `sensibilisation`, `participation`, `formation`)
- `id`: ID de l'activité

**Body (exemples):**

Pour visite d'entreprise:
```json
{
  "date_heure": "2024-03-01T14:00:00"
}
```

Pour visite systématique:
```json
{
  "date_deb": "2024-03-01",
  "date_fin": "2024-03-31"
}
```

Pour sensibilisation:
```json
{
  "sujet": "Sécurité informatique",
  "date": "2024-03-15"
}
```

#### POST /cancel/:type/:id
Annule une activité

---

## 🖥️ Interface Frontend

### Accès Admin

1. **Login en tant qu'admin**
   - Email: admin@example.com
   - Le système détecte automatiquement le rôle

2. **Navigation**
   - Après login, les admins sont redirigés vers `/admin/dashboard`
   - Les adhérants voient `/dashboard` (dashboard personnel)

### Pages Admin

#### Dashboard Admin (`/admin/dashboard`)
- Vue d'ensemble des statistiques
- Cartes cliquables vers chaque section
- Boutons d'actions rapides

#### Gestion des Formations (`/admin/formations`)
- Tableau des formations actives
- Création de nouvelles formations
- Modification des formations actives
- Suppression (soft delete)

#### Gestion des Visites (`/admin/visites`)
- Deux tableaux séparés : entreprise et systématique
- Création de visites par type
- Modification et suppression

#### Gestion des Sensibilisations (`/admin/sensibilisations`)
- Tableau de toutes les sensibilisations
- CRUD complet

#### Gestion des Participations (`/admin/participations`)
- Tableau des inscriptions aux formations
- Association adhérant ↔ formation

#### Gestion des Annulations (`/admin/cancelled`)
- Vue complète de toutes les activités annulées
- Statistiques d'annulations
- Replanification avec nouvelles dates
- Réactivation des formations et participations

## 🔄 Soft Delete Pattern

Le système utilise un pattern de suppression logique :
- Les activités ne sont jamais physiquement supprimées
- Une colonne `is_valid` (boolean) marque le statut
- Les activités supprimées ne s'affichent pas par défaut
- Elles peuvent être récupérées pour replanification

## 🛡️ Sécurité

### Protection des Routes
- Middleware `verifyToken` : Valide le JWT
- Middleware `verifyAdmin` : Vérifie le rôle admin
- Les préparations paramétrées préviennent les injections SQL

### Validation des Données
- Vérification des champs requis
- Vérification de l'existence des ressources
- Prévention des doublons (ex: adhérant déjà inscrit)

## 📊 Exemples d'Utilisation

### Créer une formation
```javascript
const response = await adminFormations.create({
  designation: "Formation Vue.js",
  description: "Framework Vue.js"
});
```

### Replanifier une visite annulée
```javascript
const response = await adminCancelled.replanify(
  'visite_entreprise',
  5,  // ID de la visite
  { date_heure: "2024-03-01T14:00:00" }
);
```

### Obtenir toutes les activités annulées
```javascript
const response = await adminCancelled.getAll();
console.log(response.data.total);  // Affiche les statistiques
```

## ⚠️ Restrictions

### Modifications impossibles
- Les formations annulées (`is_valid = false`) ne peuvent pas être modifiées
- Les participations ne peuvent pas être modifiées si annulées
- Les visites ne peuvent pas être modifiées si annulées

### Suppressions
- Supprimer une formation annule automatiquement toutes ses participations
- Les suppressions sont des soft delete (l'enregistrement persiste)

## 🚀 Déploiement

### Variables d'Environnement Requises
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=plateforme_adherants
JWT_SECRET=your_jwt_secret
```

### Vérification de Déploiement
1. Vérifier que les routes admin sont chargées dans `server.js`
2. Vérifier que le middleware `verifyAdmin` est appliqué
3. Tester l'accès admin avec les credentials d'admin
4. Vérifier que les adhérants ne peuvent pas accéder aux routes admin

## 📝 Logs

Les erreurs sont loggées dans la console du serveur :
```
Get formations error: [Error details]
Create visite error: [Error details]
Replanify activity error: [Error details]
```

## ✅ Checklist d'Installation

- [ ] Routes admin importées dans `server.js`
- [ ] Middleware admin appliqué aux routes
- [ ] Pages admin créées dans React
- [ ] Service API admin créé
- [ ] Routes dans `App.js` configurées
- [ ] Styles CSS appliqués
- [ ] Test de login admin
- [ ] Test de CRUD formation
- [ ] Test de replanification activité
- [ ] Vérification accès adhérants refusé
