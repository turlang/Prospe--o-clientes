# Matriz de rastreabilidade

| Requisito | Implementação principal | Testes relacionados |
|---|---|---|
| RF-01 | `src/routes/authRoutes.js`, `public/assets/auth/reset-password.js` | `securityRegression.test.js`, `frontendRegression.test.js` |
| RF-03 | `src/routes/leadRoutes.js`, `src/integrations/googlePlaces.js` | `salesStrategyEngine.test.js` e integração manual |
| RF-04 | `src/domain/leads/leadScoring.js` | testes de estratégia e regressão estática |
| RF-05 | `src/repositories/leadRepository.js`, `src/models/Lead.js` | `securityRegression.test.js` |
| RF-07 | `src/services/aiApproachService.js` | `aiApproachService.test.js` |
| RF-08 | `src/routes/commercialRoutes.js` | testes de campanha e agenda |
| RF-09 | serviços de relatório e cockpit | testes de relatório e cockpit |
| RF-11 | `src/repositories/local/usageRepository.js`, `src/models/Usage.js` | `planConfig.test.js` e regressões |
| RF-12 | `src/services/billingService.js` | `billingService.test.js` |
| RF-13 | `src/routes/adminRoutes.js`, `src/domain/plans/planCatalog.js` | `planConfig.test.js` |
| RF-14 | `src/services/adminAuditService.js` | testes estáticos e validação manual |
| RNF-01 | `src/middleware/`, `src/security/` | testes de segurança e SSRF |
| RNF-04 | `src/app.js`, `src/routes/`, documentação | `modularization.test.js`, `check-documentation.js` |
| RNF-07 | `src/utils/jsonFileStore.js`, `src/infrastructure/database/mongoConnection.js` | `jsonFileStore.test.js` |
| RF-ADM-RESET-01 a 03 | `src/services/databaseResetService.js`, `src/routes/adminRoutes.js`, `public/assets/admin/admin.js` | `databaseResetService.test.js`, `adminDatabaseResetRegression.test.js` |
