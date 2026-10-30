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
| GET | `/api/admin/wallet/?page=1` | JWT admin / superuser |
| POST | `/api/admin/wallet/withdrawals/` | JWT admin / superuser |
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

### Portefeuille administrateur et retraits

- Dans Django admin, le superuser configure `payout_share_percent` pour les
  comptes de rôle `admin` et les superusers. La somme configurée ne peut pas
  dépasser 100 %.
- À la confirmation d’un paiement KibaWallet, l’API enregistre `amount_net`
  et fige les parts de chaque compte actif. Les anciennes transactions sans
  `amount_net` ne génèrent pas de crédit rétroactif.
- La page Profil n’affiche le portefeuille qu’aux administrateurs et aux
  superusers. Un admin voit uniquement ses propres parts et retraits ; le
  superuser voit aussi les paiements entrants et les soldes de tous les
  administrateurs.
- Les retraits USD/CDF sont versés au numéro Mobile Money saisi par le compte.
  Le solde disponible inclut les retraits en attente et les frais KibaWallet
  de 1 %. Seul un webhook signé `withdrawal.success` ou `withdrawal.failed`
  finalise le retrait ou libère la réservation.
- Le webhook public doit être configuré dans le dashboard KibaWallet vers
  `POST /api/payments/kibawallet/webhook/`; le même secret HMAC traite les
  paiements et les retraits.

### Export et conservation des données

- L’organisateur peut exporter depuis la gestion d’un événement une archive
  JSON privée contenant l’événement, les invités, les tables, les RSVP, le
  livre d’or, les références média et l’historique de paiement, ainsi qu’une
  liste CSV des invités.
- À partir de 60 jours après la date de l’événement, la commande de rétention
  envoie un préavis. L’événement n’est éligible à la suppression qu’après
  90 jours révolus et au moins 30 jours après l’envoi réussi du préavis.
- Les données événementielles comprennent la liste et les coordonnées des
  invités, les réponses, le livre d’or, les tables, le contenu de l’invitation
  et ses médias. Les médias stockés sous `events/{id}/` sont également supprimés.
- Les événements avec un paiement en attente sont exclus jusqu’à sa résolution.
- Les lignes financières terminées de plus d’un an sont supprimées après
  agrégation des soldes de portefeuille. Cette agrégation conserve le solde
  calculable, mais pas le détail historique supprimé.
- Il n’y a pas d’ordonnanceur configuré : toutes les commandes sont manuelles.
  Depuis `backend/`, commencer par la prévisualisation sans option destructive :

  ```bash
  uv run python manage.py process_data_retention
  ```

- Après vérification, envoyer les préavis :

  ```bash
  uv run python manage.py process_data_retention --send-notices
  ```

- Une purge est une action irréversible. Avant de l’exécuter, confirmer la
  configuration du stockage, vérifier la prévisualisation, et choisir un dossier
  d’export privé, protégé et sauvegardé. La commande refuse d’écraser une archive
  existante :

  ```bash
  uv run python manage.py process_data_retention --purge --confirm --export-dir <dossier-prive-securise>
  ```

- Les préavis nécessitent `RESEND_API_KEY`. La commande de purge exporte les
  données événementielles en JSON et les fichiers média en dossier associé
  avant suppression. L’export depuis l’application contient les références des
  médias, pas leur contenu binaire. Les archives contiennent des données
  personnelles et ne doivent pas être placées dans le dépôt Git, un dossier
  public ou un espace non contrôlé.

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
