# CLAUDE.md — MK Event (Monorepo)

> Fichier de directives permanentes pour travailler sur ce projet en toute sécurité.
> Dossier local `e:\Logiciels\MK event` = référence. Ne jamais le remplacer par une version GitHub.

## 1. Architecture Monorepo

- **Frontend Expo Router SDK 54** : `app/` (navigation fichier Expo Router) + `src/` (components, features, services, constants, types, utils, store) + `assets/` + `scripts/` + `app.json` + `package.json` + `vercel.json`.
- **Backend Django DRF** : `backend/` (config/settings.py, urls.py, wsgi + apps `accounts/`, `events/`) + `backend/pyproject.toml` (requires-python >=3.12, install via `uv`) + `render.yaml` (racine) + `backend/.env.example`.
- **Dépôt unique** : `origin https://github.com/krishmey7/mk-event.git`, branche `main`. Frontend déployé sur **Vercel**, backend sur **Render**.

## 2. Commandes clés

### Frontend (racine)
- `npm run start` — dev Expo (web/mobile)
- `npm run typecheck` — `tsc --noEmit`
- `npm run build:web` — `expo export -p web --clear && workbox generateSW`
- `npm run deploy:web` — `node scripts/deploy-vercel.js` (build dist/ → staging `deploy-web-*` → rename `assets/node_modules` vers `assets/nm` → `vercel link --project mk-event --scope mk-events` → `vercel deploy --prod --force --archive=tgz`)

### Backend (dossier `backend/`)
- `uv sync` — installation dépendances
- `uv run python manage.py migrate` — migrations
- `uv run python manage.py runserver` — API locale `http://127.0.0.1:8000/api/`
- `uv run python manage.py test` — tests Django
- `uv run python manage.py seed_demo` — seed démo (compte `sarah@mkevent.app`)

## 3. Règles impératives

1. **Contrat d'API snake_case** : respecter `src/types/index.ts` (champs snake_case, dates ISO 8601, pagination DRF `{count,next,previous,results}`). Toute évolution backend/frontend doit rester compatible.
2. **Vars `EXPO_PUBLIC_*` pour la PWA** : `EXPO_PUBLIC_API_URL` (base API, prod `https://<api-render>/api`), `EXPO_PUBLIC_GOOGLE_CLIENT_ID` (vide = bouton Google désactivé), `EXPO_PUBLIC_INVITE_BASE` (base liens invités, défaut `window.location.origin` ou `https://mkevent.app`). Ne jamais hardcoder les URLs prod. `scripts/deploy-vercel.js` charge `.env` via `dotenv` (dépendance `dotenv` obligatoire).
3. **Toujours vérifier l'état Git avant toute action lourde** : `git status --short`, `git branch --show-current`, `git log --oneline -n 5`, `git remote -v` (sans fetch/pull sauf autorisation). Ne jamais `reset --hard`, changer de branche, `push --force`, déployer ou migrer la BDD sans autorisation explicite.
4. **Secrets** : `.env` racine et `backend/.env` ignorés par Git. Ne jamais les committer ni les afficher. Référence : `backend/.env.example` (Django, Supabase, Resend, Google OAuth + stockage S3-compatible).
5. **Déploiements** : Vercel depuis `dist/` (output `dist`, rewrites vers `/index.html`), Render depuis `backend/` (`render.yaml` : build `uv sync` + `collectstatic` + `migrate`, start `gunicorn`). Le plan free n'a pas de disque : les médias vont dans un bucket S3-compatible (`AWS_*`), jamais sur le filesystem.
