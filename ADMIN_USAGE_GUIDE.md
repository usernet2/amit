# Guide d'Utilisation du Module Admin

## 🎯 Objectif

Ce guide explique comment utiliser le module admin du système "Plateforme Adhérants".

## 👤 Accès Admin

### Créer un Compte Admin

1. **Via SQL (recommandé pour la première admin)**
```sql
INSERT INTO users (email, password, role, is_valid, created_at, updated_at) 
VALUES ('admin@example.com', '$2a$10/...hashed_password...', 'admin', true, NOW(), NOW());
```

2. **Via l'interface (si admin existe)**
   - Seul un admin peut enregistrer un autre admin
   - Modification manuelle requise dans la base de données

### Login

1. Accédez à `http://localhost:3000/login`
2. Entrez les identifiants admin
3. Vous êtes redirigé vers `/admin/dashboard`

## 📊 Dashboard Admin

Le dashboard affiche :
- 📚 **Formations** : Nombre total de formations
- 🏢 **Visites** : Nombre total de visites
- 🎓 **Sensibilisations** : Nombre de sessions
- 👥 **Participations** : Nombre d'inscriptions
- ⚠️ **Annulations** : Nombre d'activités annulées

Cliquez sur une carte pour naviguer vers la gestion correspondante.

## 🎓 Gestion des Formations

### Créer une Formation

1. Cliquez sur **+ Nouvelle Formation**
2. Remplissez les champs :
   - **Designation** * : Nom de la formation (ex: "React Avancé")
   - **Description** : Détails de la formation
3. Cliquez sur **Créer**

### Modifier une Formation

1. Cliquez sur **✏️ Modifier** sur la ligne de la formation
2. Modifiez les champs requis
3. Cliquez sur **Mettre à jour**

**Note:** Seules les formations actives peuvent être modifiées.

### Supprimer une Formation

1. Cliquez sur **🗑️ Supprimer**
2. Confirmez la suppression
3. La formation devient inactive (soft delete)
4. Toutes les participations associées sont annulées

## 🏢 Gestion des Visites

### Créer une Visite d'Entreprise

1. Cliquez sur **+ Nouvelle Visite**
2. Sélectionnez **Visite d'Entreprise**
3. Remplissez :
   - **ID Adhérant** * : ID de l'adhérant à visiter
   - **Date et Heure** * : Quand aura lieu la visite
4. Cliquez sur **Créer**

### Créer une Visite Systématique

1. Cliquez sur **+ Nouvelle Visite**
2. Sélectionnez **Visite Systématique**
3. Remplissez :
   - **ID Adhérant** * : ID de l'adhérant
   - **Date Début** * : Début de la période
   - **Date Fin** * : Fin de la période
4. Cliquez sur **Créer**

### Modifier une Visite

1. Cliquez sur **✏️** (bouton modifier)
2. Modifiez les dates/ID adhérant
3. Cliquez sur **Mettre à jour**

**Note:** Les visites annulées ne peuvent pas être modifiées directement. Utilisez la page "Annulations" pour les replanifier.

### Supprimer une Visite

1. Cliquez sur **🗑️** (bouton supprimer)
2. La visite est annulée (soft delete)

## 🎓 Gestion des Sensibilisations

### Créer une Sensibilisation

1. Cliquez sur **+ Nouvelle Sensibilisation**
2. Remplissez :
   - **Sujet** * : Thème de la sensibilisation
   - **Date** * : Quand aura lieu la session
   - **ID Adhérant** * : ID de l'adhérant concerné
3. Cliquez sur **Créer**

### Modifier/Supprimer

Même processus que les formations et visites.

## 👥 Gestion des Participations

### Créer une Participation

1. Cliquez sur **+ Nouvelle Participation**
2. Remplissez :
   - **ID Formation** * : ID de la formation
   - **ID Adhérant** * : ID de l'adhérant
   - **Date Début** * : Date de début de la formation
   - **Date Fin** * : Date de fin de la formation
