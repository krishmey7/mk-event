# MK Events API (Django + DRF + JWT)

## Démarrage

```bash
cd backend
uv sync
uv run python manage.py migrate
uv run python manage.py seed_demo
uv run python manage.py runserver
```

API : `http://127.0.0.1:8000/api/`

Compte démo :
- e-mail : `sarah@mkevent.app`
- mot de passe : `mk-event-2026`

## Endpoints principaux

| Méthode | URL | Auth |
|---------|-----|------|
| POST | `/api/auth/register/` | public |
| POST | `/api/auth/login/` | public (`identifier` + `password`) |
| GET | `/api/auth/me/` | JWT |
| GET/POST | `/api/events/` | JWT |
| GET/PATCH | `/api/events/{id}/` | JWT |
| POST | `/api/events/{id}/prepare/` | JWT (enregistre le brouillon, sans publication) |
| POST | `/api/events/{id}/publish/` | JWT (`free_publication: true` pour une vitrine gratuite) |
| POST | `/api/events/{id}/media/` | JWT (multipart `file`) |
| POST | `/api/events/{id}/pay/` | JWT (Mobile Money ou carte, 0,50 $ par lien) |
| GET | `/api/events/{id}/payment-status/` | JWT |
| GET/POST | `/api/events/{id}/guests/` | JWT |
| PATCH/DELETE | `/api/events/{id}/guests/{id}/` | JWT |
| POST | `/api/events/{id}/guests/{id}/check-in/` | JWT |
| POST | `/api/events/{id}/guests/{id}/grant-link/` | JWT (consomme un crédit payé) |
| GET/POST | `/api/events/{id}/tables/` | JWT |
| POST | `/api/payments/kibawallet/webhook/` | signature HMAC `X-Kiba-Signature` |
| GET | `/api/inv/{slug}/?guest=<access_token>` | public |
| POST | `/api/inv/{slug}/rsvp/` | public |

### Cycle de paiement des liens invités

- Une publication gratuite utilise `POST /events/{id}/publish/` avec
  `{"free_publication": true}` : la page publique est visible, mais les
  invités n’ont pas de lien personnel ni d’accès RSVP individuel.
- Pour une publication payante, le front enregistre d’abord le brouillon avec
  `POST /events/{id}/prepare/`, puis initie le paiement avec
  `guest_quota`, `payment_method` et, pour Mobile Money, `mobilenumber`.
- Le statut reste en attente jusqu’au webhook KibaWallet signé. Un succès publie
  le brouillon et attribue les crédits aux invités sans lien ; les crédits
  restants peuvent être consommés plus tard avec `grant-link`.
- Configurez `KIBA_PUBLIC_KEY`, `KIBA_SECRET_KEY` et `KIBA_WEBHOOK_SECRET`
  côté serveur. La signature HMAC SHA-256 porte sur le corps HTTP JSON brut.
  Le navigateur ne reçoit jamais les clés secrètes.
- Les paiements en attente bloquent une nouvelle initiation pour éviter les
  doubles débits. En cas de callback manquant, réconciliez le paiement avec
  KibaWallet avant toute intervention manuelle.

## Front Expo

Dans `src/constants/config.ts` :

```ts
export const SIMULATE_BACKEND = false;
```

Et éventuellement `.env.local` :

```
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Sur appareil physique, utiliser l’IP LAN de la machine (ex. `http://192.168.x.x:8000/api`).

## Production (Render + Vercel)

Le blueprint est à la racine : `render.yaml` (service `mk-event-api`, `rootDir: backend`).
La base Postgres est externe (Supabase) → `DATABASE_URL` à renseigner.

### Render (API)

1. Dashboard Render → **New → Blueprint** → repo `krishmey7/mk-event`.
2. Variables d’environnement (voir `.env.example`) :
   - `DJANGO_DEBUG=false`
   - `DJANGO_SECRET_KEY=…`
   - `DJANGO_ALLOWED_HOSTS=.onrender.com`
   - `CORS_ALLOWED_ORIGINS=https://mk-event-five.vercel.app`
   - `CORS_ALLOWED_ORIGIN_REGEXES=^https://mk-event-[a-z0-9-]+\.vercel\.app$` (previews Vercel)
   - `PUBLIC_BASE_URL=https://<votre-api>.onrender.com`
   - `DATABASE_URL=postgresql://…` (Supabase)
3. **Stockage média** : le plan free n’a pas de disque. Configurer un bucket
   **public** compatible S3 (`AWS_STORAGE_BUCKET_NAME`, `AWS_S3_ENDPOINT_URL`,
   `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_CUSTOM_DOMAIN`,
   `AWS_QUERYSTRING_AUTH=false`). Voir `.env.example` pour Supabase Storage,
   AWS S3, R2 et MinIO. Sans bucket, les uploads sont perdus à chaque
   redéploiement.
4. Le build exécute `collectstatic` + `migrate`, puis `gunicorn`.
5. Configurez `KIBA_PUBLIC_KEY`, `KIBA_SECRET_KEY` et `KIBA_WEBHOOK_SECRET`
   dans les variables Render avant d’activer les paiements.
6. `seed_demo` est réservé au développement : son compte de démonstration a
   un mot de passe fixe, ne l’exécutez pas en production.

### Vercel (front)

1. Root du projet = racine du repo (pas `backend/`)
2. `vercel.json` à la racine : build `npm run build:web`, output `dist`
3. Variable : `EXPO_PUBLIC_API_URL=https://<votre-api>.onrender.com/api`
