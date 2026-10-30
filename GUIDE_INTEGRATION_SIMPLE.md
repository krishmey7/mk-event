# Intégrer KibaWallet dans votre application

Guide court pour développeurs. Vous connectez **votre backend** à KibaWallet pour encaisser du **Mobile Money (USSD)** ou des **paiements par carte** en RDC, en **USD** ou **CDF**.

**API production :** `https://kibawallet-api.onrender.com`
**Dashboard marchand :** `https://www.kibawallet.com`

**Retraits (payout)** vers Mobile Money : voir [`GUIDE_INTEGRATION_PAYOUT.md`](./GUIDE_INTEGRATION_PAYOUT.md).

---

## En bref

1. Vous appelez `POST /v1/payments` depuis **votre serveur** (Mobile Money ou carte).
2. **Mobile Money** : le client reçoit un **USSD** et valide (ou refuse). **Carte** : vous redirigez le client vers `checkout_url`.
3. Vous apprenez le résultat via un **webhook** (recommandé) ou en **interrogeant** l’API.
4. Quand le statut est `SUCCEEDED`, vous livrez votre produit (commande, abonnement, crédits, etc.).

Toute l’intégration se fait via **l’API KibaWallet** (clés `pk_live_` / `sk_live_`). Aucun autre fournisseur à configurer de votre côté.

```
[Votre app] → [Votre backend] → KibaWallet API → Mobile Money (USSD) ou page carte KelPay
                  ↑________________ webhook (optionnel) ________________|
```

---

## Avant de commencer

| Étape | Qui ? |
|--------|--------|
| Compte marchand créé | Admin KibaWallet |
| Clés `pk_live_` + `sk_live_` | Dashboard → **Développeurs** |
| Secret webhook (optionnel) | Admin KibaWallet (`WEBHOOK_HMAC_SECRET`) |
| URL(s) HTTPS pour les webhooks | Vous — une ou plusieurs dans **Paramètres** (paiements **et** retraits sur les mêmes URLs) |

**Règle d’or :** les clés `sk_live_` restent **uniquement sur votre serveur**. Jamais dans l’app mobile, jamais dans le JavaScript du navigateur.

---

## Authentification

Chaque requête API envoie deux en-têtes :

```http
X-Kiba-Public-Key: pk_live_xxxxxxxx
Authorization: Bearer sk_live_xxxxxxxx
```

Test rapide :

```http
GET https://kibawallet-api.onrender.com/v1/me
```

Réponse OK si les clés sont valides et le compte **ACTIVE**.

---

## Étape 1 — Créer un paiement

```http
POST https://kibawallet-api.onrender.com/v1/payments
Content-Type: application/json
X-Kiba-Public-Key: pk_live_...
Authorization: Bearer sk_live_...

{
  "mobilenumber": "+243900000000",
  "amount": 10.00,
  "currency": "USD",
  "external_reference": "commande-2026-0042"
}
```

| Champ | Obligatoire | Note |
|--------|-------------|------|
| `mobilenumber` | Oui | MSISDN, ex. `+243…` ou `243…` |
| `amount` | Oui | Minimum **0,01** ; 2 décimales max (USD) |
| `external_reference` | Oui | **Votre** ID commande — unique par marchand |
| `currency` | Non | `USD` (défaut) ou `CDF` |
| `description` | — | **Non utilisé** (ignoré si envoyé ; Kelpay reçoit « Mayele paiement ») |

**Réponse typique (initiation acceptée) :**

```json
{
  "id": "cmp9k2my50001ng3l62vmwnjr",
  "reference": "KIBA7newbjkdMP9K2MY4d89ec3",
  "external_reference": "commande-2026-0042",
  "amount_gross": "10.00",
  "fee_platform": "0.60",
  "amount_net": "9.40",
  "currency": "USD",
  "status": "PENDING",
  "kelpay": { "code": "0", "description": "..." }
}
```

> Le champ `kelpay` contient la réponse technique de la passerelle — utile pour le support, pas obligatoire pour votre logique métier.

**Commission plateforme (nouveaux comptes)** : **6 %** du montant brut (ex. **10,00 USD** → frais **0,60 USD** → crédit wallet **9,40 USD**). Vérifiez votre taux via `GET /v1/me` → `platform_fee_percent`.

À ce stade, **ce n’est pas encore payé**. Le client doit confirmer l’USSD sur son téléphone.

### Paiement par carte (optionnel)

Même endpoint `POST /v1/payments`, avec `payment_method: "card"` :

```http
POST https://kibawallet-api.onrender.com/v1/payments
Content-Type: application/json
X-Kiba-Public-Key: pk_live_...
Authorization: Bearer sk_live_...

{
  "payment_method": "card",
  "amount": 10.00,
  "currency": "USD",
  "external_reference": "commande-2026-0043",
  "return_url": "https://votre-site.com/paiement/retour"
}
```

