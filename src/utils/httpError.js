/**
 * @fileoverview Utilitário compartilhado `httpError` sem dependência de regras de apresentação.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/utils/httpError
 */

function isProduction() {
  return String(process.env.NODE_ENV || '').toLowerCase() === 'production';
}

function sendApiError(res, error, fallbackMessage = 'Não foi possível concluir a operação.') {
  const requestedStatus = Number(error?.statusCode || error?.status);
  const isHttpError = Number.isInteger(requestedStatus) && requestedStatus >= 400 && requestedStatus <= 599;
  const isClientError = isHttpError && requestedStatus < 500;
  const statusCode = isHttpError ? requestedStatus : 500;

  if (statusCode >= 500) {
    console.error('[API Error]', error?.stack || error?.message || error);
  }

  const message = isClientError
    ? String(error?.message || fallbackMessage)
    : (isProduction() ? fallbackMessage : String(error?.message || fallbackMessage));

  return res.status(statusCode).json({ error: message });
}

module.exports = { sendApiError };
