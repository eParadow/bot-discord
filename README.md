# Bot Discord - Rappels CRON

Bot Discord en TypeScript permettant de programmer des rappels automatiques dans des channels avec des expressions CRON.

## Fonctionnalités

- Création de rappels avec des expressions CRON personnalisées
- Envoi automatique des messages dans les channels Discord
- Gestion complète via des slash commands (`/rappel`)
- Persistance des rappels en base SQLite
- Support multi-serveurs

## Prérequis

- Node.js 18+
- Un bot Discord avec les permissions nécessaires

## Installation

1. **Cloner le projet et installer les dépendances**

```bash
npm install
```

2. **Configurer les variables d'environnement**

Copier le fichier `.env.example` vers `.env` et remplir les valeurs :

```bash
cp .env.example .env
```

```env
DISCORD_TOKEN=votre_token_bot
CLIENT_ID=votre_client_id
```

3. **Créer le bot Discord**

   - Aller sur le [Discord Developer Portal](https://discord.com/developers/applications)
   - Créer une nouvelle application
   - Dans l'onglet "Bot", créer un bot et copier le token
   - Dans l'onglet "OAuth2" > "General", copier le Client ID
   - Dans l'onglet "OAuth2" > "URL Generator" :
     - Scopes: `bot`, `applications.commands`
     - Bot Permissions: `Send Messages`, `Manage Messages`
   - Utiliser l'URL générée pour inviter le bot sur votre serveur

4. **Déployer les commandes slash**

```bash
npm run deploy
```

5. **Lancer le bot**

```bash
# Mode développement (avec rechargement automatique)
npm run dev

# Mode production
npm run build
npm start
```

## Commandes

### `/rappel create`

Créer un nouveau rappel programmé.

| Option    | Type    | Requis | Description                                      |
|-----------|---------|--------|--------------------------------------------------|
| `message` | string  | Oui    | Le message à envoyer                             |
| `cron`    | string  | Oui    | Expression CRON (ex: `0 9 * * *`)                |
| `channel` | channel | Non    | Channel cible (défaut: channel actuel)           |

### `/rappel list`

Afficher la liste de tous les rappels du serveur.

### `/rappel delete`

Supprimer un rappel.

| Option | Type    | Requis | Description              |
|--------|---------|--------|--------------------------|
| `id`   | integer | Oui    | ID du rappel à supprimer |

### `/rappel info`

Afficher les détails d'un rappel.

| Option | Type    | Requis | Description    |
|--------|---------|--------|----------------|
| `id`   | integer | Oui    | ID du rappel   |

## Expressions CRON

Format : `minute heure jour_du_mois mois jour_de_la_semaine`

| Expression      | Description                          |
|-----------------|--------------------------------------|
| `0 9 * * *`     | Tous les jours à 9h00                |
| `0 9 * * 1-5`   | Du lundi au vendredi à 9h00          |
| `0 0 * * 1`     | Tous les lundis à minuit             |
| `*/30 * * * *`  | Toutes les 30 minutes                |
| `0 */2 * * *`   | Toutes les 2 heures                  |
| `0 9 1 * *`     | Le 1er de chaque mois à 9h00         |
| `0 9 * * 0`     | Tous les dimanches à 9h00            |

## Structure du projet

```
bot-discord/
├── src/
│   ├── index.ts              # Point d'entrée
│   ├── config.ts             # Configuration
│   ├── deploy-commands.ts    # Script de déploiement
│   ├── database/
│   │   ├── connection.ts     # Connexion SQLite
│   │   └── reminders.ts      # CRUD rappels
│   ├── commands/
│   │   └── reminder.ts       # Commandes /rappel
│   ├── scheduler/
│   │   └── cron.ts           # Gestionnaire CRON
│   └── types/
│       └── index.ts          # Types TypeScript
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts npm

| Script          | Description                              |
|-----------------|------------------------------------------|
| `npm run dev`   | Lancer en mode développement             |
| `npm run build` | Compiler le TypeScript                   |
| `npm start`     | Lancer en mode production                |
| `npm run deploy`| Déployer les commandes slash sur Discord |

## Déploiement Docker

### Docker Compose (local)

```bash
# Créer le fichier .env avec vos variables
cp .env.example .env

# Lancer le bot
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter le bot
docker-compose down
```

### Railway

1. **Connecter votre dépôt GitHub à Railway**
   - Aller sur [Railway](https://railway.app)
   - Créer un nouveau projet depuis GitHub
   - Sélectionner ce dépôt

2. **Configurer les variables d'environnement**
   
   Dans Railway, aller dans l'onglet "Variables" et ajouter :
   - `DISCORD_TOKEN` : Votre token de bot Discord
   - `CLIENT_ID` : L'ID client de votre application Discord

3. **Déployer les commandes slash**
   
   Avant le premier déploiement ou après modification des commandes, exécuter localement :
   ```bash
   npm run deploy
   ```

4. **Persistence des données**
   
   Railway utilise un système de fichiers éphémère. Pour persister la base SQLite, vous pouvez :
   - Utiliser un volume Railway (recommandé)
   - Migrer vers PostgreSQL (pour une meilleure scalabilité)

### Build Docker manuel

```bash
# Construire l'image
docker build -t discord-bot-rappels .

# Lancer le conteneur
docker run -d \
  --name discord-bot \
  -e DISCORD_TOKEN=votre_token \
  -e CLIENT_ID=votre_client_id \
  -v bot-data:/app/data \
  discord-bot-rappels
```

## Licence

ISC
