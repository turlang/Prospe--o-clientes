/**
 * @fileoverview Middleware HTTP `rateLimit` aplicado à cadeia de requisições da API.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/middleware/rateLimit
 */

function simpleRateLimit({ windowMs = 60_000, max = 90, keyGenerator = null } = {}) {
  const bucket = new Map();
  let requestsSinceSweep = 0;

  function sweep(now) {
    for (const [key, value] of bucket.entries()) {
      if (now >= value.resetAt) bucket.delete(key);
    }
  }

  return (req, res, next) => {
    const now = Date.now();
    requestsSinceSweep += 1;
    if (requestsSinceSweep >= 250) {
      requestsSinceSweep = 0;
      sweep(now);
    }

    const generatedKey = keyGenerator ? keyGenerator(req) : req.ip;
    const key = String(generatedKey || 'local').slice(0, 240);
    let current = bucket.get(key);

    if (!current || now >= current.resetAt) {
      current = { count: 0, resetAt: now + windowMs };
    }

    current.count += 1;
    bucket.set(key, current);

    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(Math.max(max - current.count, 0)));
    res.setHeader('RateLimit-Reset', String(Math.ceil(current.resetAt / 1000)));

    if (current.count > max) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((current.resetAt - now) / 1000))));
      return res.status(429).json({
        error: 'Muitas requisições em pouco tempo. Aguarde alguns instantes e tente novamente.'
      });
    }

    return next();
  };
}

module.exports = { simpleRateLimit };
