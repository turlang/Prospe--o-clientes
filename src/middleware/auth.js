const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { hasMongoUri } = require('../db');
const { findUserById } = require('../localUserStore');

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
    { sub: String(user._id || user.id), email: user.email },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: process.env.JWT_ISSUER || 'leadhunter-pro',
      audience: process.env.JWT_AUDIENCE || 'leadhunter-web'
    }
  );
}

async function loadActiveUser(userId) {
  const user = hasMongoUri()
    ? await User.findById(userId).lean()
    : await findUserById(userId);

  if (!user || user.isActive === false) return null;
  return user;
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  if (!token) {
    return res.status(401).json({ error: 'Faça login para acessar esta funcionalidade.' });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      issuer: process.env.JWT_ISSUER || 'leadhunter-pro',
      audience: process.env.JWT_AUDIENCE || 'leadhunter-web'
    });

    const user = await loadActiveUser(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'Usuário inexistente, inativo ou sessão revogada. Faça login novamente.' });
    }

    const issuedAtMs = Number(payload.iat || 0) * 1000;
    const passwordChangedAtMs = user.passwordChangedAt ? new Date(user.passwordChangedAt).getTime() : 0;
    if (passwordChangedAtMs && issuedAtMs < passwordChangedAtMs) {
      return res.status(401).json({ error: 'Sua senha foi alterada. Faça login novamente.' });
    }

    req.user = { ...payload, email: user.email, role: user.role || 'user' };
    req.currentUser = user;
    return next();
  } catch (error) {
    if (error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError' || error?.name === 'NotBeforeError') {
      return res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
    }

    return next(error);
  }
}

module.exports = { createToken, requireAuth, assertSecurityEnv, getJwtSecret, loadActiveUser };