3. Cliquez sur **Créer**

Le système empêche les doublons : un adhérant ne peut s'inscrire qu'une fois par formation.

### Modifier/Supprimer

Même processus que les autres ressources.

**Note:** Supprimer une participation annule l'inscription.

## ⚠️ Gestion des Annulations

### Vue d'Ensemble

La page "Annulations" affiche toutes les activités annulées :
- Formations annulées
- Participations annulées
- Visites d'entreprise annulées
- Visites systématiques annulées
- Sensibilisations annulées

Chaque section montre des statistiques et un bouton **🔄 Replanifier/Réactiver**.

### Replanifier une Visite Annulée

1. Allez dans **Gestion des Annulations**
2. Trouvez la visite dans la section appropriée
3. Cliquez sur **🔄 Replanifier**
4. Pour visite d'entreprise :
   - Modifiez la date/heure
   - Cliquez sur **Replanifier**
5. Pour visite systématique :
   - Modifiez les dates début et fin
   - Cliquez sur **Replanifier**

La visite est alors réactivée avec les nouvelles dates.

### Replanifier une Participation Annulée

1. Allez dans **Gestion des Annulations**
2. Trouvez la participation
3. Cliquez sur **🔄 Replanifier**
4. Modifiez les dates début et fin
5. Cliquez sur **Replanifier**

### Réactiver une Formation Annulée

1. Allez dans **Gestion des Annulations**
2. Trouvez la formation dans "Formations Annulées"
3. Cliquez sur **🔄 Réactiver**
4. La formation et toutes ses participations sont réactivées

**Note:** Réactiver une formation réactive aussi toutes ses participations.

## 🔐 Contrôle d'Accès

### Restrictions

- ❌ Les **adhérants** ne peuvent pas voir les pages admin
- ❌ Les **adhérants** ne peuvent pas accéder aux API admin
- ✅ Seuls les **admins** ont accès à `/admin/*`

### Vérification

Si un adhérant essaie d'accéder à une page admin, il est redirigé vers son dashboard personnel.

## 💡 Bonnes Pratiques

### Avant de Supprimer

1. Vérifiez les participations associées
2. Notifiez les adhérants concernés
3. Prévoyez une replanification si nécessaire

### Création de Participation

1. Assurez-vous que l'adhérant existe
2. Vérifiez que la formation est active
3. Évitez les dates qui chevauchent d'autres formations

### Gestion des Annulations

1. Replanifiez rapidement les activités annulées
2. Informez les adhérants des changements
3. Utilisez les notes pour documenter les raisons

## 🆘 Dépannage

### "ID Adhérant non trouvé"
- Vérifiez que l'ID de l'adhérant existe
- Utilisez un ID numérique valide

### "Adhérant déjà inscrit à cette formation"
- L'adhérant a déjà une participation active
- Supprimez l'ancienne participation d'abord

### "Formation non trouvée"
- Vérifiez que l'ID de la formation existe
- Les formations annulées ne peuvent pas être utilisées

### "Erreur lors de la sauvegarde"
- Vérifiez votre connexion Internet
- Vérifiez que le serveur backend est actif
- Vérifiez les logs du serveur pour les détails

## 📱 Conseils d'Utilisation

### Efficacité
- Utilisez les cartes du dashboard pour navigation rapide
- Les tables montrent le statut (Actif/Annulé) en couleur

### Statuts
- 🟢 **Actif** : L'activité est en cours
- 🔴 **Annulée** : L'activité a été supprimée (soft delete)

### Modification
- Les activités annulées affichent le bouton modifier désactivé
- Pour modifier une activité annulée, utilisez la replanification

## 📞 Support

Pour toute question ou problème :
1. Consultez la documentation technique : `ADMIN_MODULE.md`
2. Vérifiez les logs du serveur
3. Contactez l'équipe technique
