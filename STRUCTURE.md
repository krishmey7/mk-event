# MK Events — Architecture du projet

MK Events est une application de création et de gestion d’invitations numériques.
Le dépôt contient le frontend Expo, l’API Django et la configuration de déploiement.

## Architecture

- **Frontend** : React Native, Expo SDK 54, Expo Router et TypeScript. Les routes
  sont déclarées dans `app/`; les écrans et composants métier sont dans `src/`.
- **API** : Django REST Framework avec authentification JWT, dans `backend/`.
  Les domaines de comptes et d’événements sont séparés dans `backend/accounts/`
  et `backend/events/`.
- **Production** : frontend sur Vercel (`dist/`), API sur Render, PostgreSQL
  externe via `DATABASE_URL`, et stockage de médias compatible S3 configuré
  par variables d’environnement.

## Parcours principaux

- **Public** : page d’accueil, modèles, pages légales et invitations publiées.
- **Compte** : inscription, connexion par e-mail ou téléphone, connexion Google
  si elle est configurée, et réinitialisation du mot de passe.
- **Organisateur** : configuration du profil, création et édition d’événements,
  gestion des invités, RSVP, tables, médias, check-in et livre d’or.
- **Publication et paiement** : publication gratuite en mode vitrine ou paiement
  KibaWallet en USD à 0,50 $ par lien invité. Les crédits sont confirmés par
  webhook signé ; les liens individuels consomment les crédits disponibles.
- **Administration** : portefeuille KibaWallet accessible aux comptes admin et
  superuser, avec gains, soldes et demandes de retrait.

## Répertoires à connaître

```text
app/                         Routes Expo Router
src/components/              Composants d’interface partagés
src/context/                 Session, événement actif et thème
src/features/                Écrans et logique organisés par domaine
src/services/                Client API et services frontend
src/types/                   Contrats TypeScript de l’API
backend/accounts/            Authentification, utilisateurs et parts admin
backend/events/              Événements, invités, paiements et retraits
backend/config/              Configuration Django et routes racine
public/                      Shell web, manifeste PWA et ressources SEO
scripts/deploy-vercel.js     Préparation et déploiement Vercel
render.yaml                  Blueprint de déploiement API Render
```

## Contrats et configuration

- L’API utilise les champs `snake_case`, les dates ISO 8601 et la pagination DRF.
- Le frontend consomme l’API à travers `src/services/apiClient.ts`. L’URL est
  configurée par `EXPO_PUBLIC_API_URL`.
- Les secrets KibaWallet, Django, Resend, Google OAuth, base de données et
  stockage doivent rester dans l’environnement backend ou l’hébergeur, jamais
  dans le bundle frontend.
- Pour préparer un futur domaine web, `MK_EVENT_SITE_URL` se configure dans le
  `.env` à la racine ; les détails figurent dans `README.md`.
- Les invitations personnelles et les écrans authentifiés ne doivent pas être
  considérés comme des pages publiques indexables.

## Commandes de développement et validation

Depuis la racine :

```bash
npm run web
npm run typecheck
npm run build:web
npm run deploy:web
```

Depuis `backend/` :

```bash
uv sync
uv run python manage.py migrate
uv run python manage.py test
uv run python manage.py check
```

`npm run deploy:web` est une action de production. Vérifier l’état Git et les
variables d’environnement avant de l’utiliser. Ne jamais exécuter `seed_demo`
en production : il crée un compte de démonstration avec un mot de passe fixe.
