# Investor Reporting Hub

Plateforme de reporting investisseurs pour bot de trading crypto/marchés. Interface professionnelle fintech avec rapports mensuels pédagogiques, digests hebdomadaires automatisés, journal de trades et intégration Discord.

**100% Gratuit** - Toutes les solutions utilisées sont gratuites.

## Solutions gratuites utilisées

| Service | Solution | Limite gratuite |
|---------|----------|-----------------|
| Base de données | [Neon PostgreSQL](https://neon.tech) | 500 MB |
| LLM / IA | [Groq](https://console.groq.com) | 30 req/min |
| Hébergement | [Vercel](https://vercel.com) | Illimité |
| Redis (optionnel) | [Upstash](https://upstash.com) | 10K req/jour |

---

## Guide de démarrage rapide (15 minutes)

### Étape 1 : Créer les comptes gratuits

1. **Neon** (base de données) : https://neon.tech
   - Créer un compte
   - Créer un projet "investor-reporting"
   - Copier la "Connection string"

2. **Groq** (IA gratuite) : https://console.groq.com
   - Créer un compte
   - Aller dans "API Keys"
   - Créer une clé et la copier

3. **Vercel** (hébergement) : https://vercel.com
   - Créer un compte avec GitHub

### Étape 2 : Cloner et configurer

```bash
# Cloner le projet
git clone https://github.com/Torkor29/REPORTING_WENBOT.git
cd REPORTING_WENBOT

# Installer les dépendances
npm install

# Copier le fichier de configuration
cp .env.example .env
```

### Étape 3 : Configurer le fichier .env

Ouvrir `.env` et remplir :

```env
# Neon PostgreSQL - Coller la connection string de Neon
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/investor_reporting?sslmode=require"

# NextAuth - Générer un secret
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="copier-le-resultat-de-openssl-rand-base64-32"

# Groq - Coller la clé API
GROQ_API_KEY="gsk_votre_cle_api"
```

Pour générer le secret :
```bash
openssl rand -base64 32
```

### Étape 4 : Initialiser la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Créer les tables dans Neon
npm run db:push

# Charger les données de démo
npm run db:seed
```

### Étape 5 : Lancer l'application

```bash
npm run dev
```

Ouvrir http://localhost:3000

### Comptes de démo

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@example.com | admin123 | Admin |
| editor@example.com | editor123 | Editor |
| viewer@example.com | viewer123 | Viewer |

---

## Déploiement sur Vercel (Gratuit)

### Option 1 : Déploiement automatique

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Torkor29/REPORTING_WENBOT)

### Option 2 : Déploiement manuel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Configurer les variables d'environnement
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add GROQ_API_KEY

# Redéployer avec les variables
vercel --prod
```

Après déploiement, tu obtiens une URL comme : `https://ton-projet.vercel.app`

---

## Fonctionnalités

### Dashboard
- KPIs clés : Performance MTD/YTD, drawdown max, win rate
- Graphiques interactifs (équité, drawdown)
- Timeline des événements récents
- Points de vigilance

### Weekly Digest
- Synthèse automatisée (Macro, Crypto, Géopolitique)
- Impact sur le bot et ajustements
- Sources citées avec liens
- Format optimisé pour Discord

### Monthly Report
- Résumé exécutif avec performance détaillée
- Contexte de marché complet
- Décisions du bot expliquées
- FAQ et glossaire

### Trade Journal
- Liste des trades avec P&L
- Notes et captures d'écran
- Import CSV
- Filtres avancés

### Éditeur
- Création d'articles manuels
- Workflow Draft → Review → Published
- Support Markdown

### Admin Console
- Gestion utilisateurs et rôles
- Configuration sources RSS/API
- Templates prompts LLM
- Configuration Discord

---

## Intégration Discord

### Configurer le webhook

1. Discord > Paramètres serveur > Intégrations > Webhooks
2. Créer un webhook
3. Copier l'URL
4. Coller dans Admin > Discord ou dans `.env`

```env
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
```

### Partager un rapport

1. Ouvrir le Weekly Digest ou Monthly Report
2. Cliquer sur l'icône Discord
3. Le rapport est formaté et envoyé automatiquement

---

## Pipeline IA (Groq - Gratuit)

L'application utilise **Groq** avec le modèle **Llama 3.1 70B** (gratuit, 30 req/min).

### Architecture

```
Sources RSS/API
      ↓
┌─────────────┐
│  Collector  │  Récupère les articles
└─────────────┘
      ↓
┌─────────────┐
│   Ranker    │  Note pertinence (1-10)
└─────────────┘
      ↓
┌─────────────┐
│  Clusterer  │  Groupe par événement
└─────────────┘
      ↓
┌─────────────┐
│   Writer    │  Génère le digest
└─────────────┘
```

### Lancer le pipeline manuellement

Dans l'Admin ou via API :
```bash
curl -X POST https://ton-app.vercel.app/api/pipeline/weekly \
  -H "Cookie: next-auth.session-token=..."
```

---

## Import de trades

### Format CSV supporté

```csv
date,pair,side,entryPrice,exitPrice,size,pnl,fees
2024-01-15T10:30:00Z,BTC/USDT,LONG,42000,43500,0.5,750,-15
2024-01-16T14:00:00Z,ETH/USDT,SHORT,2200,2100,5,500,-10
```

### Importer

1. Aller dans Journal
2. Cliquer "Importer CSV"
3. Coller ou uploader le CSV
4. Valider

---

## Ajouter des sources d'actualités

1. Admin > Sources
2. Ajouter une source
3. Remplir :
   - **Nom** : ex. "CoinDesk"
   - **Type** : RSS
   - **URL** : URL du flux RSS
   - **Catégorie** : CRYPTO, MACRO, ou GEOPOLITICS

### Sources recommandées

**Crypto :**
- https://www.coindesk.com/arc/outboundfeeds/rss/
- https://cointelegraph.com/rss
- https://decrypt.co/feed

**Macro :**
- https://feeds.bloomberg.com/markets/news.rss
- https://www.ft.com/rss/home

---

## Structure du projet

```
src/
├── app/                    # Pages Next.js
│   ├── api/               # Routes API
│   ├── dashboard/         # Dashboard
│   ├── weekly-digest/     # Digest hebdo
│   ├── monthly-report/    # Rapport mensuel
│   ├── journal/           # Journal trades
│   ├── editor/            # Éditeur articles
│   └── admin/             # Console admin
├── components/
│   ├── ui/                # Composants UI
│   ├── charts/            # Graphiques
│   └── shared/            # Composants partagés
├── lib/
│   ├── actions/           # Server Actions
│   ├── agents/            # Pipeline IA
│   ├── auth/              # Authentification
│   └── db/                # Prisma client
└── types/                 # Types TypeScript
```

---

## Commandes utiles

```bash
# Développement
npm run dev              # Lancer le serveur
npm run db:studio        # Interface Prisma Studio
npm run typecheck        # Vérifier les types

# Base de données
npm run db:generate      # Générer le client
npm run db:push          # Appliquer le schéma
npm run db:seed          # Données de démo

# Production
npm run build            # Build
npm run start            # Démarrer
```

---

## FAQ

### L'IA ne répond pas ?
Vérifie que `GROQ_API_KEY` est bien configurée. Groq a une limite de 30 req/min.

### Erreur de base de données ?
1. Vérifie que `DATABASE_URL` est correcte
2. Lance `npm run db:push` pour créer les tables

### Comment changer le thème ?
Le thème sombre est par défaut. Tu peux basculer via le toggle dans la topbar.

### Comment ajouter un utilisateur ?
Admin > Users > Ajouter un utilisateur (rôle Admin/Editor/Viewer)

---

## Licence

Propriétaire - Tous droits réservés.
