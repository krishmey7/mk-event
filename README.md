# MK Event

Application SaaS haut de gamme de gestion d'événements et d'**invitations numériques interactives** — iOS, Android & Web.

## Stack

- **Frontend :** React Native · Expo (SDK 54) · Expo Router · TypeScript strict · Reanimated
- **Backend (à venir) :** Django REST Framework (JWT)
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

## Documentation

- `STRUCTURE.md` — arborescence Expo Router, conventions & roadmap
- `src/types/index.ts` — contrat de données (prêt pour Django REST Framework)
- `src/constants/theme.ts` — design system complet (couleurs, typographie, espacements, ombres, breakpoints)
