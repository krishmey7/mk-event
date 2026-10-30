# Intégrer les retraits (payout) KibaWallet via l’API

Guide court pour développeurs. Vous appelez **votre backend** pour envoyer des fonds du **wallet marchand** vers un compte **Mobile Money** en RDC (USD ou CDF), via la même stack KibaWallet.

**API production :** `https://kibawallet-api.onrender.com`
**Dashboard marchand :** `https://www.kibawallet.com`

> **Sans intégration API :** les retraits manuels se font dans le dashboard → **Retraits**. Ce guide s’adresse aux équipes qui automatisent les décaissements depuis leur serveur.

**Encaissements (paiements entrants) :** voir [`GUIDE_INTEGRATION_SIMPLE.md`](./GUIDE_INTEGRATION_SIMPLE.md).

---

## En bref

1. Vérifiez le **solde disponible** (`GET /v1/wallet`) — il doit couvrir **montant + 1 %** de frais retrait.
2. Appelez `POST /v1/withdrawals` depuis **votre serveur** (montant + compte Mobile Money du bénéficiaire).
3. Le montant est **réservé** sur le wallet tant que le retrait est `PENDING`.
4. KibaWallet traite le payout (Mobile Money) ; vous apprenez le résultat via **webhook** (recommandé) ou **polling** / `sync`.
5. Sur `SUCCEEDED`, les fonds sont définitivement débités ; sur `FAILED`, ils sont **restitués** au wallet.

```
[Wallet marchand] → POST /v1/withdrawals → traitement KibaWallet → Mobile Money bénéficiaire
                         ↑______________ webhook withdrawal.* ______________|
```

---

## Avant de commencer

| Étape | Qui ? |
|--------|--------|
| Compte marchand **ACTIVE** | Admin KibaWallet |
| Clés `pk_live_` + `sk_live_` | Dashboard → **Développeurs** |
| Solde suffisant sur la bonne devise | Encaissements déjà crédités (net commission) ; retrait = `amount` + **1 %** frais |
| Secret webhook (optionnel) | Admin KibaWallet (`WEBHOOK_HMAC_SECRET`) |
| URL(s) HTTPS webhook | Vous (**Paramètres** — une ou plusieurs URLs, mêmes événements que les paiements) |

**Règles importantes :**

- Les clés `sk_live_` restent **uniquement sur votre serveur**.
- Seul `account_type: "mobile"` est supporté (PayPal : non disponible).
- Les wallets **USD** et **CDF** sont **séparés** : un retrait en CDF prélève le wallet CDF uniquement.
- `external_reference` doit être **unique par marchand** (comme pour les paiements).

---

## Authentification

Identique aux paiements — deux en-têtes sur chaque requête :

```http
X-Kiba-Public-Key: pk_live_xxxxxxxx
Authorization: Bearer sk_live_xxxxxxxx
```

Test rapide :

```http
GET https://kibawallet-api.onrender.com/v1/me
```

---

## Étape 1 — Vérifier le solde

Avant un retrait, consultez le wallet de la devise concernée :

```http
GET https://kibawallet-api.onrender.com/v1/wallet?currency=USD
X-Kiba-Public-Key: pk_live_...
Authorization: Bearer sk_live_...
```

Réponse typique :

```json
{
  "balance": "42.50",
  "pending_balance": "10.00",
  "currency": "USD"
}
```

| Champ | Signification |
|--------|----------------|
| `balance` | Fonds **disponibles** pour un nouveau retrait |
| `pending_balance` | Montant déjà **réservé** pour des retraits `PENDING` |

Le `balance` doit être ≥ **`amount` + 1 %** (ex. retrait 1,00 USD → au moins **1,01 USD** disponibles). Formule : `amount_debited = amount × 1,01` (arrondi à 2 décimales).

Pour toutes les devises : `GET /v1/wallets`.

---

## Étape 2 — Créer un retrait

```http
POST https://kibawallet-api.onrender.com/v1/withdrawals
Content-Type: application/json
X-Kiba-Public-Key: pk_live_...
Authorization: Bearer sk_live_...

{
  "external_reference": "payout-2026-0042",
  "account_type": "mobile",
  "account": "+243900000000",
  "amount": 25.00,
  "currency": "USD",
  "description": "Versement partenaire"
}
```

| Champ | Obligatoire | Note |
|--------|-------------|------|
| `external_reference` | Oui | **Votre** ID unique (max 128 car.) |
| `account_type` | Oui | `"mobile"` uniquement |
| `account` | Oui | MSISDN bénéficiaire, ex. `+243…` ou `243…` |
| `amount` | Oui | Montant **envoyé au bénéficiaire** (minimum **1**, 2 décimales max) |
| `currency` | Non | `USD` (défaut) ou `CDF` |
| `description` | Non | Libellé optionnel (max 255 car.) |

**Réponse typique (initiation acceptée) :**

