const jwt = require('jsonwebtoken');

const DEFAULT_JWT_SECRET = 'troque-este-segredo-em-producao';

function isProduction() {
  return String(process.env.NODE_ENV || '').toLowerCase() === 'production';
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

  if (isProduction() && (!process.env.JWT_SECRET || secret === DEFAULT_JWT_SECRET)) {
    throw new Error('JWT_SECRET obrigatório em produção. Configure uma chave forte nas variáveis de ambiente.');
  }

  return secret;
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

module.exports = { createToken, requireAuth, assertSecurityEnv };
