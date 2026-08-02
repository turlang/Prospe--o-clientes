# Release 26.2.0 — Higienização estrutural real

## Objetivo

Eliminar arquivos estrangeiros, cópias legadas e implementações não utilizadas que permaneciam no pacote apesar da reorganização visual das versões anteriores.

## Alterações

- removido o monorepo acidental do DevBurger (`apps/api`, `apps/web`, Prisma e PostgreSQL);
- removidos scripts e documentos de correção React pertencentes a outro projeto;
- removidas 16 duplicatas antigas da raiz de `src/`, mantendo apenas `app.js` e `server.js`;
- removidas páginas e assets públicos legados substituídos por `public/pages` e `public/assets`;
- removidas duas implementações React antigas e componentes inacessíveis da landing;
- reforçado o verificador arquitetural para impedir o retorno desses arquivos;
- adicionado teste de regressão de higiene do repositório;
- cache-busting e metadados atualizados para `26.2.0`.

## Compatibilidade

APIs, banco de dados, autenticação, recuperação de senha, planos, CRM e regras comerciais não foram alterados. Os arquivos JSON de dados foram preservados sem mudança de conteúdo.