| Champ | Obligatoire | Note |
|--------|-------------|------|
| `payment_method` | Oui (carte) | `"card"` — sinon Mobile Money par défaut |
| `return_url` | Oui (carte) | URL **HTTPS** où le client revient après paiement sur la page KelPay |
| `mobilenumber` | Non (carte) | Ignoré pour la carte |
| `amount`, `external_reference`, `currency` | Oui | Identiques au flux Mobile Money |

**Réponse typique (carte) :**

```json
{
  "id": "cmp9k2my50001ng3l62vmwnjr",
  "reference": "KIBA7newbjkdMP9K2MY4d89ec3",
  "external_reference": "commande-2026-0043",
  "payment_method": "card",
  "amount_gross": "10.00",
  "fee_platform": "0.60",
  "amount_net": "9.40",
  "currency": "USD",
  "status": "PENDING",
  "checkout_url": "https://xxxxxxxxxxxxxxxxxxxxxxx.com",
  "kelpay": { "code": "0", "description": "payment request received", "checkouturl": "..." }
}
```

**Côté vous :** redirigez le navigateur du client vers **`checkout_url`** (HTTP 302 ou lien). Le résultat final arrive comme pour l’USSD : webhook `payment.success` / `payment.failed` ou `GET /v1/payments/{id}`.

> Ne livrez le service **qu’après** `status: "SUCCEEDED"`, pas au seul retour sur `return_url`.

---

## Étape 2 — Comprendre les statuts

| Statut | Signification | Action côté vous |
|--------|----------------|------------------|
| `PENDING` | USSD en cours, page carte non finalisée, ou callback pas encore reçu | Attendre |
| `SUCCEEDED` | Payé — wallet marchand crédité (net, **−6 %** commission — nouveaux comptes) | Livrer le service |
| `FAILED` | Refus, annulation ou erreur | Ne pas livrer |

Tant que le statut reste `PENDING`, considérez que le paiement **n’est pas finalisé**, même si l’appel `POST` a réussi.

---

## Étape 3 — Savoir quand c’est payé

### Option A — Webhook (recommandé)

1. Dashboard → **Paramètres** → ajoutez une ou plusieurs **URLs de webhook** (HTTPS, accessibles publiquement). Chaque événement est envoyé vers **toutes** les URLs enregistrées.
2. L’administrateur KibaWallet vous communique le secret **`WEBHOOK_HMAC_SECRET`** (variable d’environnement sur votre serveur, jamais dans le front).
3. KibaWallet envoie un **`POST`** avec un corps JSON et des en-têtes de signature.

#### Événements

| `event` | Quand l’utiliser côté vous |
|---------|----------------------------|
| `payment.success` | Paiement confirmé → livrer la commande / activer l’abonnement |
| `payment.failed` | Paiement refusé ou annulé → ne pas livrer |
| `withdrawal.success` / `withdrawal.failed` | Retraits payout — voir [`GUIDE_INTEGRATION_PAYOUT.md`](./GUIDE_INTEGRATION_PAYOUT.md) |

#### En-têtes HTTP

| En-tête | Description |
|---------|-------------|
| `Content-Type` | `application/json` |
| `X-Kiba-Signature` | HMAC-SHA256 du **corps brut** (chaîne hexadécimale) |
| `X-Kiba-Timestamp` | Horodatage Unix (secondes) — informatif en MVP |

#### Corps JSON — `payment.success`

```json
{
  "event": "payment.success",
  "data": {
    "transaction_id": "cmp9k2my50001ng3l62vmwnjr",
    "external_reference": "commande-2026-0042",
    "kelpay_reference": "KIBA7newbjkdMP9K2MY4d89ec3",
    "amount_gross": "10.00",
    "fee_platform": "0.60",
    "amount_net": "9.40",
    "currency": "USD"
  }
}
```

Utilisez surtout **`data.external_reference`** pour retrouver votre commande, et **`data.transaction_id`** comme ID KibaWallet.

#### Corps JSON — `payment.failed`

```json
{
  "event": "payment.failed",
  "data": {
    "transaction_id": "cmp9k2my50001ng3l62vmwnjr",
    "external_reference": "commande-2026-0042",
    "kelpay_reference": "KIBA7newbjkdMP9K2MY4d89ec3",
    "currency": "USD"
  }
}
```

#### Vérifier la signature (Node.js / Express)

La signature est calculée sur le **texte exact** du body reçu (avant `JSON.parse`). Si votre framework reformate le JSON, la vérification échouera.

```javascript
const crypto = require('crypto');

function verifyKibaSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'utf8'),
      Buffer.from(signatureHeader, 'utf8'),
    );
  } catch {
    return false; // longueurs différentes
  }
}

// Route dédiée : body brut obligatoire (pas express.json() sur cette route)
app.post(
  '/webhooks/kibawallet',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const rawBody = req.body.toString('utf8');
    const sig = req.headers['x-kiba-signature'];

    if (!verifyKibaSignature(rawBody, sig, process.env.KIBA_WEBHOOK_SECRET)) {
      return res.status(401).send('invalid signature');
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'payment.success') {
      const ref = event.data.external_reference;
      // TODO : marquer commande payée, idempotent (voir ci-dessous)
    } else if (event.event === 'payment.failed') {
      const ref = event.data.external_reference;
      // TODO : marquer commande échouée
    }

    return res.status(200).send('OK');
  },
);
```