```json
{
  "id": "clxwithdrawal0001",
  "reference": "KIBW7newbjkdMP9K2MY4d89ec3",
  "external_reference": "payout-2026-0042",
  "status": "PENDING",
  "amount": "25.00",
  "fee_withdrawal": "0.25",
  "amount_debited": "25.25",
  "fee_withdrawal_percent": "1",
  "currency": "USD",
  "account_type": "mobile",
  "account": "243900000000",
  "gateway": { "code": "0", "description": "..." }
}
```

> Le champ `gateway` (ou `kelpay` sur d’anciennes réponses) contient la réponse technique de la passerelle — utile pour le support, pas obligatoire pour votre logique métier.

**Frais retrait** : **1 %** du montant `amount`, **en plus** du montant envoyé. Ex. retrait **25,00 USD** → frais **0,25 USD** → **25,25 USD** réservés sur le wallet ; le bénéficiaire reçoit **25,00 USD**.

Dès le `POST` réussi, le **total débité** (`amount` + frais) est **réservé** : `balance` diminue et `pending_balance` augmente. Le bénéficiaire reçoit le flux Mobile Money côté opérateur ; le statut final arrive ensuite.

---

## Étape 3 — Comprendre les statuts

| Statut | Signification | Wallet |
|--------|----------------|--------|
| `PENDING` | Payout en cours (passerelle / opérateur) | Montant **réservé** |
| `SUCCEEDED` | Fonds envoyés au bénéficiaire | Débit **confirmé** |
| `FAILED` | Refus, erreur ou annulation | Montant **restitué** au `balance` |

Ne considérez pas un retrait comme terminé tant que le statut n’est pas `SUCCEEDED` ou `FAILED`.

---

## Étape 4 — Savoir quand c’est finalisé

### Option A — Webhook (recommandé)

Mêmes URLs que pour les paiements : Dashboard → **Paramètres** → **Webhooks sortants** (plusieurs URLs possibles, ex. une par app).

| `event` | Quand l’utiliser |
|---------|------------------|
| `withdrawal.success` | Payout réussi — marquer votre versement comme effectué |
| `withdrawal.failed` | Échec — le wallet a été recrédité, ne pas renvoyer sans nouvelle référence |

En-têtes : `Content-Type`, `X-Kiba-Signature` (HMAC-SHA256 du **corps brut**), `X-Kiba-Timestamp` (informatif).

#### Corps JSON — `withdrawal.success`

```json
{
  "event": "withdrawal.success",
  "data": {
    "withdrawal_id": "clxwithdrawal0001",
    "external_reference": "payout-2026-0042",
    "kelpay_reference": "KIBW7newbjkdMP9K2MY4d89ec3",
    "amount": "25.00",
    "fee_withdrawal": "0.25",
    "amount_debited": "25.25",
    "currency": "USD",
    "account_type": "mobile",
    "account": "243900000000"
  }
}
```

#### Corps JSON — `withdrawal.failed`

```json
{
  "event": "withdrawal.failed",
  "data": {
    "withdrawal_id": "clxwithdrawal0001",
    "external_reference": "payout-2026-0042",
    "kelpay_reference": "KIBW7newbjkdMP9K2MY4d89ec3",
    "amount": "25.00",
    "fee_withdrawal": "0.25",
    "amount_debited": "25.25",
    "currency": "USD"
  }
}
```

Traitez les événements de façon **idempotente** (jusqu’à **3** nouvelles tentatives si votre URL ne répond pas `2xx`). Répondez **`200`** rapidement, puis traitez en arrière-plan.

La vérification de signature est la **même** que pour `payment.success` / `payment.failed` (voir [`GUIDE_INTEGRATION_SIMPLE.md`](./GUIDE_INTEGRATION_SIMPLE.md), section webhooks).

### Option B — Polling

```http
GET https://kibawallet-api.onrender.com/v1/withdrawals/{id}
```

Répétez toutes les **15–30 secondes** jusqu’à `SUCCEEDED` ou `FAILED`.

### Option C — Forcer une synchronisation

Si le retrait reste `PENDING` longtemps (callback retardé) :

```http
POST https://kibawallet-api.onrender.com/v1/withdrawals/{id}/sync
```

KibaWallet interroge la passerelle de paiement. Utile en complément du webhook, pas comme seul mécanisme en production.

---

## Étape 5 — Autres appels utiles

| Besoin | Endpoint |
|--------|----------|
| Liste des retraits (50 derniers) | `GET /v1/withdrawals` |
| Détail d’un retrait | `GET /v1/withdrawals/:id` |
| Solde avant retrait | `GET /v1/wallet?currency=USD` |
| Profil marchand | `GET /v1/me` |

Doc technique complète : [`API_INTEGRATION.md`](./API_INTEGRATION.md) (sections retraits et webhooks).

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

const WITHDRAWAL_FEE_RATE = 0.01;

function withdrawalDebit(amount) {
  const fee = Math.round(amount * WITHDRAWAL_FEE_RATE * 100) / 100;
  return { fee, debited: Math.round((amount + fee) * 100) / 100 };
}

