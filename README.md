# Sistema de Prospecção Comercial Local — SaaS comercial

Projeto Node.js/Express para buscar leads locais, auditar presença digital e organizar oportunidades em um CRM com aparência de produto SaaS.

## O que entrou na Fase 3

- Dashboard executivo com indicadores de leads, prioridade, contato e potencial estimado.
- CRM Kanban com colunas de funil comercial.
- Atualização de status por arrastar e soltar.
- Lead Score visual com estrelas e classificação comercial.
- Geração de abordagem personalizada por lead.
- Histórico de atividades recentes por mudança de status e análise de resposta.
- Layout mais profissional, responsivo e com melhor aproveitamento de tela.
- Preparação visual para planos Teste/Pro/Agência.

## Instalação

```bash
npm install
```

Crie ou ajuste o arquivo `.env` na raiz do projeto:

```env
PORT=3000
GOOGLE_PLACES_API_KEY=cole_sua_chave_google_places_aqui
PLACES_PROVIDER=new
ALLOW_INCOMPLETE_CONTACTS=false
AUDIT_WEBSITES=true
MONGODB_URI=
JWT_SECRET=uma_chave_segura_123
```

> Se `MONGODB_URI` ficar vazio, o sistema usa JSON local. Isso permite testar cadastro, login e CRM sem MongoDB instalado.

## Rodar localmente

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## Fluxo de teste recomendado

1. Criar uma conta.
2. Fazer login.
3. Abrir a visão geral.
4. Prospectar um segmento e região.
5. Voltar para a visão geral e arrastar leads no Kanban.
6. Abrir CRM e editar status, favorito, tags e notas.
7. Clicar em “Gerar abordagem”.
8. Colar uma resposta recebida e analisar.
9. Exportar CSV.

## Próxima fase sugerida

Planos:

- MongoDB Atlas definitivo.
- Controle real de limites por plano.
- Planos Teste, Pro e Agência.
- Mercado Pago para assinatura.
- Deploy em Render ou VPS.
- Landing page de vendas.


## Planos — Monetização e limites por plano

Esta versão adiciona a primeira camada comercial do SaaS:

- Planos Teste, Pro e Agência.
- Limite diário de leads por usuário.
- Medidor de uso diário no dashboard.
- Aba de planos dentro do sistema.
- Upgrade simulado para validar fluxo comercial.
- Backend preparado para futura integração real com Mercado Pago.
- Compatibilidade com JSON local e MongoDB Atlas.

### Planos configurados

| Plano | Preço sugerido | Limite |
|---|---:|---:|
| Teste | R$ 0/mês | 10 leads totais |
| Pro | R$ 59/mês | 500 leads/dia |
| Agência | R$ 199/mês | 5.000 leads/dia |

### Como testar localmente

```bash
npm install
npm run dev
```

Abra:

```text
http://localhost:3000
```

Crie conta, faça login e acesse a aba **Planos**.

### Importante

O upgrade desta fase é simulado. Ele altera o plano do usuário no banco local/MongoDB para validar a experiência antes de integrar pagamento real.

Na próxima fase, conecte a rota `/api/billing/checkout` ao Mercado Pago para criar assinatura real.


## Produção — Produção, observabilidade e checkout real opcional

Esta fase prepara o projeto para sair do ambiente local:

- Endpoint `/api/health` para monitoramento.
- Endpoint `/api/metrics` protegido por login.
- Logs simples de requisições HTTP.
- Rate limit básico para proteger a API.
- Arquivo `.node-version` com Node 20.
- `render.yaml` para deploy no Render.
- `vercel.json` experimental para deploy serverless.
- Checkout real via Mercado Pago quando `MERCADO_PAGO_ACCESS_TOKEN` estiver configurado.
- Webhook inicial em `/api/billing/webhook`.

### Como testar

```bash
npm install
npm run dev
```

Abra:

```text
http://localhost:3000
```

Teste a saúde da API:

```text
http://localhost:3000/api/health
```

### Mercado Pago

Sem token, o upgrade continua em modo simulado.

Com token no `.env`:

```env
MERCADO_PAGO_ACCESS_TOKEN=APP_USR_sua_chave
PUBLIC_APP_URL=http://localhost:3000
MERCADO_PAGO_SUCCESS_URL=http://localhost:3000/?pagamento=sucesso
MERCADO_PAGO_FAILURE_URL=http://localhost:3000/?pagamento=falha
MERCADO_PAGO_PENDING_URL=http://localhost:3000/?pagamento=pendente
MERCADO_PAGO_WEBHOOK_URL=
```

A rota `/api/billing/checkout` passa a criar uma preferência real e redireciona o usuário para o checkout.

### Deploy no Render

1. Suba o projeto para o GitHub.
2. No Render, crie um Web Service.
3. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Node: 20
4. Adicione as variáveis:
   - `JWT_SECRET`
   - `PUBLIC_APP_URL`
   - `MONGODB_URI`
   - `GOOGLE_PLACES_API_KEY`
   - `MERCADO_PAGO_ACCESS_TOKEN` quando for usar pagamento real.


