/**
 * @fileoverview Serviço de domínio `emailService` responsável por regras comerciais reutilizáveis.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/services/emailService
 */

async function sendPasswordResetEmail({ email, resetUrl }) {
  const appName = process.env.APP_NAME || 'LeadHunter Pro';
  const from = process.env.MAIL_FROM || 'LeadHunter Pro <noreply@leadhunter.local>';
  const subject = `Redefinição de senha — ${appName}`;
  const html = `
    <p>Olá,</p>
    <p>Recebemos uma solicitação para redefinir sua senha no ${appName}.</p>
    <p><a href="${resetUrl}">Clique aqui para criar uma nova senha</a>.</p>
    <p>Este link expira em 30 minutos. Se você não solicitou, ignore este e-mail.</p>
  `;

  if (process.env.RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from, to: email, subject, html })
    });

    if (!response.ok) {
      const payload = await response.text();
      throw new Error(`Falha ao enviar e-mail de recuperação: ${payload}`);
    }

    return { sent: true, provider: 'resend' };
  }

  console.log('[PASSWORD_RESET_LINK]', email, resetUrl);
  return { sent: false, provider: 'development_log' };
}

module.exports = { sendPasswordResetEmail };
