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
