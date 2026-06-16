const jwt = require('jsonwebtoken');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'troque-este-segredo-em-producao';
}

function createToken(user) {
  return jwt.sign(
    { sub: String(user._id || user.id), email: user.email, plan: user.plan || 'free' },
    getJwtSecret(),
    { expiresIn: '7d' }
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

module.exports = { createToken, requireAuth };
