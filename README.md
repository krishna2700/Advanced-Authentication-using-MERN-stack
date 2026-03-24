# Authentification avancée avec la pile MERN

Application d’authentification full‑stack construite avec MongoDB, Express, React et Node.js, incluant des capacités avancées d’authentification utilisateur et un utilitaire Git Diff Tracker pour la gestion du flux de travail.

## Fonctionnalités

### Système d’authentification
- Inscription et connexion des utilisateurs
- Hachage sécurisé des mots de passe avec bcryptjs
- Authentification JWT avec cookies
- Intégration MongoDB
- API RESTful

### Git Diff Tracker
- **Préservation automatique** des diffs git (sans intervention manuelle)
- **Hooks git** enregistrant les diffs à chaque commit
- **Surveillance en arrière‑plan** toutes les 5 minutes
- Accès CLI et API REST à l’historique des diffs
- Nettoyage automatique des anciens diffs
- Comparaison des changements à différents moments
- Export de l’historique au format JSON

## Structure du projet

```
.
├── backend/
│   ├── controllers/
│   │   └── auth.controller.js    # Logique d’authentification
│   ├── db/
│   │   └── connectDB.js          # Connexion MongoDB
│   ├── models/
│   │   └── user.model.js         # Schéma utilisateur
│   ├── routes/
│   │   ├── auth.route.js         # Endpoints auth
│   │   └── gitDiff.route.js      # Endpoints git diff
│   ├── utils/
│   │   ├── gitDiffTracker.js     # Logique de suivi des diffs
│   │   └── diffCli.js            # Interface CLI
│   └── index.js                  # Point d’entrée serveur
├── package.json
├── .gitignore
├── README.md
└── GIT_DIFF_TRACKER.md           # Documentation détaillée
```

## Installation

1. Cloner le dépôt :
```bash
git clone <repository-url>
cd advanced-authentication-using-mern-stack
```

2. Installer les dépendances :
```bash
npm install
```

3. Créer un fichier `.env` à la racine :
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Optionnel : configuration du watcher (valeurs par défaut)
DIFF_WATCH_ENABLED=true
DIFF_WATCH_INTERVAL=5
```

4. Démarrer le serveur de développement :
```bash
npm run dev
```

**Le Git Diff Tracker démarre automatiquement et préserve vos changements !**

## Démarrage rapide – Préservation des diffs

Une fois le serveur lancé, vos diffs git sont automatiquement préservés via :

1. **Watcher automatique** – Sauvegarde toutes les 5 minutes
2. **Hooks git** – Sauvegarde à chaque commit
3. **Sauvegardes manuelles** – Utilisez `npm run diff:save` à tout moment

### Récupérer des diffs perdus

```bash
# Voir le dernier diff sauvegardé
npm run diff:last

# Voir l’historique récent
npm run diff:history

# Comparer le diff courant au précédent
npm run diff:compare
```

Voir [DIFF_PRESERVATION_GUIDE.md](./DIFF_PRESERVATION_GUIDE.md) pour la documentation complète.

## Endpoints API

### Routes d’authentification (`/api/auth`)

Les endpoints d’authentification gèrent l’inscription, la connexion et les sessions.

### Routes Git Diff (`/api/git-diff`)

#### `GET /api/git-diff/current`
Récupère le diff git courant (changements stagés et non stagés)

**Réponse :**
```json
{
  "success": true,
  "data": {
    "timestamp": "2026-02-28T17:00:00.000Z",
    "branch": "main",
    "lastCommit": "abc1234 Commit message",
    "stagedDiff": "...",
    "unstagedDiff": "...",
    "combinedDiff": "..."
  }
}
```

#### `POST /api/git-diff/save`
Sauvegarde le diff git courant dans l’historique

**Corps de requête :**
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
  "filepath": "/path/to/saved/diff.json"
}
```

#### `GET /api/git-diff/history?limit=10`
Récupère l’historique (par défaut : 10 entrées)

**Réponse :**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

#### `GET /api/git-diff/last`
Récupère le dernier diff sauvegardé

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
Compare le diff courant avec le précédent

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
Exporte tout l’historique au format JSON

**Réponse :**
```json
{
  "success": true,
  "message": "Historique exporté",
  "filepath": "./export.json"
}
```

## CLI Git Diff Tracker

Le Git Diff Tracker inclut une interface en ligne de commande pour accéder rapidement à l’historique.

### Commandes CLI

