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

## Production (Railway + Vercel)

Préparation locale déjà faite : `Procfile`, `railway.toml`, `DATABASE_URL` optionnel dans `settings.py`.

### Railway (API)

1. Créer un service pointant sur le dossier `backend/`
2. Ajouter l’addon Postgres (injecte `DATABASE_URL`)
3. Variables d’environnement (voir `.env.example`) :
   - `DJANGO_DEBUG=false`
   - `DJANGO_SECRET_KEY=…`
   - `DJANGO_ALLOWED_HOSTS=.up.railway.app`
   - `CORS_ALLOWED_ORIGINS=https://votre-app.vercel.app`
   - `PUBLIC_BASE_URL=https://<votre-api>.up.railway.app`
4. **Volume** : monter un volume Railway sur le dossier `media/` du service
   (chemin conteneur typique `/app/media`) pour persister les photos
   d’invitation hors Postgres.
5. Le démarrage exécute `migrate` + `collectstatic` + `gunicorn`
6. Seed démo (optionnel, une fois) :
   `railway run python manage.py seed_demo`

### Vercel (front)

1. Root du projet = racine du repo (pas `backend/`)
2. `vercel.json` à la racine : build `npm run build:web`, output `dist`
3. Variable : `EXPO_PUBLIC_API_URL=https://<votre-api>.up.railway.app/api`
