# Landing React 24.0.0

## Objetivo

Modernizar a apresentação comercial do LeadHunter Pro sem alterar o painel autenticado nem o backend já validado.

## Estrutura

```text
frontend/landing/
  index.html
  vite.config.mjs
  src/
    main.jsx
    App.jsx
    styles.css

public/landing-react/       # saída gerada pelo build
public/landing-fallback.html
public/landing-fallback.css
```

## Fluxo de build

```bash
npm install
npm run build
npm start
```

O Vite gera a landing em `public/landing-react`. As rotas `/` e `/landing.html` usam o bundle React quando ele existe e recorrem à página de fallback somente quando o build ainda não foi executado.

## Integração com planos

O componente `Pricing` consulta `GET /api/plans`. Se a API não responder, a interface usa uma configuração local de segurança para evitar uma página incompleta.

## Isolamento

O painel atual continua em `public/index.html`, acessado por `/app`. A migração do painel autenticado para React não faz parte desta versão, evitando misturar uma mudança visual ampla com regras de autenticação, CRM e recuperação de senha.