```bash
# Sauvegarder le diff courant
node backend/utils/diffCli.js save

# Sauvegarder avec un task ID
node backend/utils/diffCli.js save task-123

# Afficher le diff courant
node backend/utils/diffCli.js current

# Afficher l’historique (10 entrées par défaut)
node backend/utils/diffCli.js history

# Afficher plus d’entrées
node backend/utils/diffCli.js history 20

# Afficher le dernier diff
node backend/utils/diffCli.js last

# Comparer le diff courant et le précédent
node backend/utils/diffCli.js compare

# Exporter l’historique en JSON
node backend/utils/diffCli.js export ./my-diffs.json
```

### Cas d’usage

**Avant de terminer une tâche :**
```bash
node backend/utils/diffCli.js save before-refactor
```

**Après les modifications :**
```bash
node backend/utils/diffCli.js compare
```

**Revoir ce qui a changé :**
```bash
node backend/utils/diffCli.js last
```

## Utilisation programmatique

Vous pouvez aussi utiliser le Git Diff Tracker dans votre code Node.js :

```javascript
import gitDiffTracker from './backend/utils/gitDiffTracker.js';

// Obtenir le diff courant
const current = await gitDiffTracker.getCurrentDiff();

// Sauvegarder le diff courant
const filepath = await gitDiffTracker.saveDiff('my-task');

// Obtenir l’historique
const history = await gitDiffTracker.getDiffHistory(10);

// Obtenir le dernier diff
const last = await gitDiffTracker.getLastDiff();

// Comparer avec le précédent
const comparison = await gitDiffTracker.compareWithPrevious();

// Exporter l’historique
await gitDiffTracker.exportDiffHistory('./export.json');
```

## Technologies utilisées

### Backend
- **Node.js** – Environnement d’exécution
- **Express.js** – Framework web
- **MongoDB** – Base de données NoSQL
- **Mongoose** – ODM MongoDB
- **bcryptjs** – Hachage des mots de passe
- **jsonwebtoken** – Authentification JWT
- **cookie-parser** – Gestion des cookies
- **dotenv** – Variables d’environnement
- **mailtrap** – Service d’email

### Développement
- **nodemon** – Rechargement automatique

## Stockage et gestion des données

### Données d’authentification
- Les identifiants sont stockés dans MongoDB
- Les mots de passe sont hachés avec bcryptjs
- Les JWT gèrent les sessions

### Historique Git Diff
- Les diffs sont stockés dans `.git/diff-history/`
- Maximum 50 diffs conservés (nettoyage automatique)
- Nommage : `diff-{timestamp}-task-{taskId}.json`
- Répertoire ignoré par git via `.gitignore`

## Flux de travail de développement

1. Démarrer le serveur :
```bash
npm run dev
```

2. Le serveur tourne sur le port défini dans `.env`

3. Utiliser les endpoints d’authentification

4. Utiliser le Git Diff Tracker pour préserver l’historique

## Variables d’environnement

Créer un fichier `.env` avec :

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/auth-db
JWT_SECRET=your-secret-key-here
```

## Avantages du Git Diff Tracker

1. **Aucune perte de changements** – Accès aux diffs précédents
2. **Suivi des changements** – Suivre les modifications par tâche
3. **Débogage** – Identifier quand une modification a été faite
4. **Historique** – Revoir la progression dans le temps
5. **Récupération** – Retrouver une information perdue

## Configuration avancée

### Taille d’historique personnalisée

Modifier `maxHistorySize` dans `backend/utils/gitDiffTracker.js` :

```javascript
constructor() {
  this.maxHistorySize = 100; // Conserver 100 diffs au lieu de 50
}
```

### Intégration de hook git

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

### Problèmes d’authentification
- Vérifier que MongoDB est en cours d’exécution
- Vérifier les credentials dans `.env`
- Vérifier que JWT_SECRET est défini

### Problèmes Git Diff Tracker

**Aucun diff sauvegardé ?**
- Vérifier que vous êtes dans un dépôt git
- Vérifier que git est installé et accessible

**Impossible d’accéder à l’historique ?**
- Vérifier que le dossier `.git/diff-history/` existe
- Vérifier les permissions

**Trop d’anciens diffs ?**
- Le tracker conserve automatiquement les 50 derniers
- Nettoyage manuel : `rm -rf .git/diff-history/*`

## Licence

ISC

## Documentation supplémentaire

- **[DIFF_PRESERVATION_GUIDE.md](./DIFF_PRESERVATION_GUIDE.md)** – Guide complet (commencez ici !)
- **[GIT_DIFF_TRACKER.md](./GIT_DIFF_TRACKER.md)** – Référence API et détails

## Contribution

Ce projet fait partie d’un système d’authentification avancé. Les contributions doivent maintenir les standards de sécurité et respecter la structure existante du code.
