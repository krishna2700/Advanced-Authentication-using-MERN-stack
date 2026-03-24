# Authentification Avancée avec la Stack MERN

Une application full-stack d'authentification construite avec MongoDB, Express, React et Node.js, comprenant des capacités d'authentification avancées et un utilitaire Git Diff Tracker pour la gestion du flux de travail de développement.

## Fonctionnalités

### Système d'Authentification
- Inscription et connexion des utilisateurs
- Hachage sécurisé des mots de passe avec bcryptjs
- Authentification basée sur JWT avec cookies
- Intégration de base de données MongoDB
- Architecture API RESTful

### Git Diff Tracker
- **Préservation automatique** des diffs git (aucune intervention manuelle nécessaire)
- **Hooks Git** sauvegardent les diffs à chaque commit
- **Observateur en arrière-plan** sauvegarde automatiquement toutes les 5 minutes
- Accès CLI et API REST à l'historique des diffs
- Nettoyage automatique des anciens diffs
- Comparaison des changements à différents moments
- Export de l'historique des diffs en JSON

## Structure du Projet

```
.
├── backend/
│   ├── controllers/
│   │   └── auth.controller.js    # Logique d'authentification
│   ├── db/
│   │   └── connectDB.js          # Connexion MongoDB
│   ├── models/
│   │   └── user.model.js         # Schéma utilisateur
│   ├── routes/
│   │   ├── auth.route.js         # Points de terminaison d'auth
│   │   └── gitDiff.route.js      # Points de terminaison git diff
│   ├── utils/
│   │   ├── gitDiffTracker.js     # Logique principale de suivi des diffs
│   │   └── diffCli.js            # Interface CLI
│   └── index.js                  # Point d'entrée du serveur
├── package.json
├── .gitignore
├── README.md
└── GIT_DIFF_TRACKER.md           # Documentation détaillée du git diff tracker
```

## Installation

1. Cloner le dépôt :
```bash
git clone <url-du-dépôt>
cd advanced-authentication-using-mern-stack
```

2. Installer les dépendances :
```bash
npm install
```

3. Créer un fichier `.env` à la racine du projet :
```env
PORT=5000
MONGO_URI=votre_chaîne_de_connexion_mongodb
JWT_SECRET=votre_clé_secrète_jwt

# Optionnel : Configurer l'observateur de diff (valeurs par défaut affichées)
DIFF_WATCH_ENABLED=true
DIFF_WATCH_INTERVAL=5
```

4. Démarrer le serveur de développement :
```bash
npm run dev
```

**Le Git Diff Tracker démarrera automatiquement et préservera vos changements !**

## Démarrage Rapide - Préservation des Diffs

Une fois le serveur lancé, vos diffs git sont automatiquement préservés via :

1. **Observateur automatique** - Sauvegarde toutes les 5 minutes
2. **Hooks Git** - Sauvegarde à chaque commit
3. **Sauvegardes manuelles** - Utilisez `npm run diff:save` à tout moment

### Récupérer les Diffs Perdus

```bash
# Voir votre dernier diff sauvegardé
npm run diff:last

# Voir tous les diffs récents
npm run diff:history

# Comparer actuel vs précédent
npm run diff:compare
```

Voir [DIFF_PRESERVATION_GUIDE.md](./DIFF_PRESERVATION_GUIDE.md) pour la documentation complète.

## Points de Terminaison API

### Routes d'Authentification (`/api/auth`)

Les points de terminaison d'authentification gèrent l'inscription, la connexion et la gestion des sessions utilisateur.

### Routes Git Diff (`/api/git-diff`)

#### `GET /api/git-diff/current`
Obtenir le diff git actuel (changements stagés et non stagés)

**Réponse :**
```json
{
  "success": true,
  "data": {
    "timestamp": "2026-02-28T17:00:00.000Z",
    "branch": "main",
    "lastCommit": "abc1234 Message de commit",
    "stagedDiff": "...",
    "unstagedDiff": "...",
    "combinedDiff": "..."
  }
}
```

#### `POST /api/git-diff/save`
Sauvegarder le diff git actuel dans l'historique

**Corps de la requête :**
```json
{
  "taskId": "task-123"  // optionnel
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Diff sauvegardé avec succès",
  "filepath": "/chemin/vers/diff/sauvegardé.json"
}
```

#### `GET /api/git-diff/history?limit=10`
Obtenir l'historique des diffs (par défaut : 10 entrées les plus récentes)

**Réponse :**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

#### `GET /api/git-diff/last`
Obtenir le diff le plus récemment sauvegardé

**Réponse :**
```json
{
  "success": true,
  "data": {
    "timestamp": "...",
    "branch": "...",
    "lastCommit": "...",
    "stagedDiff": "...",
    "unstagedDiff": "..."
  }
}
```

#### `GET /api/git-diff/compare`
Comparer le diff actuel avec le diff sauvegardé précédent

**Réponse :**
```json
{
  "success": true,
  "data": {
    "current": {...},
    "previous": {...},
    "timeDifference": 123456
  }
}
```

#### `GET /api/git-diff/export?path=./export.json`
Exporter tout l'historique des diffs vers un fichier JSON

**Réponse :**
```json
{
  "success": true,
  "message": "Historique exporté",
  "filepath": "./export.json"
}
```

## CLI Git Diff Tracker

Le Git Diff Tracker inclut une interface en ligne de commande pour un accès rapide à l'historique des diffs.

### Commandes CLI

