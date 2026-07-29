# Relatório de Validação

Data da validação: 29 de julho de 2026.

## Verificações concluídas

1. Estrutura crítica verificada por `npm run verify`.
2. Arquivos JSON de configuração analisados com `JSON.parse`.
3. Todos os arquivos JavaScript do back-end analisados com `node --check`.
4. Arquivos JSX analisados pelo compilador TypeScript em modo de parsing, sem emissão.
5. Busca por marcadores de código omitido, como `TODO` e “insira o resto”, concluída.

## Limitação do ambiente

A instalação completa e o `vite build` não foram executados porque o registro npm público não respondeu dentro do ambiente de criação. Portanto, a validação realizada é estrutural e sintática, não uma execução end-to-end com PostgreSQL.

## Validação recomendada no computador local

```powershell
npm install
Copy-Item .env.example apps/api/.env
npm run db:up
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Depois, teste:

```text
http://localhost:5173
http://localhost:3333/api/health
```
