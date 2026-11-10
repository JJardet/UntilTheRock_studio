const { logger } = require('./logger');

function getBrevoConfig() {
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) return null;
  return {
    apiKey: process.env.BREVO_API_KEY,
    sender: {
      email: process.env.BREVO_SENDER_EMAIL,
      name: process.env.BREVO_SENDER_NAME || 'UntilTheRock Studio'
    }
  };
}

async function sendStudioBookingDecision(booking, status, refundAmount) {
  const brevo = getBrevoConfig();
  if (!brevo) {
    logger.error('Notification e-mail non envoyée : configuration BREVO_* absente');
    return false;
  }

  const confirmed = status === 'confirmed';
  const subject = confirmed
    ? 'Votre réservation UntilTheRock est confirmée'
    : 'Votre réservation UntilTheRock a été annulée';
  const details = `${booking.studio_type}, le ${booking.date}, ${booking.time_slot}`;
  const text = confirmed
    ? `Bonjour ${booking.name},\n\nVotre réservation (${details}) est confirmée.\n\nÀ bientôt,\nUntilTheRock Studio`
    : `Bonjour ${booking.name},\n\nVotre réservation (${details}) a été annulée. ${refundAmount ? `Un remboursement de ${(refundAmount / 100).toFixed(2).replace('.', ',')} € a été déclenché sur votre moyen de paiement.` : ''}\n\nUntilTheRock Studio`;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': brevo.apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: brevo.sender,
        to: [{ email: booking.email, name: booking.name }],
        subject,
        textContent: text
      })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(`Brevo API ${response.status}`);
      error.response = result;
      throw error;
    }

    logger.info('Notification e-mail réservation envoyée', {
      bookingId: booking.id,
      status,
      messageId: result.messageId
    });
    return true;
  } catch (error) {
    logger.error('Échec de notification e-mail réservation', error);
    return false;
  }
}

module.exports = { sendStudioBookingDecision };
