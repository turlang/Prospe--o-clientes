# Guia do desenvolvedor — LeadHunter Pro

Este guia descreve como preparar o ambiente, entender a execução, alterar o sistema com segurança e entregar uma mudança pronta para produção.

## 1. Pré-requisitos

- Node.js `>=20.19 <23`;
- npm 10 ou superior;
- MongoDB local ou Atlas;
- Git;
- conta nos provedores externos somente quando o recurso correspondente for testado.

## 2. Instalação local

### Bash

```bash
git clone https://github.com/turlang/Prospe--o-clientes.git
cd Prospe--o-clientes
npm ci
npm --prefix frontend/landing install --include=dev
cp .env.example .env
npm run build
npm run quality
npm start
```

### PowerShell

```powershell
git clone https://github.com/turlang/Prospe--o-clientes.git
Set-Location Prospe--o-clientes
npm ci
npm --prefix frontend/landing install --include=dev
Copy-Item .env.example .env
npm run build
npm run quality
npm start
```

A aplicação usa `http://localhost:3000` por padrão.

## 3. Modos de desenvolvimento

| Comando | Uso |
|---|---|
| `npm run dev` | backend com reinicialização automática |
| `npm run dev:landing` | landing React pelo Vite |
| `npm start` | execução equivalente à produção |
| `npm run build` | gera e valida os artefatos públicos |
| `npm run quality` | executa todos os gates obrigatórios |

Para testar o dashboard autenticado, execute o backend. Para trabalhar apenas na landing, use o Vite e mantenha a API disponível quando a tela consumir planos.

## 4. Variáveis mínimas

Desenvolvimento básico:

```env
PORT=3000
NODE_ENV=development
REQUIRE_MONGODB=false
JWT_SECRET=use-uma-chave-local-longa
MONGODB_URI=
PUBLIC_APP_URL=http://localhost:3000
ALLOW_SIMULATED_BILLING=true
EXPOSE_PASSWORD_RESET_LINK=true
INTEGRATION_ENCRYPTION_KEY=use-uma-chave-local-diferente-do-jwt
```

Produção exige MongoDB, segredos fortes, URLs públicas corretas e simulações desabilitadas. Consulte `.env.example` e o README.

## 5. Como ler o projeto

Comece nesta ordem:

1. `README.md` para produto e operação;
2. `docs/MAPA_DO_CODIGO.md` para responsabilidades;
3. `docs/ARQUITETURA.md` para limites entre camadas;
4. `src/server.js` para bootstrap;
5. `src/app.js` para composição;
6. rota, serviço, domínio e repositório do recurso que será alterado;
7. testes existentes do mesmo domínio.

## 6. Processo de mudança

```text
problema reproduzido
→ teste de regressão
→ alteração mínima
→ documentação atualizada
→ npm run quality
→ pull request
→ deploy
→ smoke test
```

Nunca corrija apenas a aparência quando a origem estiver em regra de negócio, persistência ou contrato HTTP.

## 7. Convenções de código

### Módulos

Todo JavaScript mantido deve começar com `@fileoverview` explicando responsabilidade e limites.

```js
/**
 * @fileoverview Coordena o caso de uso sem conhecer detalhes do Express.
 * @module services/exampleService
 */
```

### Funções públicas ou complexas

Use JSDoc para parâmetros, retorno, efeitos e erros relevantes.

```js
/**
 * Normaliza um valor recebido antes de persistir.
 *
 * @param {unknown} input Valor externo.
 * @returns {string} Valor seguro e normalizado.
 */
function normalizeValue(input) {
  return String(input || '').trim();
}
```

### Comentários

Explique o motivo, não a sintaxe.

Bom:

```js
// O webhook pode ser reenviado pelo provedor; o fingerprint impede duplicidade.
```

Ruim:

```js
// Cria uma variável chamada fingerprint.
```

### Erros

