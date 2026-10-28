const nodemailer = require('nodemailer');
const { logger } = require('./logger');

function getTransporter() {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return null;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }
  });
}

async function sendStudioBookingDecision(booking, status, refundAmount) {
  const transporter = getTransporter();
  if (!transporter) {
    logger.error('Notification e-mail non envoyée : configuration EMAIL_* absente');
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
    const result = await transporter.sendMail({ from: process.env.EMAIL_FROM || process.env.EMAIL_USER, to: booking.email, subject, text });
    logger.info('Notification e-mail réservation envoyée', {
      bookingId: booking.id,
      status,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected
    });
    return true;
  } catch (error) {
    logger.error('Échec de notification e-mail réservation', error);
    return false;
  }
}

module.exports = { sendStudioBookingDecision };
