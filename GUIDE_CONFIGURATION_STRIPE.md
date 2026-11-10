# Configuration Stripe Checkout — réservations de salles

Ce guide configure le paiement obligatoire des salles de répétition : **10 € par heure**. Le client choisit son heure de début et le nombre d’heures souhaité ; le montant affiché dans Checkout correspond donc exactement à la durée choisie.

Les heures de début proposées vont de **09:00 à 23:00** et la réservation doit se terminer au plus tard à minuit. Dès la création du Checkout, toute la plage choisie est bloquée dans le calendrier public, y compris avant le paiement et avant la décision du studio. Elle est libérée si Checkout expire, si le paiement ne démarre pas, ou si le patron annule la réservation.

> Ne mettez jamais une clé Stripe secrète dans le frontend, dans Git ou dans un message. Seul le backend la lit.

## 1. Préparer Stripe

1. Créez ou ouvrez votre compte sur le [Dashboard Stripe](https://dashboard.stripe.com/).
2. Pour la recette, activez le **mode test** (interrupteur « Test mode »).
3. Dans **Developers → API keys**, récupérez la clé secrète `sk_test_...`.
4. Pour la production, répétez les étapes avec le mode test désactivé afin d’obtenir une clé `sk_live_...`.

Le site utilise Stripe Checkout hébergé par Stripe : aucune donnée de carte bancaire ne transite par le serveur UntilTheRock.

## 2. Configurer les variables d’environnement

Le serveur est lancé depuis `backend/` et lit donc le fichier `backend/.env`.

Copiez les valeurs de référence sans écraser un fichier existant :

```bash
cd backend
# À faire seulement si .env n’existe pas encore
cp .env.example .env
```

Ajoutez ou mettez à jour ces variables dans `backend/.env` :

```dotenv
# Stripe : utiliser sk_test_ en recette, sk_live_ uniquement en production
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_de_webhook

# L’URL publique exacte, sans slash final
APP_URL=https://votre-domaine.fr

# E-mails envoyés lors de la confirmation ou de l’annulation via Brevo
BREVO_API_KEY=xkeysib-votre-cle-api
BREVO_SENDER_EMAIL=notifications@votre-domaine.fr
BREVO_SENDER_NAME=UntilTheRock Studio
```

Pour un test local, utilisez `APP_URL=http://localhost:3000`. L’adresse `BREVO_SENDER_EMAIL` doit être validée dans Brevo (ou appartenir à un domaine authentifié).

### Configuration Brevo (notifications e-mail)

Le site envoie un e-mail après la confirmation ou l’annulation d’une réservation par le studio via l’API transactionnelle Brevo.

1. Dans Brevo, validez l’adresse expéditrice (ou authentifiez votre domaine) dans **Settings → Senders & IP**.
2. Créez une clé API v3 dans **Settings → API Keys & MCP**.
3. Renseignez dans `backend/.env` :

```dotenv
BREVO_API_KEY=xkeysib-votre-cle-api
BREVO_SENDER_EMAIL=une-adresse-validee@votre-domaine.fr
BREVO_SENDER_NAME=UntilTheRock Studio
```

La clé API Brevo est un secret : ne la commitez jamais et ne l’exposez pas dans le frontend.

Après toute modification, redémarrez l’application :

```bash
cd backend
npm install
npm start
```

En production avec PM2 :

```bash
pm2 restart untiltherock --update-env
pm2 logs untiltherock
```

## 3. Créer le webhook Stripe

Le webhook rend le paiement fiable même si le client ferme sa page de retour après Checkout.

### En local

Installez puis authentifiez la [Stripe CLI](https://docs.stripe.com/stripe-cli), puis lancez :

```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

La CLI affiche une valeur `whsec_...`. Copiez-la dans `STRIPE_WEBHOOK_SECRET`, redémarrez le serveur, puis relancez `stripe listen` si nécessaire.

### En production

1. Déployez le site avec HTTPS fonctionnel.
2. Dans Stripe : **Developers → Webhooks → Add endpoint**.
3. Saisissez `https://votre-domaine.fr/api/payments/webhook`.
4. Sélectionnez au minimum ces événements :
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
5. Copiez le « Signing secret » de cet endpoint dans `STRIPE_WEBHOOK_SECRET` du serveur.
6. Redémarrez PM2 avec `--update-env`.

Stripe exige que le endpoint renvoie HTTP 200. Consultez la page Webhooks du Dashboard Stripe et les logs PM2 après le premier paiement.

## 4. Comportement attendu

| Étape | État de la réservation | Action |
| --- | --- | --- |
| Formulaire envoyé | `payment_pending` | Création de la session Checkout ; le créneau est temporairement verrouillé. |
| Paiement validé | `pending` / `paid` | Le client voit le message indiquant que le studio va valider la demande. |
| Admin confirme | `confirmed` | Le client reçoit un e-mail de confirmation. |
| Admin annule | `cancelled` / `refunded` | Stripe rembourse le paiement et le client reçoit l’e-mail d’annulation. |
| Checkout expire | `cancelled` / `unpaid` | Le créneau est libéré par le webhook. |

Les sessions Checkout expirent au bout de 30 minutes. Une réservation payée ne peut pas être supprimée directement dans le dashboard : elle doit être annulée afin de déclencher le remboursement.

## 5. Tests à effectuer avant mise en production

Effectuez l’ensemble des tests ci-dessous en **mode test Stripe**. Utilisez une adresse e-mail de test que vous pouvez consulter.

### A. Contrôles techniques de base

```bash
cd backend
npm install
node --check server.js
node --check routes/payments.js
node --check routes/bookings.js
node --check notifications.js
```

- Démarrez le serveur et vérifiez que la migration v8 est appliquée dans les logs.
- Ouvrez `http://localhost:3000/reservation-studio` : choisissez une heure de début et une durée ; le prix doit être de **10 € × le nombre d’heures**.
- Sans `STRIPE_SECRET_KEY`, soumettez le formulaire : le paiement doit être refusé et aucune réservation payante ne doit pouvoir être créée.

### B. Paiement Checkout réussi

1. Choisissez une salle, une date future et un créneau libre.
2. Envoyez le formulaire ; vérifiez la redirection vers `checkout.stripe.com`.
3. Vérifiez que le montant correspond bien à 10 € multiplié par la durée sélectionnée.
4. En mode test, utilisez la carte `4242 4242 4242 4242`, une date future quelconque, un CVC quelconque et un code postal valide.
5. Après paiement, vérifiez le message : « Votre demande de réservation est en cours de validation par le studio… ».
6. Dans Stripe, vérifiez qu’un paiement test apparaît. Dans le dashboard admin, la réservation doit être « En attente » avec le statut de paiement « Payé ».
7. Dans Stripe → Developers → Webhooks, vérifiez la livraison réussie de `checkout.session.completed`.

### C. Confirmation par le studio

1. Connectez-vous à `/admin-login`.
2. Ouvrez la réservation de test et cliquez sur **Confirmer**.
3. Vérifiez le passage à « Confirmé ».
4. Vérifiez la réception de l’e-mail de confirmation dans la boîte SMTP de test, avec la salle, la date, l’heure de début et l’heure de fin correctes.

### D. Annulation et remboursement

1. Créez et payez une nouvelle réservation de test.
2. Dans le dashboard admin, cliquez sur **Annuler**.
3. Vérifiez que l’annulation réussit, que la réservation affiche « Remboursé » et que l’e-mail d’annulation est reçu.
4. Dans Stripe → Payments, ouvrez le paiement puis vérifiez la présence du remboursement intégral du montant payé.
5. Cliquez de nouveau sur Annuler ou rechargez rapidement la page pendant l’annulation : un seul remboursement doit apparaître (la requête est idempotente).

### E. Cas d’erreur et de sécurité

- **Chevauchement :** démarrez un Checkout pour une salle, une date et une plage donnée (par exemple 14:00–17:00), puis tentez une seconde réservation qui la chevauche (par exemple 15:00–16:00). Elle doit être refusée et le formulaire ne doit pas proposer la plage indisponible.
- **Paiement abandonné :** quittez Checkout. La réservation reste temporairement bloquée, puis est libérée à l’expiration de la session ; pour accélérer le contrôle, expirez la session depuis le Dashboard Stripe et vérifiez l’événement `checkout.session.expired`.
- **Paiement non contournable :** envoyez un `POST /api/bookings/studio` manuellement ; l’API doit répondre HTTP 410.
- **Suppression protégée :** tentez de supprimer une réservation `paid` depuis le dashboard ; l’action doit être refusée jusqu’à son annulation/remboursement.
- **Signature webhook :** envoyez un faux `POST /api/payments/webhook` sans signature Stripe ; le serveur doit répondre HTTP 400 et ne modifier aucune réservation.
- **Retour client absent :** réalisez un paiement puis fermez la fenêtre avant le retour sur le site. Le webhook Stripe doit malgré tout faire passer la réservation à `pending` / `paid`.

## 6. Passage en production

- Remplacez les clés `sk_test_...` par les clés `sk_live_...` et créez un **nouveau** webhook de production.
- Utilisez exclusivement HTTPS et vérifiez que `APP_URL` correspond exactement au domaine public.
- Réalisez un achat réel de faible montant et un remboursement, avec accord préalable du titulaire de la carte.
- Vérifiez les CGV, mentions légales, politique de remboursement et coordonnées de l’entreprise avant l’ouverture au public.
- Surveillez les échecs de webhook et les remboursements depuis le Dashboard Stripe les premiers jours.

## Dépannage rapide

| Symptôme | Vérification |
| --- | --- |
| « Le paiement en ligne n’est pas encore configuré » | `STRIPE_SECRET_KEY` est absente ou le serveur n’a pas redémarré. |
| Paiement réussi mais réservation encore en attente de paiement | Vérifiez `STRIPE_WEBHOOK_SECRET`, l’URL du webhook et les livraisons dans Stripe. |
| Aucun e-mail après confirmation/annulation | Vérifiez les variables `BREVO_*`, l’adresse expéditrice validée, les logs PM2 et le dossier spam. |
| Stripe ne peut pas joindre le webhook local | Lancez `stripe listen --forward-to localhost:3000/api/payments/webhook`. |
| Redirection vers le mauvais domaine | Corrigez `APP_URL`, puis redémarrez le backend. |
