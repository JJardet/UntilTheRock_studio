/*
 * CONFIGURATION MANUELLE DES HORAIRES STUDIO
 * Modifiez uniquement les deux constantes ci-dessous pour changer les horaires
 * de réservation (24 signifie minuit). Cette validation est la référence côté serveur.
 * Reportez exactement les mêmes valeurs dans frontend/js/main.js.
 * Fonction concernée : reservationRange().
 */
const express = require('express');
const Stripe = require('stripe');
const { db } = require('../database');
const { logger } = require('../logger');

const router = express.Router();
const ROOM_RATE_CENTS = 1000;
const VALID_ROOMS = new Set(['Studio A - Grand format', 'Studio B - Enregistrement', 'Studio C - Mixage']);
const STUDIO_OPENING_HOUR = 9;
const STUDIO_CLOSING_HOUR = 24;

function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}
function run(sql, values) { return new Promise((resolve, reject) => db.run(sql, values, function(error) { error ? reject(error) : resolve(this); })); }
function get(sql, values) { return new Promise((resolve, reject) => db.get(sql, values, (error, row) => error ? reject(error) : resolve(row))); }
function reservationRange(startTime, duration) {
  const match = String(startTime).match(/^(\d{1,2}):00$/);
  const start = match ? Number(match[1]) : NaN;
  const hours = Number(duration);
  if (!Number.isInteger(start) || start < STUDIO_OPENING_HOUR || start >= STUDIO_CLOSING_HOUR || !Number.isInteger(hours) || hours < 1 || start + hours > STUDIO_CLOSING_HOUR) return null;
  const end = start + hours;
  return {
    start,
    end,
    duration: hours,
    timeSlot: `${String(start).padStart(2, '0')}h00 - ${String(end === STUDIO_CLOSING_HOUR && STUDIO_CLOSING_HOUR === 24 ? 0 : end).padStart(2, '0')}h00`
  };
}

function storedSlotRange(slot) {
  const match = String(slot).match(/^(\d{1,2})h00\s*-\s*(\d{1,2})h00$/);
  if (!match) return null;
  const start = Number(match[1]);
  const rawEnd = Number(match[2]);
  const end = rawEnd === 0 ? 24 : rawEnd;
  return end > start ? { start, end } : null;
}

function rangesOverlap(first, second) {
  return first.start < second.end && second.start < first.end;
}
function publicOrigin(req) {
  // APP_URL doit être renseigné en production afin de ne jamais faire confiance à l'en-tête Host.
  return process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
}

async function markSessionPaid(session) {
  if (session.payment_status !== 'paid' || !session.metadata?.booking_id) return;
  const bookingId = Number(session.metadata.booking_id);
  const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
  await run(`UPDATE booking_studio
    SET status = 'pending', payment_status = 'paid', stripe_payment_intent_id = ?, amount_paid = ?
    WHERE id = ? AND stripe_session_id = ? AND payment_status != 'paid'`,
    [paymentIntent || null, session.amount_total || 0, bookingId, session.id]);
}

async function releaseUnpaidSession(session) {
  if (!session.metadata?.booking_id) return;
  await run(`UPDATE booking_studio SET status = 'cancelled', payment_status = 'unpaid'
    WHERE id = ? AND stripe_session_id = ? AND payment_status != 'paid'`,
    [Number(session.metadata.booking_id), session.id]);
}

router.post('/studio-checkout', async (req, res) => {
  const stripe = stripeClient();
  if (!stripe) return res.status(503).json({ error: 'Le paiement en ligne n’est pas encore configuré.' });
  const { name, email, phone, studio_type, date, start_time, duration, message = '' } = req.body;
  const range = reservationRange(start_time, duration);
  if (!name || !email || !phone || !date || !VALID_ROOMS.has(studio_type) || !range || String(message).length > 500) {
    return res.status(400).json({ error: 'Les informations de réservation sont invalides.' });
  }

  try {
    const existingBookings = await new Promise((resolve, reject) => db.all(
      `SELECT time_slot FROM booking_studio WHERE studio_type = ? AND date = ? AND status != 'cancelled'`,
      [studio_type, date],
      (error, rows) => error ? reject(error) : resolve(rows)
    ));
    if (existingBookings.some(booking => {
      const existingRange = storedSlotRange(booking.time_slot);
      return existingRange && rangesOverlap(range, existingRange);
    })) return res.status(409).json({ error: 'Ce créneau chevauche une réservation déjà demandée pour cette salle.' });

    const booking = await run(`INSERT INTO booking_studio
      (name, email, phone, studio_type, date, time_slot, duration, message, status, payment_status, amount_paid)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'payment_pending', 'unpaid', 0)`,
      [name, email, phone, studio_type, date, range.timeSlot, range.duration, message]);
    const amount = range.duration * ROOM_RATE_CENTS;
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment', customer_email: email,
        metadata: { booking_id: String(booking.lastID) },
        line_items: [{ price_data: { currency: 'eur', unit_amount: ROOM_RATE_CENTS, product_data: { name: `Réservation ${studio_type}` }, }, quantity: range.duration }],
        success_url: `${publicOrigin(req)}/reservation-studio?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${publicOrigin(req)}/reservation-studio?payment=cancelled`,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60
      });
      await run('UPDATE booking_studio SET stripe_session_id = ? WHERE id = ?', [session.id, booking.lastID]);
      res.status(201).json({ checkoutUrl: session.url, amount, duration: range.duration });
    } catch (error) {
      await run("UPDATE booking_studio SET status = 'cancelled' WHERE id = ?", [booking.lastID]);
      throw error;
    }
  } catch (error) {
    logger.error('Création Checkout Stripe impossible', error.message);
    res.status(500).json({ error: 'Impossible de démarrer le paiement. Veuillez réessayer.' });
  }
});

router.get('/checkout-session/:sessionId', async (req, res) => {
  const stripe = stripeClient();
  if (!stripe) return res.status(503).json({ error: 'Paiement indisponible.' });
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    await markSessionPaid(session);
    res.json({ paid: session.payment_status === 'paid' });
  } catch (error) { res.status(400).json({ error: 'Session de paiement introuvable.' }); }
});

async function webhook(req, res) {
  const stripe = stripeClient();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).send('Webhook Stripe non configuré');
  let event;
  try { event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET); }
  catch (error) { return res.status(400).send(`Signature webhook invalide: ${error.message}`); }
  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') await markSessionPaid(event.data.object);
    if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') await releaseUnpaidSession(event.data.object);
    res.json({ received: true });
  } catch (error) { logger.error('Webhook Stripe impossible à traiter', error.message); res.status(500).json({ error: 'Erreur webhook' }); }
}

module.exports = { router, webhook, stripeClient, ROOM_RATE_CENTS };
