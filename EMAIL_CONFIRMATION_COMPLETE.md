# Système de Confirmation Email - Implémentation Complète

## 📋 Résumé
Système de confirmation d'email en deux étapes pour l'inscription des adhérants avec:
- ✅ Code de confirmation 6 chiffres
- ✅ Expiration 10 minutes
- ✅ Validation avant création du compte
- ✅ Téléphone de l'entreprise ajouté

---

## 🔄 Flux d'Inscription

### Étape 1 : Soumission du Formulaire Initial
**Frontend**: Register.js
```
Utilisateur remplit:
- Email
- Mot de passe (8+ caractères)
- Raison sociale
- Siège social
- Contact (email entreprise)
- Téléphone (NOUVEAU)
- Centre
↓
Clic "Envoyer Code"
```

**Frontend Service**: apiV2.js - authServiceV2
```javascript
sendConfirmationCode(email, raison_sociale)
POST /api/auth/send-confirmation-code
```

**Backend**: authControllerV2.js - `sendConfirmationCode()`
```
1. Valide email fourni
2. Génère code 6 chiffres
3. Définit expiration = NOW() + 10 minutes
4. Insère dans DB table: confirmation_codes
5. Envoie email HTML avec code
```

### Étape 2 : Vérification du Code
**Frontend**: Register.js - `handleCodeSubmit()`
```
Utilisateur reçoit email avec code
Entre le code dans le champ
Clic "Vérifier le Code"
↓
Envoie POST /api/auth/register-adherant-confirmed
```

**Backend**: authControllerV2.js - `registerAdherantConfirmed()`
```
1. Valide tous les champs (email, password, telephone, etc.)
2. Recherche code valide et non expiré:
   SELECT * FROM confirmation_codes 
   WHERE email = ? AND code = ? 
   AND is_used = false 
   AND expires_at > NOW()
3. Crée compte utilisateur (rôle: adhérant)
4. Crée profil adhérant avec téléphone
5. Marque code comme utilisé: UPDATE confirmation_codes SET is_used = true
```

---

## 💾 Schéma Base de Données

### Table: confirmation_codes (NOUVEAU)
```sql
CREATE TABLE confirmation_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  code VARCHAR(6) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  is_used BOOLEAN DEFAULT false,
  UNIQUE KEY unique_code (email, code)
);
```

### Table: adherants (MODIFIÉE)
Colonne `contact` renommée en champ distinct
```sql
-- contact: email de l'entreprise
-- telephone: téléphone (NOUVEAU)
```

---

## 📧 Configuration Email

### Service: Gmail SMTP
**Fichier**: backend/controllers/authControllerV2.js

Configuration nodemailer:
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### Variables d'Environnement
**Fichier**: `.env`
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Note**: Utiliser Gmail App Password (pas le mot de passe Gmail normal)

### Template Email
```
De: noreply@amit.com
Objet: Code de Confirmation AMIT - [CODE]
Contenu HTML:
- Titre: Bienvenue chez AMIT!
- Code: 6 chiffres (gras)
- Expiration: 10 minutes
- Nom entreprise: raison_sociale
```

---

## 🔐 Endpoints API

### 1. Envoyer Code de Confirmation
```
POST /api/auth/send-confirmation-code
Content-Type: application/json

{
  "email": "user@company.com",
  "raison_sociale": "Mon Entreprise SARL"
}

Response 200:
{ "message": "Confirmation code sent to email" }
```

### 2. Inscrire avec Code Confirmé
```
POST /api/auth/register-adherant-confirmed
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "SecurePass123",
  "raison_sociale": "Mon Entreprise SARL",
  "siege": "123 Rue de la Paix, Alger",
  "contact": "contact@company.com",
  "telephone": "021123456789",
  "centre_id": 1,
  "confirmationCode": "456789"
}

Response 201:
{ "message": "Account created successfully", "userId": 15 }
```

---

## 🔒 Validations

### Frontend
- ✅ Email format valide
- ✅ Mot de passe 8+ caractères
- ✅ Tous les champs remplis
- ✅ Téléphone non vide

### Backend
- ✅ Code non expiré (< 10 minutes)
- ✅ Code utilisé une fois seulement
- ✅ Email non déjà enregistré
- ✅ Centre_id valide
- ✅ Format email et mot de passe

---

## 📝 Fichiers Modifiés

### Frontend
- **Register.js**: Composant deux étapes avec champ téléphone
- **frontend/src/services/apiV2.js**: Méthodes sendConfirmationCode + registerAdherantWithCode

### Backend  
- **authControllerV2.js**: Ajout `sendConfirmationCode()` + `registerAdherantConfirmed()`
- **db/init.js**: Table confirmation_codes
- **routes/apiV2.js**: Routes /send-confirmation-code et /register-adherant-confirmed

---

## ✅ Checklist Déploiement

- [ ] Redémarrer backend (npm start)
- [ ] Vérifier table confirmation_codes créée
- [ ] Configurer EMAIL_USER et EMAIL_PASSWORD dans .env
- [ ] Tester inscription avec email valide
- [ ] Vérifier email reçu avec code
- [ ] Tester vérification code correct
- [ ] Tester rejet code expiré (> 10 min)
- [ ] Vérifier compte créé dans DB
- [ ] Tester login avec nouveau compte

---

## 🧪 Identifiants de Test

**Après création adhérant:**
```
Email: newuser@company.com
Password: SecurePass123
Rôle: adhérant
Centre: 1 (défaut)
```

---

## 🐛 Troubleshooting

### Email non reçu
1. Vérifier EMAIL_USER et EMAIL_PASSWORD dans .env
2. Vérifier Gmail App Password (pas mot de passe normal)
3. Vérifier logs backend: `Email sending error: ...`

### Code expiré
- Durée fixe: 10 minutes
- Solution: Demander nouveau code

### "Email already in use"
- Vérifier dans DB: SELECT * FROM users WHERE email = ?

### "Invalid confirmation code"
- Vérifier code n'a pas déjà été utilisé
- Vérifier expiration: expires_at > NOW()

