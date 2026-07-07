const User = require('../models/User');
const { hasMongoUri } = require('../db');
const { findUserById } = require('../localUserStore');

function requireAdmin(req, res, next) {
  const fail = () => res.status(403).json({ error: 'Acesso restrito ao administrador.' });

  if (!req.user?.sub) return fail();

  const run = async () => {
    const user = hasMongoUri() ? await User.findById(req.user.sub).lean() : await findUserById(req.user.sub);
    if (!user || user.role !== 'admin') return fail();
    req.adminUser = user;
    return next();
  };

  run().catch((error) => res.status(500).json({ error: error.message }));
}

module.exports = { requireAdmin };
