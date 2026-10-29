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
| POST | `/api/events/{id}/publish/` | JWT |
| POST | `/api/events/{id}/media/` | JWT (multipart `file`) |
| GET/POST | `/api/events/{id}/guests/` | JWT |
| PATCH/DELETE | `/api/events/{id}/guests/{id}/` | JWT |
| POST | `/api/events/{id}/guests/{id}/check-in/` | JWT |
| GET/POST | `/api/events/{id}/tables/` | JWT |
| GET | `/api/inv/{slug}/?guest=<access_token>` | public |
| POST | `/api/inv/{slug}/rsvp/` | public |

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
5. Seed démo (optionnel, une fois) : `python manage.py seed_demo`.

### Vercel (front)

1. Root du projet = racine du repo (pas `backend/`)
2. `vercel.json` à la racine : build `npm run build:web`, output `dist`
3. Variable : `EXPO_PUBLIC_API_URL=https://<votre-api>.onrender.com/api`
