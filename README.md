# StreamFlow

StreamFlow est une plateforme de streaming moderne développée avec Next.js, Firebase et Tailwind CSS. Cette application offre une expérience utilisateur fluide pour regarder des films et des séries avec des fonctionnalités premium pour les abonnés VIP.

## Fonctionnalités

- 🎬 Catalogue de films et séries
- 🔐 Authentification des utilisateurs
- 🌟 Contenu exclusif VIP
- 📱 Conception responsive et PWA
- 🎨 Interface utilisateur moderne et intuitive
- 👤 Espace administrateur pour la gestion du contenu
- 🔄 Mise à jour en temps réel des données

## Technologies utilisées

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styles**: Tailwind CSS, Radix UI
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Déploiement**: Vercel
- **PWA**: next-pwa

## Comment démarrer

### Prérequis

- Node.js (v18 ou plus)
- pnpm
- Un projet Firebase

### Configuration

1. Clonez ce dépôt
```bash
git clone https://github.com/votre-utilisateur/streamflow.git
cd streamflow
```

2. Installez les dépendances
```bash
pnpm install
```

3. Créez un fichier `.env.local` avec les variables d'environnement suivantes:
```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=xxx

# Firebase Admin (pour les routes API)
FIREBASE_ADMIN_CLIENT_EMAIL=xxx
FIREBASE_ADMIN_PRIVATE_KEY=xxx
FIREBASE_ADMIN_PROJECT_ID=xxx

# TMDB API (pour les données de films)
NEXT_PUBLIC_TMDB_API_KEY=xxx
TMDB_API_KEY=xxx

# Cloudinary (pour le stockage d'images)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxx
NEXT_PUBLIC_CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Lancez le serveur de développement
```bash
pnpm dev
```

5. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur

### Commandes disponibles

- `pnpm dev` - Lancer le serveur de développement
- `pnpm build` - Construire l'application pour la production
- `pnpm start` - Démarrer l'application construite
- `pnpm lint` - Lancer le linting

## Structure du projet

```
streamflow/
├── app/               # Routes de l'application (Next.js App Router)
├── components/        # Composants React réutilisables
├── hooks/             # Hooks React personnalisés
├── lib/               # Utilitaires, API et intégrations
├── public/            # Fichiers statiques
└── styles/            # Styles globaux
```

## Déploiement

L'application est configurée pour être déployée sur Vercel. Il suffit de connecter votre dépôt GitHub à Vercel et de configurer les variables d'environnement.

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## Licence

Ce projet est sous licence [MIT](LICENSE).