## Campanhas — Campanhas e follow-up

Esta fase transforma o sistema em uma operação comercial guiada:

- Sequência de 3 mensagens por lead.
- Botão “Sequência” no card do lead.
- Botão “Agendar follow-up”.
- Aba “Campanhas”.
- Lista de follow-ups pendentes e concluídos.
- Registro local em `data/tasks.json`.
- Sem disparo automático de WhatsApp, mantendo revisão humana e evitando spam.

### Rotas adicionadas

```text
POST /api/campaigns/sequence
POST /api/followups
GET  /api/followups
PATCH /api/followups/:id/done
```

### Próxima evolução recomendada

A próxima fase pode adicionar:
- Integração oficial com WhatsApp Business.
- Calendário de follow-ups.
- Templates por nicho.
- Relatórios de conversão por campanha.


## Landing comercial — Landing page comercial e UX de venda

Esta fase adiciona a camada pública de vendas do SaaS:

- Landing page em `/landing.html`.
- Rota `/` apontando para a landing page.
- Rota `/app` apontando para o sistema.
- Seções comerciais:
  - Hero com CTA.
  - Benefícios.
  - Fluxo de uso.
  - Planos.
  - Depoimentos.
  - FAQ.
  - CTA final.
- CSS próprio em `public/landing.css`.
- Layout responsivo para celular.

### Como acessar

```text
http://localhost:3000/
```

Landing page comercial.

```text
http://localhost:3000/app
```

Dashboard do sistema.

### Próximos ajustes recomendados

- Trocar o nome LeadHunter Pro se desejar outra marca.
- Adicionar domínio próprio.
- Colocar prints reais do dashboard na landing.
- Adicionar política de privacidade e termos de uso.
- Conectar checkout real do Mercado Pago.


## Fase 8
- Trial de 10 leads totais por usuário
- Preparação para expiração de avaliação
- Tela de upgrade após esgotar trial

## Fase 9
- Preparação para MongoDB Atlas em produção
- Mercado Pago real (estrutura)
- Painel administrativo (roadmap)
- Métricas de conversão (roadmap)


# Produção com MongoDB Atlas + Render

Esta versão está pronta para rodar no Render usando MongoDB Atlas.

## O que mudou nesta versão

- Persistência principal em MongoDB Atlas quando `MONGODB_URI` estiver configurado.
- Usuários, leads, histórico, uso do trial e follow-ups ficam no MongoDB.
- Fallback em JSON continua disponível somente para desenvolvimento local.
- `REQUIRE_MONGODB=true` impede o Render de subir usando JSON local por engano.
- `render.yaml` configurado com health check em `/api/health`.
- Node fixado em versão 20 via `.node-version` e `engines`.

## Rodar localmente com JSON

```bash
npm install
npm run dev
```

Use no `.env`:

```env
REQUIRE_MONGODB=false
MONGODB_URI=
```

## Rodar localmente com MongoDB Atlas

Use no `.env`:

```env
REQUIRE_MONGODB=true
MONGODB_URI=mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/prospeccao_leads?retryWrites=true&w=majority
JWT_SECRET=sua_chave_grande
```

Depois:

```bash
npm run dev
```

Teste:

```text
http://localhost:3000/api/health
```

O retorno deve mostrar:

```json
{
  "mongodbAtivo": true
}
```

## Deploy no Render

1. Suba o projeto para o GitHub.
2. No Render, crie um **Web Service**.
3. Conecte o repositório.
4. Use:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/api/health`
5. Configure as variáveis:
   - `NODE_ENV=production`
   - `REQUIRE_MONGODB=true`
   - `JWT_SECRET`
   - `MONGODB_URI`
   - `GOOGLE_PLACES_API_KEY`
   - `PUBLIC_APP_URL=https://seu-app.onrender.com`

## MongoDB Atlas

No Atlas:

1. Crie um cluster gratuito M0.
2. Crie um usuário de banco.
3. Libere acesso de rede para o Render.
   - Para teste: `0.0.0.0/0`
   - Depois, restrinja se necessário.
4. Copie a connection string.
5. Troque `<password>` pela senha real.
6. Use o banco `prospeccao_leads`.

Exemplo:

```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/prospeccao_leads?retryWrites=true&w=majority
```

## Observação sobre plano gratuito do Render

No plano gratuito, o serviço pode dormir após inatividade. O primeiro acesso pode demorar alguns segundos.


## Release v10.0.0

Esta release está pronta para produção com Render, MongoDB Atlas, health check, cadastro/login, persistência real, trial de 10 leads, CRM, Kanban, campanhas, follow-ups e exportação CSV.

Leia também: `RELEASE_V10.md`.


## Correção de rota inicial

A rota `/` agora abre a landing page comercial.
O dashboard continua em `/app`.

```text
/              -> landing page
/app           -> dashboard
/landing.html  -> landing page
```
