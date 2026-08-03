# LeadHunter Pro

**Versão:** 27.0.0  
**Estado:** publicado e operacional  
**Público:** desenvolvedores, freelancers e agências que vendem sites, sistemas, automações e soluções com IA

O LeadHunter Pro é um sistema operacional comercial para freelancers, agências e pequenas equipes que vendem sites, automações e soluções digitais. A plataforma conecta descoberta de oportunidades, auditoria digital, CRM 360, tarefas, inteligência comercial, relatórios, planos, administração e uma Central de Conversas omnichannel em modo demonstrativo.


## Release 27.0.0 — CRM 360 + Omnichannel

A release integra o CRM 360 à base omnichannel já publicada, preservando autenticação, planos, dados, painel executivo e rastreabilidade do Render.

Principais recursos:

- múltiplos pipelines e etapas configuráveis;
- probabilidades e campos obrigatórios por etapa;
- campos personalizados e filtros salvos;
- Kanban e visualização em lista;
- catálogo de produtos e serviços;
- contrato, receita recorrente, valor fechado e motivos de perda;
- previsão ponderada, metas e relatórios por período;
- importação CSV com prévia, mapeamento e deduplicação;
- exportação completa e reativação de oportunidades;
- Central de Conversas vinculada ao CRM;
- histórico, notas internas, não lidas e transferência humana;
- identificação explícita do modo demonstrativo;
- commit e branch implantados expostos pelo `/api/health`.

## Produto entregue

A aplicação está publicada no Render, conectada ao MongoDB Atlas e validada com os principais fluxos de leitura e operação.

| Área | Estado |
|---|---|
| Landing comercial | Operacional |
| Cadastro, login e sessão | Operacional |
| Recuperação de senha | Implementada |
| CRM e gestão de leads | Operacional |
| Tarefas e follow-ups | Operacional |
| Plano de ação diário | Operacional |
| Histórico e auditoria | Operacional |
| Relatórios comerciais | Operacional |
| Painel administrativo | Operacional |
| Planos dinâmicos | Persistidos no MongoDB |
| Copiloto comercial | Implementado com fallback local |
| MongoDB Atlas | Conectado em produção |
| Render | Deploy validado |
| Qualidade automatizada | 172 testes aprovados |

## Funcionalidades

### Prospecção e CRM

- cadastro, edição, classificação e movimentação de leads;
- funil comercial com sete etapas;
- tarefas, lembretes e follow-ups;
- histórico de pesquisas e atividades;
- priorização de oportunidades;
- plano de ação diário;
- leitura executiva do pipeline;
- indicadores de conversão e receita potencial.

### Inteligência comercial

- geração de abordagens personalizadas;
- sugestões de próximos passos;
- identificação de gargalos;
- recomendações de follow-up;
- estratégias comerciais por contexto;
- suporte a Groq, Gemini ou OpenAI;
- motor local de contingência quando o provedor externo não estiver disponível.

### Administração e planos

- visão geral de usuários, uso, segurança e operação;
- planos Trial, Pro e Agência configuráveis;
- publicação das alterações de planos sem novo deploy;
- persistência das configurações no MongoDB;
- registros de auditoria administrativa;
- limites de uso por plano;
- acesso protegido por autenticação e autorização administrativa.

### Landing comercial

A página pública ocupa uma única viewport e alterna o conteúdo sem rolagem da página.

Painéis disponíveis:

- Início;
- Como funciona;
- Ferramentas;
- Para quem é;
- Planos.

No desktop, a navegação utiliza o cabeçalho e controles sequenciais. No mobile, a navegação principal utiliza uma barra inferior fixa.

## Interface

O design system inclui:

- tokens de cor, tipografia, espaçamento e elevação;
- CSS modular por responsabilidade;
- componentes responsivos;
- profundidade 3D discreta;
- tratamento para touch e movimento reduzido;
- gráficos em HTML e CSS sem dependência obrigatória de biblioteca externa.

Consulte [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).

## Arquitetura

```text
frontend/landing/
  src/app/                 composição da landing React
  src/features/            painéis comerciais
  src/shared/              layout e componentes reutilizáveis
  src/hooks/               estado e navegação
  src/services/            comunicação com a API pública
  src/data/                conteúdo estruturado
  static/                  contingência equivalente ao bundle React

src/
  app.js                   Application Factory do Express
  server.js                bootstrap e conexão com o banco
  config/                  configuração da aplicação
  domain/                  regras de negócio
  repositories/            persistência MongoDB e contingência local
  integrations/            IA, e-mail e pagamentos
  services/                casos de uso
  routes/                  rotas HTTP
  middleware/              autenticação, autorização e limites
  infrastructure/          conexões e detalhes técnicos

public/
  pages/                   páginas da aplicação
  assets/                  CSS e JavaScript por contexto
  landing-react/           build público da landing

tests/                     testes automatizados
scripts/                   build e gates de qualidade
```

Documentação complementar:

- [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md)
- [`docs/CODING_STANDARDS.md`](docs/CODING_STANDARDS.md)
- [`docs/PLANOS_DINAMICOS.md`](docs/PLANOS_DINAMICOS.md)
- [`ROADMAP.md`](ROADMAP.md)
- [`CHANGELOG.md`](CHANGELOG.md)

## Tecnologias

- Node.js 20;
- Express;
- MongoDB Atlas e Mongoose;
- React e Vite;
- JavaScript CommonJS;
- JWT e bcryptjs;
- Helmet e CORS;
- Resend;
- Mercado Pago;
- Groq, Gemini ou OpenAI.

