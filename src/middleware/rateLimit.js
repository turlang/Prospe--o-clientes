function simpleRateLimit({ windowMs = 60_000, max = 90 } = {}) {
  const bucket = new Map();

  return (req, res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'] || 'local';
    const now = Date.now();
    const current = bucket.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > current.resetAt) {
      current.count = 0;
      current.resetAt = now + windowMs;
    }

    current.count += 1;
    bucket.set(key, current);

    if (current.count > max) {
      return res.status(429).json({
        error: 'Muitas requisições em pouco tempo. Aguarde alguns instantes e tente novamente.'
      });
    }

    next();
  };
}

module.exports = { simpleRateLimit };
