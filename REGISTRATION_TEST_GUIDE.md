# 🧪 Guide de Test - Page d'Inscription

## ✅ Pré-requis Avant Tests

- [ ] Backend démarré (`npm start` dans `/backend`)
- [ ] Frontend démarré (`npm start` dans `/frontend`)
- [ ] Database MySQL connectée
- [ ] Tables `users` et `adherants` créées

---

## 🧪 Tests Frontend

### Test 1: Validation Email Format

**Étapes:**
1. Accédez à `http://localhost:3000/register`
2. Tapez `invalid.email` dans le champ Email
3. Attendez 500ms

**Résultat attendu:**
- ❌ Erreur: "Format d'email invalide"
- Bouton "Créer mon compte" désactivé
- Classe CSS `input-error` appliquée

---

### Test 2: Vérification Email Unique

**Étapes:**
1. Tapez `admin@example.com` (email déjà existant)
2. Attendez la réponse API (spinner visible)

**Résultat attendu:**
- ⏳ Spinner visible pendant vérification
- ❌ Après 1-2s: "Cet email est déjà utilisé"
- ✗ Icône rouge affichée
- Bouton désactivé

---

### Test 3: Email Disponible

**Étapes:**
1. Tapez `newuser123@example.com`
2. Attendez la réponse API

**Résultat attendu:**
- ⏳ Spinner pendant vérification
- ✅ Après 1s: "Email disponible"
- ✓ Icône verte affichée
- Message vert
- Champ accepte l'entrée

---

### Test 4: Validation Nom Adhérant

**Cas 1 - Nom trop court:**
- Input: `Jo`
- Résultat: ❌ "Le nom doit contenir au moins 3 caractères"

**Cas 2 - Caractères invalides:**
- Input: `Jean123`
- Résultat: ❌ "Le nom ne doit contenir que des lettres, espaces et tirets"

**Cas 3 - Nom valide:**
- Input: `Jean-Marie Dupont`
- Résultat: ✅ Accepté, ✓ icône verte

---

### Test 5: Validation Contact

**Cas 1 - Format invalide:**
- Input: `123456`
- Résultat: ❌ "Format de téléphone invalide"

**Cas 2 - Format valide FR:**
- Input: `06 12 34 56 78`
- Résultat: ✅ Accepté, ✓ icône verte

**Cas 3 - Format international:**
- Input: `+33612345678`
- Résultat: ✅ Accepté

---

### Test 6: Validation Mot de Passe

**Cas 1 - Trop court:**
- Input: `Pass123!`
- Résultat: ❌ "Le mot de passe doit contenir au moins 8 caractères"
- Barre force: ROUGE

**Cas 2 - Mot de passe fort:**
- Input: `SecurePass123!@`
- Résultat: ✅ Accepté
- Barre force: VERT
- Label: "Très bon"

**Indicateurs de Force Visibles:**
```
✓ Au moins 8 caractères
✓ Mélange de majuscules et minuscules
✓ Incluez des chiffres et caractères spéciaux
```

---

### Test 7: Affichage/Masquage Mot de Passe

**Étapes:**
1. Tapez un mot de passe
2. Cliquez sur l'icône 👁️

**Résultat attendu:**
- Le texte devient visible
- Icône change (👁️‍🗨️)
- Clic de nouveau → masqué

---

### Test 8: Confirmation Mot de Passe

**Cas 1 - Mots de passe différents:**
- PWD: `SecurePass123!`
- Confirm: `DifferentPass456!`
- Résultat: ❌ "Les mots de passe ne correspondent pas"
- Bouton désactivé

**Cas 2 - Mots de passe identiques:**
- PWD: `SecurePass123!`
- Confirm: `SecurePass123!`
- Résultat: ✅ "Les mots de passe correspondent"
- ✓ Icône verte

---

### Test 9: Bouton Créer Compte

**Bouton désactivé si:**
- Email manquant ou invalide
- Nom manquant ou invalide
- Contact manquant ou invalide
- Mot de passe < 8 caractères
- Mots de passe différents

**Bouton activé si:**
- ✅ Tous les champs remplis correctement
- ✅ Email vérifié disponible
- ✅ Mot de passe ≥ 8 caractères
- ✅ Mots de passe correspondent

---

### Test 10: Message de Succès

**Étapes:**
1. Remplissez tous les champs valides
2. Cliquez "Créer mon compte"
3. Observez

**Résultat attendu:**
- ⏳ État "Inscription en cours..."
- ✅ Message vert "Inscription réussie"
- Message: "Redirection vers la page de connexion..."
- Après 2 secondes: redirection vers `/login`

---

### Test 11: Gestion d'Erreur Backend

**Étapes:**
1. Arrêtez le backend
2. Essayez de vous inscrire
3. Observez la réponse

**Résultat attendu:**
- ❌ Message d'erreur: "Erreur lors de l'inscription"
- Pas de redirection
- Possibilité de réessayer

---

## 🧪 Tests Backend

### Test 12: POST /auth/check-email

**Test 1 - Email disponible:**
```bash
curl -X POST http://localhost:5000/api/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com"}'
```

**Réponse attendue:**
```json
{
  "available": true,
  "message": "Email available"
}
```

**Test 2 - Email déjà utilisé:**
```bash
curl -X POST http://localhost:5000/api/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com"}'
```

**Réponse attendue:**
```json
{
  "available": false,
  "message": "Email already in use"
}
```

---

### Test 13: POST /auth/register

**Requête valide:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@test.com",
    "password":"SecurePass123!",
    "nom":"Test User",
    "contact":"0612345678",
    "siege":"Paris"
  }'
