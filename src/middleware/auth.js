const jwt = require('jsonwebtoken');

const DEVELOPMENT_JWT_SECRET = 'dev-local-secret-change-before-deploy';

function isProduction() {
  return String(process.env.NODE_ENV || '').toLowerCase() === 'production';
}

function getJwtSecret() {
  if (!process.env.JWT_SECRET && isProduction()) {
    throw new Error('JWT_SECRET obrigatório em produção. Configure uma chave forte nas variáveis de ambiente.');
  }

  return process.env.JWT_SECRET || DEVELOPMENT_JWT_SECRET;
}

function assertSecurityEnv() {
  getJwtSecret();
}

function createToken(user) {
  return jwt.sign(
    { sub: String(user._id || user.id), email: user.email, plan: user.plan || 'trial' },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    return res.status(401).json({ error: 'Faça login para acessar esta funcionalidade.' });
  }

  try {
    req.user = jwt.verify(token, getJwtSecret());
    return next();
  } catch {
    return res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
  }
}

module.exports = { createToken, requireAuth, assertSecurityEnv, getJwtSecret };
