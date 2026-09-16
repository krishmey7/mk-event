# MK Event — Architecture & Arborescence

SaaS haut de gamme de gestion d'événements et d'invitations numériques interactives.
**Frontend :** React Native + Expo (Expo Router v6, Reanimated, Ionicons) — iOS, Android, Web.
**Backend (à venir) :** Django REST Framework (JWT) — le frontend est conçu pour consommer des API REST (`src/services/`, types dans `src/types/`).

## Arborescence cible

```
mk-event/
├── app/                          # EXPO ROUTER — l'arborescence de fichiers = navigation
│   ├── _layout.tsx               # ✅ Root layout (Stack, StatusBar, futurs providers)
│   ├── index.tsx                 # ✅ Landing (Dark Luxury) — placeholder étape 1
│   ├── onboarding.tsx            # Diaporama 3 étapes (maquettes 1→3)
│   ├── (auth)/
│   │   ├── login.tsx             # Connexion (email/téléphone + Google/Apple)
│   │   └── register.tsx          # Inscription
│   ├── (app)/                    # Espace organisateur authentifié (groupe protégé)
│   │   ├── _layout.tsx           # Tabs mobile (Accueil, Invitations, Modèles, Profil) / Sidebar desktop
│   │   ├── index.tsx             # Tableau de bord (stats RSVP, progression, accès rapide)
│   │   ├── invitations/
│   │   │   ├── index.tsx         # Mes invitations
│   │   │   ├── new.tsx           # Création — stepper : Modèle → Personnalisation → Invités → Finalisation
│   │   │   ├── [id]/edit.tsx     # Outil de modification (Texte, Couleurs, Images, Éléments)
│   │   │   ├── [id]/preview.tsx  # Aperçu de l'invitation (compte à rebours J-42)
│   │   │   └── [id]/share.tsx    # Partage du lien + suivi des invités
│   │   ├── guests/               # Invités & RSVP (liste, import, filtres)
│   │   ├── tables/               # Tables & plans de salle
│   │   └── settings.tsx
│   └── inv/[slug]/               # ESPACE INVITÉ (public, sans auth) : mkevent.app/inv/{slug}
│       ├── index.tsx             # Invitation reçue (QR, Voir l'invitation)
│       ├── rsvp.tsx              # Confirmer ma présence (Oui/Non/Peut-être, adultes/enfants)
│       └── index.tabs.tsx        # QR code, plan, playlist, cadeaux, e-bar, photos, livre d'or
├── src/
│   ├── components/               # UI génériques réutilisables (Button, Card, Badge, Input, Stepper…)
│   │   ├── ui/                   # Atomes & molécules
│   │   └── layout/               # Container responsive, Sidebar, TabBar, Header
│   ├── features/                 # Modules métier (un dossier par domaine : écrans + hooks + logique)
│   │   ├── auth/  events/  invitations/  guests/  rsvp/  guest-experience/
│   ├── services/                 # Couche API REST Django
│   │   ├── apiClient.ts          # fetch wrapper : base URL, JWT access/refresh, gestion erreurs
│   │   ├── auth.service.ts       # login, register, refresh
│   │   ├── events.service.ts     # CRUD événements + publication
│   │   ├── templates.service.ts  # catalogue des modèles
│   │   └── guests.service.ts     # invités, import, RSVP
│   ├── hooks/                    # useTheme, useBreakpoint, useDebounce, useRsvpSummary…
│   ├── constants/                # ✅ theme.ts (design system), config API, labels
│   ├── types/                    # ✅ index.ts (contrat de données Django, strict TypeScript)
│   ├── utils/                    # formatage dates FR, troncature, slug…
│   └── store/                    # État global léger (Context/Zustand) : auth, thème
├── assets/                       # Icônes, splash (à fournir)
├── app.json  tsconfig.json  package.json  STRUCTURE.md
└── Maquette 1.png / Maquette 2.png
```

## Conventions

1. **Zéro crash text node** — toute chaîne (même ponctuation/emoji) vit dans un `<Text>`.
2. **Compat web & mobile** — pas de `calc()` dans les styles ; ombres via `shadows.*` (`Platform.select` : `boxShadow` web / `elevation` natif) ; layouts flexibles.
3. **Responsive** — mobile = flux vertical ; ≥768px (tablet) et ≥1200px (desktop) = sidebar + grilles multi-colonnes (`breakpoints` + `getBreakpoint`).
4. **Imports** — alias `@/*` → `src/*` (app/ et src/).
5. **API** — modèles snake_case (DRF), dates ISO 8601, listes paginées `{ count, next, previous, results }`. Écrans toujours préparés pour les 3 états : chargement / erreur / vide.

## Roadmap

- **✅ Étape 1 — Fondations** : scaffolding Expo Router, `theme.ts`, `types/index.ts`.
- **Étape 2 — Design System UI** : Button, Card, Badge, Input, Header + hook `useTheme` + polices (Playfair Display, Inter via expo-font).
- **Étape 3 — Auth & Navigation** : onboarding, login, inscription, groupe protégé `(app)`.
- **Étape 4 — Organisateur** : tableau de bord, création d'invitation (stepper 4 étapes), éditeur, aperçu, partage.
- **Étape 5 — Invités & RSVP** : liste, import, statuts, notifications.
- **Étape 6 — Expérience invité** : invitation publique, RSVP, plan, playlist, cadeaux, QR, e-bar, photos, livre d'or.
- **Étape 7 — Intégration API Django** : `apiClient`, services, cache d'état.