```

**Réponse attendue (201):**
```json
{
  "message": "User registered successfully",
  "userId": 42
}
```

**Vérification en BD:**
```sql
SELECT * FROM users WHERE email = 'newuser@test.com';
SELECT * FROM adherants WHERE email = 'newuser@test.com';
```

Doit retourner un enregistrement dans chaque table avec même email/user_id.

---

### Test 14: Erreur - Email Manquant

**Requête:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "password":"SecurePass123!",
    "nom":"Test User",
    "contact":"0612345678"
  }'
```

**Réponse attendue (400):**
```json
{
  "message": "Missing required fields: email, password, nom, contact"
}
```

---

### Test 15: Erreur - Email Invalide

**Requête:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"notanemail",
    "password":"SecurePass123!",
    "nom":"Test User",
    "contact":"0612345678"
  }'
```

**Réponse attendue (400):**
```json
{
  "message": "Invalid email format"
}
```

---

### Test 16: Erreur - Mot de Passe Court

**Requête:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"short",
    "nom":"Test User",
    "contact":"0612345678"
  }'
```

**Réponse attendue (400):**
```json
{
  "message": "Password must be at least 8 characters long"
}
```

---

### Test 17: Erreur - Email Déjà Utilisé

**Requête (email existant):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@example.com",
    "password":"SecurePass123!",
    "nom":"Test User",
    "contact":"0612345678"
  }'
```

**Réponse attendue (409):**
```json
{
  "message": "User already exists with this email"
}
```

---

## 🏗️ Tests Intégration

### Test 18: Flux Complet d'Inscription

1. **Accédez à /register** ✓
2. **Remplissez Email** → vérification OK ✓
3. **Remplissez Nom** → validation OK ✓
4. **Remplissez Contact** → validation OK ✓
5. **Remplissez Mot de passe** → force "Bon" ✓
6. **Confirmez mot de passe** → correspond ✓
7. **Cliquez Créer compte** → appel API ✓
8. **Recevez message succès** → vert ✓
9. **Redirigé vers /login** → après 2s ✓
10. **Connectez-vous** avec ce compte → succès ✓
11. **Accédez au dashboard** → adhérant créé ✓

---

### Test 19: Sécurité - Hash de Mot de Passe

**Vérification:**
```sql
SELECT password FROM users WHERE email = 'newuser@test.com';
```

**Résultat attendu:**
- Hash bcrypt (commence par `$2b$10$...`)
- Pas le mot de passe en clair
- Chaque inscription = hash différent

---

### Test 20: Responsive Design

**Mobile (< 480px):**
- [ ] Formulaire visible en intégralité
- [ ] Pas d'overflow horizontal
- [ ] Inputs cliquables (padding)
- [ ] Sidebar cachée
- [ ] Tous les messages visibles

**Tablet (480-768px):**
- [ ] 1 colonne
- [ ] Marginages adaptés
- [ ] Font sizes lisibles
- [ ] Boutons ergonomiques

**Desktop (> 1024px):**
- [ ] 2 colonnes visibles
- [ ] Sidebar avec avantages
- [ ] Layout équilibré
- [ ] Espace blanc utilisé

---

## 📊 Matrice de Test

| # | Test | Frontend | Backend | Résultat | Status |
|---|------|----------|---------|----------|--------|
| 1 | Email format | ✓ | - | Erreur visuel | ✅ |
| 2 | Email unique | ✓ | ✓ | Erreur réseau | ✅ |
| 3 | Email OK | ✓ | ✓ | Succès visuel | ✅ |
| 4 | Nom validation | ✓ | - | Erreur visuel | ✅ |
| 5 | Contact validation | ✓ | - | Erreur visuel | ✅ |
| 6 | PWD force | ✓ | - | Indicateur | ✅ |
| 7 | PWD toggle | ✓ | - | Affichage | ✅ |
| 8 | PWD confirmation | ✓ | - | Match check | ✅ |
| 9 | Bouton state | ✓ | - | Enable/disable | ✅ |
| 10 | Succès flow | ✓ | ✓ | Redirection | ✅ |
| 11 | Error handling | ✓ | ✓ | Message erreur | ✅ |
| 12 | Check-email API | ✓ | ✓ | JSON response | ✅ |
| 13 | Register API | ✓ | ✓ | User created | ✅ |
| 14 | Missing fields | ✓ | ✓ | 400 error | ✅ |
| 15 | Invalid email | ✓ | ✓ | 400 error | ✅ |
| 16 | Short PWD | ✓ | ✓ | 400 error | ✅ |
| 17 | Duplicate email | ✓ | ✓ | 409 error | ✅ |
| 18 | Full flow | ✓ | ✓ | Adhérant créé | ✅ |
| 19 | PWD hashing | - | ✓ | bcrypt hash | ✅ |
| 20 | Responsive | ✓ | - | Mobile OK | ✅ |

---

## 🚀 Résultats Attendus

**Frontend:**
- ✅ 100% des champs validés
- ✅ Messages d'erreur clairs
- ✅ UX intuitive
- ✅ Responsive OK
- ✅ Performance: < 100ms par validation

**Backend:**
- ✅ Tous les endpoints fonctionnels
- ✅ Validation complète
- ✅ Erreurs claires
- ✅ Hash bcrypt appliqué
- ✅ Adhérant auto-créé

**Sécurité:**
- ✅ Pas de mot de passe en clair
- ✅ Protection contre doublons
- ✅ Validation côté serveur
- ✅ Gestion d'erreurs robuste

---

**Date:** Décembre 2024  
**Version:** 1.0  
**Statut:** ✅ Prêt pour test

