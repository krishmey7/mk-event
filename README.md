# MK Events

Application SaaS haut de gamme de gestion d'événements et d'**invitations numériques interactives** — iOS, Android & Web.

## Stack

- **Frontend :** React Native · Expo (SDK 54) · Expo Router · TypeScript strict · Reanimated
- **Backend :** Django REST Framework · API REST authentifiée par JWT (`backend/`)
- **Design :** Quiet luxury 2026 — papier ivoire, encre chaude, champagne mat, Fraunces + Inter — `src/constants/theme.ts`

## Démarrage

```bash
npm install
npm run web      # web / desktop
npm run ios      # iOS (Simulateur ou Expo Go)
npm run android  # Android (Émulateur ou Expo Go)
npm run typecheck
```

> Les icônes et polices du design system (Playfair Display, Inter) seront branchées à l'étape « Design System UI ».

## Domaine et SEO web

Le SEO de la page d'accueil (URL canonique, données structurées, `robots.txt` et `sitemap.xml`) utilise par défaut le domaine Vercel du projet. Quand un domaine personnalisé sera configuré dans Vercel, renseigner dans le fichier `.env` **à la racine** :

```env
MK_EVENT_SITE_URL=https://votre-domaine.com
```

La commande `npm run deploy:web` appliquera cette URL aux ressources SEO du déploiement. Fournir l'origine HTTPS seulement, sans chemin, paramètres ni barre oblique finale. Ne pas mettre cette variable dans `backend/.env` et ne pas la confondre avec une clé secrète. Il faudra également rattacher le domaine au projet dans Vercel ; la présence du sitemap ne garantit pas à elle seule l'indexation par les moteurs de recherche.

## Documentation

- `STRUCTURE.md` — arborescence Expo Router, conventions & roadmap
- `src/types/index.ts` — contrat de données (prêt pour Django REST Framework)
- `src/constants/theme.ts` — design system complet (couleurs, typographie, espacements, ombres, breakpoints)
