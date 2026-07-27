# Matriz de rastreabilidade

| Requisito | Implementação principal | Testes relacionados |
|---|---|---|
| RF-01 | `src/authRoutes.js`, `public/reset-password.js` | `securityRegression.test.js`, `frontendRegression.test.js` |
| RF-03 | `src/routes/leadRoutes.js`, `src/places.js` | `salesStrategyEngine.test.js` e integração manual |
| RF-04 | `src/scorer.js` | testes de estratégia e regressão estática |
| RF-05 | `src/storage.js`, `src/models/Lead.js` | `securityRegression.test.js` |
| RF-07 | `src/services/aiApproachService.js` | `aiApproachService.test.js` |
| RF-08 | `src/routes/commercialRoutes.js` | testes de campanha e agenda |
| RF-09 | serviços de relatório e cockpit | testes de relatório e cockpit |
| RF-11 | `src/localUsageStore.js`, `src/models/Usage.js` | `planConfig.test.js` e regressões |
| RF-12 | `src/services/billingService.js` | `billingService.test.js` |
| RF-13 | `src/routes/adminRoutes.js`, `src/planConfig.js` | `planConfig.test.js` |
| RF-14 | `src/services/adminAuditService.js` | testes estáticos e validação manual |
| RNF-01 | `src/middleware/`, `src/security/` | testes de segurança e SSRF |
| RNF-04 | `src/app.js`, `src/routes/`, documentação | `modularization.test.js`, `check-documentation.js` |
| RNF-07 | `src/utils/jsonFileStore.js`, `src/db.js` | `jsonFileStore.test.js` |
