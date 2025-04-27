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

3. Créez un fichier `.env.local` à partir du modèle
```bash
cp .env.example .env.local
```

4. Modifiez le fichier `.env.local` avec vos propres valeurs:
```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
# ... autres variables
```

5. Lancez le serveur de développement
```bash
pnpm dev
```

6. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur

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