function requireAdmin(req, res, next) {
  if (!req.currentUser || req.currentUser.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito ao administrador.' });
  }

  req.adminUser = req.currentUser;
  return next();
}

module.exports = { requireAdmin };
