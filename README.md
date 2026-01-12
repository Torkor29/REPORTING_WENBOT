# Investor Reporting Hub

Plateforme de reporting investisseurs pour bot de trading crypto/marchés. Interface professionnelle fintech avec rapports mensuels pédagogiques, digests hebdomadaires automatisés, journal de trades et intégration Discord.

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Installation locale](#installation-locale)
- [Configuration](#configuration)
- [Gestion des sources](#gestion-des-sources)
- [Connexion aux données de marché](#connexion-aux-données-de-marché)
- [Intégration Discord](#intégration-discord)
- [Pipeline multi-agents](#pipeline-multi-agents)
- [Stratégie anti-doublons](#stratégie-anti-doublons)
- [Tests](#tests)
- [Déploiement](#déploiement)

## Fonctionnalités

### Dashboard
- KPIs clés : Performance MTD/YTD, drawdown max, Sharpe ratio, win rate
- Graphiques interactifs (équité, drawdown, volatilité)
- Timeline des événements récents
- Points de vigilance et watch list

### Weekly Digest
- Synthèse automatisée de l'actualité (Macro, Crypto, Géopolitique)
- Impact sur le bot et ajustements
- Sources citées avec liens
- Format optimisé pour partage Discord

### Monthly Report
- Résumé exécutif avec performance détaillée
- Contexte de marché complet
- Décisions du bot expliquées
- FAQ et glossaire intégrés

### Trade Journal
- Liste exhaustive des trades avec P&L
- Notes et captures d'écran par trade
- Import CSV pour données externes
- Filtres avancés

### Éditeur
- Création d'articles manuels
- Workflow Draft → Review → Published
- Support Markdown complet
- Prévisualisation temps réel

### Admin Console
- Gestion des utilisateurs et rôles (Admin/Editor/Viewer)
- Configuration des sources RSS/API
- Planification des jobs automatisés
- Templates de prompts pour agents LLM
- Configuration webhooks Discord

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Pages d'authentification
│   ├── admin/             # Console d'administration
│   ├── api/               # Routes API
│   ├── dashboard/         # Dashboard principal
│   ├── editor/            # Éditeur d'articles
│   ├── journal/           # Journal de trades
│   ├── monthly-report/    # Rapport mensuel
│   └── weekly-digest/     # Digest hebdomadaire
├── components/
│   ├── charts/            # Graphiques Recharts
│   ├── layout/            # Layout (Sidebar, Topbar)
│   ├── shared/            # Composants partagés
│   └── ui/                # Composants UI (shadcn-style)
├── lib/
│   ├── agents/            # Pipeline multi-agents LLM
│   ├── auth/              # Configuration NextAuth
│   ├── db/                # Client Prisma
│   ├── jobs/              # Workers BullMQ
│   └── utils/             # Utilitaires
└── types/                 # Types TypeScript
```

## Installation locale

### Prérequis

- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### 1. Cloner le repository

```bash
git clone <repository-url>
cd REPORTING_WENBOT
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'environnement

```bash
cp .env.example .env
```

Modifier `.env` avec vos valeurs :

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/investor_reporting?schema=public"

# Redis pour BullMQ
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-de-32-caracteres-minimum"

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# OpenAI pour les agents LLM
OPENAI_API_KEY="sk-..."

# S3 pour le stockage (optionnel)
S3_ENDPOINT=""
S3_REGION="eu-west-1"
S3_ACCESS_KEY=""
S3_SECRET_KEY=""
S3_BUCKET="investor-reporting"

# Discord (optionnel)
DISCORD_WEBHOOK_URL=""
```

### 4. Initialiser la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Appliquer le schéma à la base de données
npm run db:push

# (Optionnel) Charger les données de démo
npm run db:seed
```

### 5. Lancer l'application

```bash
# Serveur de développement
npm run dev

# (Dans un autre terminal) Worker pour les jobs planifiés
npm run worker
```

L'application est accessible sur `http://localhost:3000`

### Comptes de démo (après seed)

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@example.com | admin123 | Admin |
| editor@example.com | editor123 | Editor |
| viewer@example.com | viewer123 | Viewer |

## Configuration

### Variables d'environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `DATABASE_URL` | URL de connexion PostgreSQL | Oui |
| `REDIS_HOST` | Hôte Redis | Oui |
| `REDIS_PORT` | Port Redis | Oui |
| `NEXTAUTH_URL` | URL de base de l'application | Oui |
| `NEXTAUTH_SECRET` | Secret pour les sessions | Oui |
| `OPENAI_API_KEY` | Clé API OpenAI | Oui |
| `GOOGLE_CLIENT_ID` | ID client Google OAuth | Non |
| `GOOGLE_CLIENT_SECRET` | Secret client Google OAuth | Non |
| `S3_*` | Configuration stockage S3 | Non |
| `DISCORD_WEBHOOK_URL` | Webhook Discord par défaut | Non |

### Contrôle d'accès

L'authentification supporte deux modes :

1. **Domaine autorisé** : Tous les emails d'un domaine peuvent s'inscrire
2. **Liste blanche** : Seuls les emails explicitement autorisés peuvent accéder

Configurable dans Admin > Users.

## Gestion des sources

### Ajouter une source RSS

1. Aller dans **Admin > Sources**
2. Cliquer sur **Ajouter une source**
3. Remplir :
   - **Nom** : Nom affiché (ex: "Bloomberg Markets")
   - **Type** : RSS
   - **URL** : URL du flux RSS
   - **Catégorie** : MACRO, CRYPTO, ou GEOPOLITICS
   - **Priorité** : 1-10 (10 = plus haute priorité)

### Ajouter une source API

Pour les APIs personnalisées :

1. **Type** : API
2. **URL** : Endpoint de l'API
3. **Config** : Configuration JSON

```json
{
  "headers": {
    "Authorization": "Bearer YOUR_API_KEY"
  },
  "params": {
    "limit": 50
  }
}
```

### Sources recommandées

**Macro/Économie :**
- Bloomberg RSS
- Reuters Business
- Financial Times
- WSJ Markets

**Crypto :**
- CoinDesk RSS
- The Block
- Decrypt
- Cointelegraph

**Géopolitique :**
- Reuters World
- AP News
- Foreign Policy

## Connexion aux données de marché

### API REST externe

Créez un endpoint dans `src/app/api/market-data/route.ts` :

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  // Exemple avec CoinGecko
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10'
  )
  const data = await response.json()

  return NextResponse.json(data)
}
```

### Intégration Binance

```typescript
// src/lib/market/binance.ts
import { prisma } from '@/lib/db'

export async function fetchBinanceData() {
  const response = await fetch(
    'https://api.binance.com/api/v3/ticker/24hr'
  )
  const tickers = await response.json()

  // Sauvegarder en base
  for (const ticker of tickers) {
    await prisma.marketData.upsert({
      where: { symbol: ticker.symbol },
      update: {
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.priceChangePercent),
        volume: parseFloat(ticker.volume),
        updatedAt: new Date()
      },
      create: {
        symbol: ticker.symbol,
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.priceChangePercent),
        volume: parseFloat(ticker.volume)
      }
    })
  }
}
```

### Import de trades (CSV)

Le journal de trades supporte l'import CSV avec le format :

```csv
date,pair,side,entryPrice,exitPrice,size,pnl,fees
2024-01-15T10:30:00Z,BTC/USDT,LONG,42000,43500,0.5,750,-15
2024-01-16T14:00:00Z,ETH/USDT,SHORT,2200,2100,5,500,-10
```

## Intégration Discord

### Configuration du Webhook

1. Dans Discord : Paramètres du serveur > Intégrations > Webhooks
2. Créer un nouveau webhook
3. Copier l'URL du webhook
4. Dans l'application : **Admin > Discord**
5. Coller l'URL et configurer les options

### Options de publication

- **Auto-post Weekly Digest** : Publication automatique chaque dimanche
- **Auto-post Monthly Report** : Publication automatique le 1er du mois
- **Mentions** : @everyone, @here, ou rôle personnalisé

### Format des messages

Le digest est formaté automatiquement pour Discord :

```markdown
# Weekly Digest - Semaine 02/2024

## Macro & Économie
• Fed maintient les taux, signaux dovish pour 2024
• Inflation US à 3.1%, sous les attentes

## Crypto
• Bitcoin ETF approuvé, afflux massif de capitaux
• Ethereum teste les $2,500

## Impact Bot
Exposition réduite de 15% suite à la volatilité...
```

### Publication manuelle

1. Ouvrir un digest ou rapport
2. Cliquer sur l'icône Discord
3. Prévisualiser le message
4. Confirmer l'envoi

## Pipeline multi-agents

### Architecture

```
Sources RSS/API
      │
      ▼
┌─────────────┐
│  Collector  │  Récupère les articles bruts
└─────────────┘
      │
      ▼
┌─────────────┐
│   Ranker    │  Note pertinence et impact (1-10)
└─────────────┘
      │
      ▼
┌─────────────┐
│  Clusterer  │  Groupe par événement (max 3-5 clusters)
└─────────────┘
      │
      ▼
┌─────────────┐
│   Writer    │  Génère le digest final
└─────────────┘
```

### Personnalisation des prompts

Dans **Admin > Prompts**, vous pouvez modifier les templates pour chaque agent :

**Variables disponibles :**
- `{{articles}}` : Liste des articles JSON
- `{{clusters}}` : Clusters d'événements
- `{{dateRange}}` : Période couverte
- `{{botContext}}` : Contexte du bot de trading

### Exécution manuelle

```bash
# Via l'API
curl -X POST http://localhost:3000/api/pipeline/weekly \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Stratégie anti-doublons

### Niveau 1 : URL unique

Chaque article est identifié par son URL. Le hash SHA-256 de l'URL sert de clé unique.

```typescript
// prisma/schema.prisma
model RawArticle {
  id        String   @id @default(cuid())
  urlHash   String   @unique  // SHA-256 de l'URL
  url       String
  // ...
}
```

### Niveau 2 : Déduplication sémantique

Le Clusterer agent détecte les articles similaires :

1. **Similarité de titre** : Levenshtein distance < 0.3
2. **Entités communes** : > 60% d'entités partagées
3. **Proximité temporelle** : < 24h entre publications

### Niveau 3 : Fusion intelligente

Les articles similaires sont fusionnés dans un EventCluster :

```typescript
model EventCluster {
  id          String       @id @default(cuid())
  title       String       // Titre synthétique
  articles    RawArticle[] // Articles sources
  confidence  Float        // Score de confiance du clustering
  // ...
}
```

### Niveau 4 : Cache Redis

```typescript
// Vérification avant traitement
const cacheKey = `article:${urlHash}`
const exists = await redis.exists(cacheKey)
if (exists) {
  return // Article déjà traité
}
await redis.setex(cacheKey, 86400 * 7, '1') // TTL 7 jours
```

## Tests

### Tests unitaires

```bash
# Installer les dépendances de test
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Lancer les tests
npm run test
```

### Test de la base de données

```bash
# Vérifier la connexion
npm run db:studio
```

### Test du pipeline

```bash
# Mode dry-run (sans écriture)
curl http://localhost:3000/api/pipeline/test
```

### Test Discord

```bash
# Envoyer un message test
curl -X POST http://localhost:3000/api/discord/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Test depuis Investor Reporting Hub"}'
```

### Vérification des types

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

## Déploiement

### Vercel (recommandé)

1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer

Note : Les workers BullMQ nécessitent un serveur séparé (pas serverless).

### Docker

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/investor_reporting
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis

  worker:
    build: .
    command: npm run worker
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/investor_reporting
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=investor_reporting
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

### Scripts de production

```bash
# Build
npm run build

# Migration production
npm run db:migrate

# Démarrer
npm start

# Worker (process séparé)
npm run worker
```

## Licence

Propriétaire - Tous droits réservés.