async function getWallet(currency = 'USD') {
  const res = await fetch(`${BASE}/v1/wallet?currency=${currency}`, { headers: headers() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function createWithdrawal({ ref, phone, amount, currency = 'USD' }) {
  const wallet = await getWallet(currency);
  const { debited } = withdrawalDebit(amount);
  if (Number(wallet.balance) < debited) {
    throw new Error(`Solde insuffisant : ${wallet.balance} ${currency}, requis ${debited}`);
  }
  const res = await fetch(`${BASE}/v1/withdrawals`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      external_reference: ref,
      account_type: 'mobile',
      account: phone,
      amount,
      currency,
      description: `Payout ${ref}`,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { id, status: "PENDING", ... }
}

async function waitForWithdrawal(withdrawalId, maxAttempts = 12) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 15_000));
    const res = await fetch(`${BASE}/v1/withdrawals/${withdrawalId}`, { headers: headers() });
    const w = await res.json();
    if (w.status !== 'PENDING') return w;
  }
  throw new Error('Timeout');
}
```

Avant le `POST`, vérifiez que `balance ≥ amount + 1 %` (voir `withdrawalDebit` ci-dessus). La réponse contient `fee_withdrawal` et `amount_debited` pour confirmer le total réservé.

---

## Erreurs fréquentes

Toutes les réponses d’erreur HTTP viennent de **l’API KibaWallet** (`kibawallet-api.onrender.com`). Vous n’appelez jamais Kelpay directement : c’est un composant interne de la plateforme.

Quand `source` vaut `kibawallet`, l’erreur est formulée par KibaWallet. Le champ `details` (si présent) contient la réponse technique de la passerelle pour le diagnostic.

| HTTP | `error` (si présent) | Cause probable | Action |
|------|----------------------|----------------|--------|
| `401` | — | Mauvaises clés ou compte suspendu | Vérifier `pk_live_` / `sk_live_` |
| `409` | — | `external_reference` déjà utilisée | Nouvelle référence unique |
| `422` | — | `Insufficient balance` | `GET /v1/wallet` — le solde doit couvrir `amount` **+ 1 %** |
| `400` | — | Validation (`Only account_type mobile`, montant, etc.) | Corriger le corps de requête |
| `400` | `initiation_rejected` | KibaWallet n’a pas pu lancer le payout (refus passerelle) | Lire `details.code` / `details.description` ; contacter le support si besoin |
| `503` | `kibawallet_unavailable` | Service KibaWallet temporairement indisponible | Réessayer ; contacter le **support KibaWallet** |

Exemple — service indisponible (`503`) :

```json
{
  "statusCode": 503,
  "error": "kibawallet_unavailable",
  "source": "kibawallet",
  "message": "KibaWallet payment service is temporarily unavailable. Contact your KibaWallet administrator."
}
```

Exemple — initiation refusée (`400`) :

```json
{
  "statusCode": 400,
  "error": "initiation_rejected",
  "source": "kibawallet",
  "message": "KibaWallet could not initiate the withdrawal. See details.",
  "details": { "code": "1", "description": "..." }
}
```

### Autres cas (pas un code HTTP d’échec d’initiation)

| Situation | Action |
|-----------|--------|
| Reste `PENDING` longtemps | `POST /v1/withdrawals/{id}/sync` ou polling |
| Webhook `withdrawal.*` absent | Configurer les URLs dans **Paramètres** ; vérifier la signature HMAC |

---

## Différences paiement vs retrait

| | Paiement (`/v1/payments`) | Retrait (`/v1/withdrawals`) |
|--|---------------------------|---------------------------|
| Sens | Client → vous (encaissement) | Vous → bénéficiaire (décaissement) |
| Déclencheur client | USSD sur le **payeur** | Mobile Money du **bénéficiaire** |
| Wallet | **Crédit** (net, **−6 %** commission sur le brut — nouveaux comptes) | **Débit** (`amount` + **1 %** frais retrait, réservé puis confirmé) |
| Webhooks | `payment.success` / `payment.failed` | `withdrawal.success` / `withdrawal.failed` |

La **commission plateforme** sur les **encaissements** est de **6 %** du montant brut pour les **nouveaux comptes marchands** (ex. paiement **10,00 USD** → frais **0,60 USD** → crédit wallet **9,40 USD**). Vérifiez votre taux exact via `GET /v1/me` → `platform_fee_percent`. Chaque **retrait** ajoute **1 %** du montant envoyé (`WITHDRAWAL_FEE_RATE`, défaut `0.01`).

---

## Checklist mise en prod

- [ ] Vérifier `balance` ≥ `amount` + **1 %** avant chaque `POST /v1/withdrawals`
- [ ] `external_reference` unique par tentative de payout
- [ ] Gérer `withdrawal.failed` (fonds restitués — ne pas boucler la même référence)
- [ ] Webhook HTTPS + signature HMAC sur le corps brut
- [ ] Logs et alertes sur les retraits `PENDING` > quelques minutes

---

## Besoin d’aide ?

- **Retraits manuels** : Dashboard → **Retraits**
- **Journaux webhook** : Dashboard → **Développeurs**
- **Support** : [support@kibawallet.com](mailto:support@kibawallet.com) ou administrateur de votre compte KibaWallet