## Requisitos

- Node.js `>=20.19 <23`;
- npm 10 ou superior;
- MongoDB obrigatório em produção;
- variáveis externas configuradas fora do repositório.

## Instalação

### Bash

```bash
npm ci
npm --prefix frontend/landing install --include=dev
cp .env.example .env
npm run build
npm run quality
npm start
```

### PowerShell

```powershell
Copy-Item .env.example .env
npm ci
npm --prefix frontend/landing install --include=dev
npm run build
npm run quality
npm start
```

A aplicação usa `http://localhost:3000` por padrão.

## Comandos

| Comando | Finalidade |
|---|---|
| `npm start` | inicia a aplicação |
| `npm run dev` | inicia o backend em modo watch |
| `npm run dev:landing` | inicia a landing pelo Vite |
| `npm run build` | gera e valida os artefatos de produção |
| `npm run build:react` | gera o bundle React |
| `npm run build:static` | sincroniza a landing estática |
| `npm run verify:landing` | valida a landing publicada |
| `npm run check:syntax` | valida a sintaxe JavaScript |
| `npm run check:architecture` | valida a arquitetura |
| `npm run check:frontend` | valida o frontend |
| `npm run check:styles` | valida os estilos |
| `npm run check:docs` | valida a documentação |
| `npm test` | executa os testes |
| `npm run quality` | executa todos os gates |

## Rotas principais

| Rota | Finalidade |
|---|---|
| `/` | landing comercial |
| `/app` | autenticação e aplicação principal |
| `/admin` | painel administrativo |
| `/api/health` | saúde e versão da aplicação |
| `/api/plans` | catálogo público de planos |
| `/api/leads` | gestão autenticada de leads |
| `/api/reports/commercial` | relatório comercial |
| `/api/billing/usage` | consumo e limites do plano |

## Configuração de produção

```env
NODE_ENV=production
REQUIRE_MONGODB=true
MONGODB_URI=mongodb+srv://usuario:senha@cluster/banco
JWT_SECRET=uma-chave-longa-aleatoria-e-exclusiva
JWT_EXPIRES_IN=7d
JWT_ISSUER=leadhunter-pro
JWT_AUDIENCE=leadhunter-web
PUBLIC_APP_URL=https://seu-servico.onrender.com
CORS_ORIGINS=https://seu-servico.onrender.com
```

### Recuperação de senha

```env
RESEND_API_KEY=re_...
MAIL_FROM=LeadHunter Pro <noreply@seu-dominio-verificado.com>
EXPOSE_PASSWORD_RESET_LINK=false
```

### Inteligência artificial

```env
AI_PROVIDER=groq
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
AI_APPROACHES_ENABLED=true
AI_APPROACH_TIMEOUT_MS=25000
AI_APPROACH_TEMPERATURE=0.9
AI_MAX_TOKENS=1400
```

### Pagamentos

```env
ALLOW_SIMULATED_BILLING=false
MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_SUCCESS_URL=https://seu-servico.onrender.com/app?pagamento=sucesso
MERCADO_PAGO_FAILURE_URL=https://seu-servico.onrender.com/app?pagamento=falha
MERCADO_PAGO_PENDING_URL=https://seu-servico.onrender.com/app?pagamento=pendente
MERCADO_PAGO_WEBHOOK_URL=https://seu-servico.onrender.com/api/billing/webhook
```

Nunca publique `.env`, tokens, senhas, chaves de API ou dados reais no Git.

## Banco de dados

Principais coleções:

- `users`;
- `leads`;
- `tasks`;
- `searchhistories`;
- `usages`;
- `plan_configurations`;
- `payments`;
- `passwordresets`;
- `adminauditlogs`;
- `copilotconversations`;
- `trialguards`.

Em produção, `REQUIRE_MONGODB=true` impede a inicialização acidental com persistência local.

## Deploy no Render

```text
Runtime: Node
Build Command: npm ci && npm run build
Start Command: npm start
Health Check Path: /api/health
```

Depois de alterações estruturais, utilize **Clear build cache & deploy**.

## Validação

Fluxos já confirmados em produção:

- carregamento da landing;
- carregamento da aplicação;
- carregamento do painel administrativo;
- leitura de usuários, planos, segurança e auditoria;
- leitura de leads e relatórios;
- leitura de uso e limites;
- persistência no MongoDB Atlas.

Validações externas recomendadas antes da cobrança comercial real:

- recuperação de senha com domínio verificado;
- pagamento completo no Mercado Pago;
- recebimento do webhook e atualização do plano;
- geração de abordagem pelo provedor de IA configurado;
- persistência após reinicialização do serviço.

## Segurança

- senhas protegidas com bcrypt;
- autenticação JWT com issuer e audience;
- autorização administrativa;
- Helmet e política de segurança de conteúdo;
- CORS configurável;
- limites contra abuso;
- auditoria administrativa;
- segredos e dados locais excluídos pelo `.gitignore`;
- testes de regressão de autenticação e segurança.

## Uso responsável

A prospecção deve respeitar a legislação aplicável, a privacidade, os termos dos provedores e os mecanismos de descadastro. Informações públicas não autorizam coleta excessiva ou disparos abusivos.

## Documentos da release

- [`docs/RELEASE_27.0.0.md`](docs/RELEASE_27.0.0.md)
- [`docs/VALIDATION_27.0.0.md`](docs/VALIDATION_27.0.0.md)
- [`docs/PRODUCT_AUDIT_2026.md`](docs/PRODUCT_AUDIT_2026.md)
