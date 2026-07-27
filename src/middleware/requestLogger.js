/**
 * @fileoverview Middleware HTTP `requestLogger` aplicado à cadeia de requisições da API.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/middleware/requestLogger
 */

const requestCounters = {
  total: 0,
  prospectar: 0,
  errors: 0
};

function requestLogger(req, res, next) {
  requestCounters.total += 1;
  const started = Date.now();
  res.on('finish', () => {
    if (res.statusCode >= 500) requestCounters.errors += 1;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - started}ms`);
  });
  next();
}

module.exports = { requestLogger, requestCounters };
