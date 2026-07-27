/**
 * @fileoverview Middleware HTTP `admin` aplicado à cadeia de requisições da API.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/middleware/admin
 */

function requireAdmin(req, res, next) {
  if (!req.currentUser || req.currentUser.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito ao administrador.' });
  }

  req.adminUser = req.currentUser;
  return next();
}

module.exports = { requireAdmin };