**Python (aperçu)** : `hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()` puis comparer à `X-Kiba-Signature`.

#### Bonnes pratiques webhook

- Répondez **`200`** (ou `2xx`) **rapidement**, puis traitez en arrière-plan (file, queue, worker).
- Traitez chaque événement de façon **idempotente** : KibaWallet peut réessayer jusqu’à **3 fois** si votre URL ne répond pas `2xx` (délais ~1 s, ~2 s).
- Ne livrez le service métier **que** sur `payment.success`, jamais sur le seul `POST /v1/payments`.
- Consultez les **journaux webhook** : Dashboard → **Développeurs** (statut HTTP, erreurs).

### Option B — Polling (sans webhook)

```http
GET https://kibawallet-api.onrender.com/v1/payments/{id}
```

Répétez toutes les **15–30 secondes** pendant **2–3 minutes** après le `POST`, jusqu’à `SUCCEEDED` ou `FAILED`.

---

## Étape 4 — Autres appels utiles

| Besoin | Endpoint |
|--------|----------|
| Profil marchand (taux commission) | `GET /v1/me` |
| Liste des paiements | `GET /v1/payments` |
| Solde USD ou CDF | `GET /v1/wallet?currency=USD` |
| Tous les soldes | `GET /v1/wallets` |
| Retraits vers Mobile Money | `POST /v1/withdrawals` — voir [`GUIDE_INTEGRATION_PAYOUT.md`](./GUIDE_INTEGRATION_PAYOUT.md) |

Doc détaillée (webhooks, erreurs, exemples code) : [`API_INTEGRATION.md`](./API_INTEGRATION.md)
Aperçu OpenAPI (connecté au dashboard) : **Documentation API** dans le portail marchand.

---

## Exemple minimal (Node.js)

```javascript
const BASE = 'https://kibawallet-api.onrender.com';

function headers() {
  return {
    'Content-Type': 'application/json',
    'X-Kiba-Public-Key': process.env.KIBA_PK,
    Authorization: `Bearer ${process.env.KIBA_SK}`,
  };
}

async function createPayment({ phone, amount, orderId }) {
  const res = await fetch(`${BASE}/v1/payments`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      mobilenumber: phone,
      amount,
      currency: 'USD',
      external_reference: orderId,
      description: `Commande ${orderId}`,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { id, status: "PENDING", amount_gross, amount_net, ... }
}

async function waitForPayment(paymentId, maxAttempts = 12) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 15_000));
    const res = await fetch(`${BASE}/v1/payments/${paymentId}`, { headers: headers() });
    const p = await res.json();
    if (p.status !== 'PENDING') return p;
  }
  throw new Error('Timeout');
}
```

---

## Erreurs fréquentes

Toutes les réponses d’erreur HTTP viennent de **l’API KibaWallet**. Vous n’appelez jamais Kelpay directement.

| HTTP | `error` (si présent) | Cause probable | Action |
|------|----------------------|----------------|--------|
| `401` | — | Mauvaises clés ou compte suspendu | Vérifier `pk_live_` / `sk_live_` |
| `409` | — | `external_reference` déjà utilisée | Nouvelle référence unique |
| `400` | — | Validation (montant, `mobilenumber`, etc.) | Corriger le corps de requête |
| `400` | `initiation_rejected` | KibaWallet n’a pas pu lancer le paiement (refus passerelle) | Lire `details.code` / `details.description` |
| `503` | `kibawallet_unavailable` | Service temporairement indisponible | Réessayer ; contacter le support KibaWallet |

### Autres cas

| Problème | Cause probable |
|----------|----------------|
| Reste `PENDING` longtemps | Client n’a pas validé l’USSD, ou paiement carte abandonné |
| Webhook jamais reçu | URL non configurée, ou pas en HTTPS |
| Signature webhook invalide | Corps modifié avant vérif — utiliser le **raw body** |

---

## Checklist de mise en prod

- [ ] Clés en variables d’environnement (pas dans le code source)
- [ ] `external_reference` unique par commande
- [ ] Livraison métier **seulement** sur `SUCCEEDED` (webhook ou polling)
- [ ] URL webhook HTTPS + vérification de signature
- [ ] Logs / monitoring sur vos routes de paiement

---

## Besoin d’aide ?

- **Dashboard** : test manuel via **Test paiement** (compte marchand)
- **Journaux webhook** : Dashboard → **Développeurs**
- **Support plateforme** : contactez l’administrateur de votre compte KibaWallet