- erros esperados devem ser convertidos em respostas seguras;
- logs podem conter correlation ID, nunca credenciais;
- não devolva stack trace em produção;
- não silencie falhas externas sem registrar estado ou fallback.

### Assincronismo

- use `async/await`;
- envolva bordas externas em `try/catch`;
- defina timeout em rede;
- operações repetíveis devem ser idempotentes;
- não bloqueie o bootstrap com trabalho que pertence a uma fila.

## 8. Frontend autenticado

O dashboard atual usa HTML e JavaScript modular progressivo. Identificadores de DOM são contratos. Antes de renomear um `id`:

1. busque todas as referências;
2. atualize controladores e testes;
3. preserve acessibilidade;
4. verifique desktop e mobile;
5. valide cache busting quando CSS ou JavaScript for alterado.

A Visão Geral não deve criar scroll interno. Quando o conteúdo exceder a viewport, a rolagem deve ser natural da página ou o conteúdo deve ser reorganizado.

## 9. Backend

Rotas não devem:

- consultar modelos diretamente quando há repositório;
- conter regra comercial extensa;
- conhecer detalhes de provedores externos;
- confiar em `userId` enviado pelo cliente.

Serviços devem receber o usuário autenticado e garantir isolamento de dados.

## 10. Banco de dados

Ao alterar schema:

- preserve campos existentes;
- adicione defaults seguros;
- crie índices conscientemente;
- documente impacto;
- escreva migração idempotente quando dados existentes precisarem mudar;
- teste com documento antigo e documento novo.

Não execute migração destrutiva automaticamente no bootstrap.

## 11. Segurança

Checklist mínimo:

- autorização no backend;
- validação e normalização da entrada;
- isolamento por `userId` e futuro `organizationId`;
- segredo fora do repositório;
- logs sem conteúdo sensível;
- rate limit em endpoints abusáveis;
- idempotência em webhook;
- criptografia para credenciais de integração;
- resposta genérica em recuperação de senha;
- dependência externa com timeout e fallback controlado.

## 12. Testes

Uma mudança deve executar ao menos:

```bash
npm run check:hygiene
npm run check:syntax
npm run check:docs
npm run check:architecture
npm run check:frontend
npm run check:styles
npm run verify:landing
npm test
```

`npm run quality` executa essa sequência completa.

## 13. Pull request

Inclua:

- problema observado;
- comportamento esperado;
- solução;
- arquivos e contratos afetados;
- testes executados;
- risco de segurança/dados;
- evidência visual quando houver UI;
- rollback.

Mudanças grandes devem ser divididas em entregas que possam ser vistas no Render e validadas antes da próxima fase.

## 14. Deploy no Render

O repositório publica pela `main`. O health check é `/api/health` e expõe branch/commit do artefato executado.

Depois do merge:

1. confirme que o commit entrou na `main`;
2. acompanhe o deploy no Render;
3. confirme o commit no `/api/health`;
4. use `Ctrl + F5` quando assets tiverem mudado;
5. execute smoke test de login, dashboard, CRM, conversas e admin.

Use `Clear build cache & deploy` apenas quando houver suspeita de cache de dependência ou artefato.

## 15. Diagnóstico comum

### Aplicação inicia sem banco

Confirme `MONGODB_URI` e `REQUIRE_MONGODB`. Em produção, `REQUIRE_MONGODB=true` deve impedir fallback local.

### CSS antigo continua aparecendo

Confirme o commit no Render, o parâmetro de versão do asset e faça recarga forçada.

### Recuperação de senha não envia

Verifique `RESEND_API_KEY`, domínio do `MAIL_FROM`, `PUBLIC_APP_URL` e logs sem expor token.

### IA usa fallback local

Verifique `AI_PROVIDER`, chave, modelo, timeout e endpoint de status do provedor.

### Valores financeiros incorretos

Confirme se o dado é número, faixa textual ou valor fechado. Regras de conversão monetária devem permanecer no serviço de CRM e receber teste de regressão.
