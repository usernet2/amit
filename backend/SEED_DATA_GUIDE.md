# 🧪 Guide de Test AMIT Platform

## 📋 Données de Test Disponibles

Un script `seedData.js` a été créé pour remplir la base de données avec des données de test réalistes.

### Types de Données Inclusos:

- **3 Centres** (Nord, Sud, Est)
- **1 Admin** 
- **2 Médecins Chefs**
- **3 Adhérants (Entreprises)**
- **3 Formations**
- **2 Visites Entreprise**
- **2 Visites Systématiques**
- **2 Sensibilisations**
- **3 Participations** (adhérants aux formations)

---

## 🚀 Comment Lancer le Seed

### Prérequis
- Base de données MySQL initialisée (tables créées via `db/init.js`)
- Backend démarré au moins une fois

### Commande
```bash
cd backend
npm run seed:data
```

### Résultat
Le script affichera tous les identifiants de test créés:

```
🎉 Seed terminé avec succès!

========================================
📊 RÉSUMÉ DES DONNÉES AJOUTÉES:
========================================
✓ 3 centres
✓ 1 admin
✓ 2 médecins chefs
✓ 3 adhérants
✓ 3 formations
✓ 2 visites entreprise
✓ 2 visites systématiques
✓ 2 sensibilisations

========================================
🔐 IDENTIFIANTS DE TEST:
========================================

👨‍💼 ADMIN:
   Email: admin@amit.com
   Password: Admin@123

👨‍⚕️ MÉDECINS CHEFS:
   Email: medecin-nord@amit.com
   Password: Medecin@123
   
   Email: medecin-sud@amit.com
   Password: Medecin@123

🏢 ADHÉRANTS (ENTREPRISES):
   Email: user1@gmail.com
   Password: Adherant@123
   Entreprise: Entreprise Technologie SARL
   
   Email: user2@gmail.com
   Password: Adherant@123
   Entreprise: Industries Manufacturières LTÉE
   
   Email: user3@gmail.com
   Password: Adherant@123
   Entreprise: Services Commerciaux EIRL
```

---

## 🔓 Comptes de Test

### 1️⃣ Compte Admin
```
Email: admin@amit.com
Mot de passe: Admin@123
Rôle: admin
```
**Accès:** Dashboard admin avec gestion complète

### 2️⃣ Comptes Médecins Chefs
```
Email: medecin-nord@amit.com (ou medecin-sud@amit.com)
Mot de passe: Medecin@123
Rôle: medecin_chef
```
**Accès:** Dashboard médecin chef pour visualiser les activités du centre

### 3️⃣ Comptes Adhérants (Entreprises)
```
Email: user1@gmail.com (ou user2@gmail.com, user3@gmail.com)
Mot de passe: Adherant@123
Rôle: adherant
```
**Accès:** Dashboard adhérant avec visualisation des formations/visites/sensibilisations

---

## 📊 Données de Chaque Table

### Centres
| ID | Nom | Région | Responsable |
|----|----|--------|-------------|
| 1 | Centre Nord | Alger | Ahmed Ben Ali |
| 2 | Centre Sud | Oran | Fatima Zahra |
| 3 | Centre Est | Constantine | Mohammed Karim |

### Entreprises (Adhérants)
| Raison Sociale | Secteur | Email Contact | Téléphone |
|---|---|---|---|
| Entreprise Technologie SARL | Tech | contact@tech-sarl.com | +213 21 123 4567 |
| Industries Manufacturières LTÉE | Industrie | info@industries-mfg.com | +213 41 234 5678 |
| Services Commerciaux EIRL | Commerce | support@services-comm.com | +213 31 345 6789 |

### Formations
| Titre | Description | Date Planifiée |
|---|---|---|
| Hygiène et Sécurité au Travail | Formation sur normes SSE | 2025-02-15 |
| Premiers Secours en Entreprise | Formation pratique RCP | 2025-03-10 |
| Prévention des Risques Professionnels | Sensibilisation aux risques | 2025-02-28 |

### Visites Entreprise
| Entreprise | Type | Date | Statut |
|---|---|---|---|
| Entreprise Technologie SARL | Contrôle de routine | 2025-02-01 | Réalisée |
| Industries Manufacturières LTÉE | Suite à incident | 2025-02-10 | Planifiée |

### Visites Systématiques
| Entreprise | Secteur | Date | Statut |
|---|---|---|---|
| Entreprise Technologie SARL | Secteur Primaire | 2025-03-05 | Planifiée |
| Services Commerciaux EIRL | Secteur Tertiaire | 2025-02-20 | Réalisée |

### Sensibilisations
| Titre | Description | Date |
|---|---|---|
| Sensibilisation Santé et Sécurité | Campagne bonnes pratiques | 2025-02-05 |
| Sensibilisation Environnement | Protection environnement | 2025-03-15 |

---

## ✅ Tests à Effectuer

### 1. Test Admin
- [ ] Se connecter avec admin@amit.com
- [ ] Accéder au dashboard admin
- [ ] Visualiser les activités de tous les centres
- [ ] Modifier une formation
- [ ] Planifier une visite

### 2. Test Médecin Chef
- [ ] Se connecter avec medecin-nord@amit.com
- [ ] Accéder au dashboard médecin chef
- [ ] Visualiser les formations du centre
- [ ] Consulter les visites planifiées

### 3. Test Adhérant
- [ ] Se connecter avec user1@gmail.com
- [ ] Accéder au dashboard adhérant
- [ ] Visualiser les formations inscrites
- [ ] Consulter l'historique des visites
- [ ] Voir les sensibilisations

### 4. Test Mot de Passe Oublié
- [ ] Aller sur /forgot-password
- [ ] Entrer un email valide (admin@amit.com)
- [ ] Recevoir le code par email (si configuré)
- [ ] Entrer le nouveau mot de passe

---

## 🔄 Réinitialiser les Données

Si vous voulez remettre à zéro:

```bash
# Option 1: Supprimer la base de données et la recréer
# Dans MySQL:
DROP DATABASE amit;
# Puis redémarrer le backend (il recréera tout)

# Option 2: Relancer juste le seed
npm run seed:data
```

---

## 📝 Notes

- Les mots de passe de test sont simples pour faciliter les tests
- Les dates sont dans le futur pour tester les planifications
- Le script utilise `INSERT IGNORE` pour éviter les doublons si exécuté plusieurs fois
- Les données sont cohérentes (adhérants liés à des centres, formations à des centres, etc.)