```bash
# Sauvegarder le diff actuel
node backend/utils/diffCli.js save

# Sauvegarder le diff avec un ID de tâche
node backend/utils/diffCli.js save task-123

# Afficher le diff actuel
node backend/utils/diffCli.js current

# Afficher l'historique des diffs (par défaut : 10 entrées)
node backend/utils/diffCli.js history

# Afficher plus d'historique
node backend/utils/diffCli.js history 20

# Afficher le dernier diff sauvegardé
node backend/utils/diffCli.js last

# Comparer le diff actuel et précédent
node backend/utils/diffCli.js compare

# Exporter l'historique en JSON
node backend/utils/diffCli.js export ./mes-diffs.json
```

### Cas d'Utilisation

**Avant de terminer une tâche :**
```bash
node backend/utils/diffCli.js save avant-refactoring
```

**Après avoir fait des changements :**
```bash
node backend/utils/diffCli.js compare
```

**Examiner ce qui a changé :**
```bash
node backend/utils/diffCli.js last
```

## Utilisation Programmatique

Vous pouvez également utiliser le Git Diff Tracker de manière programmatique dans votre code Node.js :

```javascript
import gitDiffTracker from './backend/utils/gitDiffTracker.js';

// Obtenir le diff actuel
const current = await gitDiffTracker.getCurrentDiff();

// Sauvegarder le diff actuel
const filepath = await gitDiffTracker.saveDiff('ma-tâche');

// Obtenir l'historique
const history = await gitDiffTracker.getDiffHistory(10);

// Obtenir le dernier diff
const last = await gitDiffTracker.getLastDiff();

// Comparer avec le précédent
const comparison = await gitDiffTracker.compareWithPrevious();

// Exporter l'historique
await gitDiffTracker.exportDiffHistory('./export.json');
```

## Technologies Utilisées

### Backend
- **Node.js** - Environnement d'exécution
- **Express.js** - Framework d'application web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - Modélisation d'objets MongoDB
- **bcryptjs** - Hachage de mots de passe
- **jsonwebtoken** - Authentification JWT
- **cookie-parser** - Analyse des cookies
- **dotenv** - Variables d'environnement
- **mailtrap** - Intégration de service d'email

### Développement
- **nodemon** - Rechargement automatique pendant le développement

## Stockage et Gestion des Données

### Données d'Authentification
- Les identifiants utilisateur sont stockés dans MongoDB
- Les mots de passe sont hachés avec bcryptjs
- Les JWT sont utilisés pour la gestion des sessions

### Historique Git Diff
- Les diffs sont stockés dans `.git/diff-history/`
- Maximum 50 diffs sont conservés (nettoyage automatique)
- Les fichiers sont nommés : `diff-{timestamp}-task-{taskId}.json`
- Le répertoire est exclu de git via `.gitignore`

## Flux de Travail de Développement

1. Démarrer le serveur de développement :
```bash
npm run dev
```

2. Le serveur s'exécutera sur le port spécifié dans votre fichier `.env`

3. Utiliser les points de terminaison d'authentification pour la gestion des utilisateurs

4. Utiliser le git diff tracker pour préserver l'historique des changements pendant le développement

## Variables d'Environnement

Créer un fichier `.env` avec les variables suivantes :

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/auth-db
JWT_SECRET=votre-clé-secrète-ici
```

## Avantages du Git Diff Tracker

1. **Aucun Changement Perdu** - Toujours avoir accès aux diffs précédents
2. **Suivi des Changements** - Suivre ce qui a changé entre les tâches
3. **Débogage** - Identifier quand des changements spécifiques ont été effectués
4. **Historique** - Examiner la progression du travail au fil du temps
5. **Récupération** - Récupérer les informations perdues si le diff disparaît

## Configuration Avancée

### Taille d'Historique Personnalisée

Modifier `maxHistorySize` dans `backend/utils/gitDiffTracker.js` :

```javascript
constructor() {
  this.maxHistorySize = 100; // Conserver 100 diffs au lieu de 50
}
```

### Intégration de Hook Git

Ajouter à `.git/hooks/pre-commit` :

```bash
#!/bin/bash
node backend/utils/diffCli.js save "pre-commit-$(date +%s)"
```

Rendre exécutable :
```bash
chmod +x .git/hooks/pre-commit
```

## Dépannage

### Problèmes d'Authentification
- Assurez-vous que MongoDB est en cours d'exécution et accessible
- Vérifiez que le fichier `.env` contient les identifiants corrects
- Vérifiez que JWT_SECRET est défini

### Problèmes du Git Diff Tracker

**Aucun diff sauvegardé ?**
- Assurez-vous d'être dans un dépôt git
- Vérifiez que git est installé et accessible

**Impossible d'accéder à l'historique ?**
- Vérifiez que le répertoire `.git/diff-history/` existe
- Vérifiez les permissions des fichiers

**Trop d'anciens diffs ?**
- Le tracker conserve automatiquement seulement les 50 derniers
- Vous pouvez nettoyer manuellement : `rm -rf .git/diff-history/*`

## Licence

ISC

## Documentation Additionnelle

- **[DIFF_PRESERVATION_GUIDE.md](./DIFF_PRESERVATION_GUIDE.md)** - Guide complet pour la préservation automatique des diffs (commencez ici !)
- **[GIT_DIFF_TRACKER.md](./GIT_DIFF_TRACKER.md)** - Référence API et détails du Git Diff Tracker

## Contribution

Ce projet fait partie d'un système d'authentification avancé. Les contributions doivent maintenir les standards de sécurité et suivre la structure de code existante.
