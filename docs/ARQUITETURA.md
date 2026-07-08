# Arquitetura — LeadHunter Pro

## Visão
O projeto é um SaaS de prospecção comercial com CRM, planos, pagamentos, painel administrativo e motor de estratégias comerciais.

## Camadas atuais
- `public/`: interface HTML/CSS/JS.
- `src/server.js`: servidor Express e rotas principais.
- `src/services/`: regras de negócio reutilizáveis.
- `src/models/`: modelos MongoDB/Mongoose.
- `src/middleware/`: autenticação, admin, logs e rate limit.
- `tests/`: testes automatizados.

## Nova direção
A evolução deve continuar migrando responsabilidades de `server.js` para services e rotas dedicadas, mantendo entregas pequenas e validadas.

## Motor de Estratégias Comerciais
O arquivo `src/services/salesStrategyEngine.js` centraliza a lógica de diagnóstico do lead, seleção de estratégia, mensagem personalizada e sequência sugerida de follow-up.
