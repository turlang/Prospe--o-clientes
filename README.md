# LeadHunter Pro

> Sistema operacional comercial para encontrar empresas com deficiência digital, priorizar oportunidades, conduzir o relacionamento e organizar receita em um CRM 360.

**Versão:** 27.0.0  
**Estado:** aplicação publicada; CRM 360 operacional; Central de Conversas em modo demonstrativo  
**Público principal:** freelancers, desenvolvedores, agências e pequenas equipes B2B que vendem sites, sistemas, automações e soluções com IA  
**Produção:** `https://prospe-o-clientes.onrender.com/`

## Sumário

- [Visão geral](#visão-geral)
- [Proposta de valor](#proposta-de-valor)
- [Estado dos módulos](#estado-dos-módulos)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Tecnologias](#tecnologias)
- [Requisitos](#requisitos)
- [Instalação local](#instalação-local)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Comandos](#comandos)
- [Rotas principais](#rotas-principais)
- [Banco de dados](#banco-de-dados)
- [Qualidade e testes](#qualidade-e-testes)
- [Segurança](#segurança)
- [Deploy no Render](#deploy-no-render)
- [Diagnóstico e solução de problemas](#diagnóstico-e-solução-de-problemas)
- [Limitações atuais](#limitações-atuais)
- [Documentação](#documentação)
- [Contribuição](#contribuição)
- [Uso responsável](#uso-responsável)

## Visão geral

O LeadHunter Pro reúne em uma única aplicação:

```text
prospecção
→ auditoria digital
→ priorização
→ abordagem comercial
→ CRM 360
→ tarefas e follow-ups
→ conversas
→ propostas
→ clientes
→ relatórios e receita
```

O produto foi desenhado para reduzir o tempo entre encontrar uma empresa e executar a próxima ação comercial. Em vez de funcionar apenas como um cadastro genérico de contatos, ele conecta sinais públicos da presença digital ao serviço que o vendedor pode oferecer.

## Proposta de valor

O principal diferencial é transformar deficiência digital em oportunidade comercial explicável.

Exemplos:

- site ausente ou desatualizado;
- experiência ruim no celular;
- ausência de formulário ou WhatsApp claro;
- baixa presença digital;
- oportunidade de modernização;
- necessidade de automação ou captação de leads.

A plataforma combina essas evidências com score, serviço sugerido, faixa comercial, abordagem e próxima ação.

## Estado dos módulos

| Módulo | Estado | Observação |
|---|---|---|
| Landing comercial | Operacional | React/Vite com contingência estática |
| Cadastro, login e sessão | Operacional | JWT, bcrypt e controle de usuário ativo |
| Recuperação de senha | Implementada | envio real depende de Resend e domínio verificado |
| Prospecção | Operacional | Google Places e auditoria pública configuráveis |
| CRM 360 | Operacional | pipelines, Kanban, lista, metas, forecast e importação |
| Visão executiva | Operacional | funil, receita ponderada, gargalos e conversão |
| Central de Inteligência | Operacional | plano de ação e copiloto comercial |
| Tarefas e follow-ups | Operacional | agenda, atrasos e prioridade |
| Propostas e clientes | Operacional | geração assistida e carteira comercial |
| Relatórios | Operacional | indicadores, segmentos e oportunidades paradas |
| Planos e limites | Operacional | Trial, Pro e Agência configuráveis |
| Pagamentos | Estrutura pronta | produção depende de credenciais e webhook do Mercado Pago |
| Painel administrativo | Operacional | usuários, planos, segurança, economia e auditoria |
| Central de Conversas | Demonstração funcional | canais externos reais ainda não estão ativados |
| Agente SDR | Fundação implementada | operação real depende de canal e provedor configurados |
| WhatsApp oficial | Pendente | Meta Cloud API ainda será integrada |
| Gmail/Outlook e calendário | Pendente | previstos no roadmap |

## Funcionalidades

### Prospecção e auditoria

- busca de empresas por segmento e região;
- coleta por provedor configurável;
- auditoria de site público;
- identificação de dores digitais;
- score de oportunidade;
- serviço recomendado;
- abordagem comercial sugerida;
- armazenamento no CRM;
- histórico das pesquisas.

### CRM 360

- múltiplos pipelines;
- etapas configuráveis;
- probabilidade por etapa;
- campos obrigatórios antes da movimentação;
- campos personalizados;
- filtros salvos;
- visualizações Kanban e Lista;
- catálogo de produtos e serviços;
- valor de contrato;
- receita recorrente;
- valor fechado;
- motivos estruturados de perda;
- metas mensais e trimestrais;
- previsão ponderada;
- importação CSV com prévia e mapeamento;
- deduplicação;
- exportação completa;
- reativação de oportunidades;
- histórico comercial aditivo.

### Inteligência comercial

- plano de ação diário;
- prioridade do momento;
- identificação de gargalo;
- leads sem avanço;
- próximas ações;
- geração de abordagem;
- geração de proposta;
- copiloto com contexto do CRM;
- suporte a Groq, Gemini e OpenAI;
- fallback local quando o provedor externo estiver indisponível.

### Conversas e omnichannel

- caixa de entrada;
- histórico por contato;
- vínculo com lead;
- mensagens não lidas;
- notas internas;
- transferência entre IA, híbrido e humano;
- registro de atividade comercial;
- playground seguro;
- contratos desacoplados para IA e mensageria;
- criptografia de credenciais de integração.

O módulo atual usa provedor demonstrativo e não deve ser apresentado como canal externo real.

### Administração

- usuários ativos;
- assinantes e distribuição de planos;
- uso de leads;
- receita e pagamentos;
- edição do catálogo de planos;
- promoção e suspensão de usuários;
- auditoria administrativa;
- segurança e antiabuso;
- reinicialização protegida do banco;
- diagnóstico do ambiente.

## Arquitetura

Fluxo principal:

```text
HTTP
→ middleware
→ routes
→ services/use cases
→ domain
→ repositories/integrations
→ MongoDB ou provedor externo
```

Princípios:

- regras de negócio fora do Express;
- persistência atrás de repositórios;
- provedores externos atrás de contratos;
- segredos somente no ambiente;
- isolamento por usuário;
- Application Factory testável;
- bootstrap separado da aplicação;
- módulos documentados com `@fileoverview`;
- testes de regressão para bugs corrigidos;
- build e deploy reproduzíveis.

Leia [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) e [`docs/MAPA_DO_CODIGO.md`](docs/MAPA_DO_CODIGO.md).

## Estrutura de pastas

```text
.
├── frontend/landing/          landing React e contingência estática
├── public/
│   ├── pages/                 HTML da aplicação e do admin
│   ├── assets/dashboard/      controlador e CSS modular do dashboard
│   ├── assets/admin/          controlador e tema administrativo
│   └── landing-react/         bundle gerado da landing
├── src/
│   ├── app.js                 Application Factory
│   ├── server.js              bootstrap do processo
│   ├── config/                configuração e caminhos
│   ├── domain/                regras puras
│   ├── services/              casos de uso
│   ├── repositories/          persistência
│   ├── models/                schemas Mongoose
│   ├── routes/                contratos HTTP
│   ├── middleware/            políticas HTTP
│   ├── integrations/          IA, e-mail, billing e mensageria
│   └── infrastructure/        conexões e inicialização técnica
├── scripts/                   build e gates de qualidade
├── tests/                     testes automatizados
├── docs/                      documentação técnica e de produto
├── render.yaml                Blueprint do Render
├── .env.example               catálogo de configuração
└── package.json               comandos e dependências
```

## Tecnologias

### Backend

- Node.js 20;
- Express 4;
- MongoDB Atlas;
- Mongoose 8;
- JWT;
- bcryptjs;
- Helmet;
- CORS;
- Fast CSV.

### Frontend

- HTML semântico;
- JavaScript modular;
- CSS modular;
- React;
- Vite;
- Tailwind na landing;
- gráficos construídos sem dependência obrigatória de biblioteca externa.

### Integrações

- Google Places;
- Groq;
- Gemini;
- OpenAI;
- Resend;
- Mercado Pago;
- contratos preparados para Meta Cloud API, Evolution API e UaiZapi.

## Requisitos

- Node.js `>=20.19 <23`;
- npm `>=10`;
- MongoDB para produção;
- Git;
- variáveis de ambiente configuradas fora do repositório.

## Instalação local

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

Endereço padrão:

```text
http://localhost:3000
```

Páginas:

```text
/        landing
/app     aplicação autenticada
/admin   administração
```

## Variáveis de ambiente

Use `.env.example` como fonte de verdade. Não publique `.env`.

### Aplicação e banco

| Variável | Obrigatória | Descrição |
|---|---:|---|
| `PORT` | não | porta HTTP, padrão 3000 |
| `NODE_ENV` | produção | ambiente da aplicação |
| `REQUIRE_MONGODB` | produção | bloqueia fallback local |
| `MONGODB_URI` | produção | conexão MongoDB |
| `DNS_SERVERS` | não | resolvers alternativos separados por vírgula |
| `PUBLIC_APP_URL` | produção | URL pública usada em links e callbacks |
| `CORS_ORIGINS` | produção | origens adicionais permitidas |
| `APP_NAME` | não | nome exibido e usado em integrações |

### Autenticação

| Variável | Obrigatória | Descrição |
|---|---:|---|
| `JWT_SECRET` | sim | segredo longo e exclusivo |
| `JWT_EXPIRES_IN` | não | duração do token |
| `JWT_ISSUER` | sim | emissor esperado |
| `JWT_AUDIENCE` | sim | audiência esperada |
| `REGISTER_IP_DAILY_LIMIT` | não | limite diário de cadastros por IP |

### Prospecção

| Variável | Obrigatória | Descrição |
|---|---:|---|
| `GOOGLE_PLACES_API_KEY` | para busca real | chave do Google Places |
| `PLACES_PROVIDER` | não | versão/adaptador do provedor |
| `ALLOW_INCOMPLETE_CONTACTS` | não | aceita contatos sem dados mínimos |
| `AUDIT_WEBSITES` | não | habilita auditoria pública |

### Recuperação de senha

| Variável | Obrigatória | Descrição |
|---|---:|---|
| `RESEND_API_KEY` | produção | chave da conta Resend |
| `MAIL_FROM` | produção | remetente com domínio verificado |
| `EXPOSE_PASSWORD_RESET_LINK` | somente desenvolvimento | devolve link de teste no navegador |

### Inteligência artificial

| Variável | Obrigatória | Descrição |
|---|---:|---|
| `AI_PROVIDER` | não | `groq`, `gemini` ou `openai` |
| `GROQ_API_KEY` | por provedor | chave Groq |
| `GROQ_MODEL` | não | modelo Groq |
| `GEMINI_API_KEY` | por provedor | chave Gemini |
| `GEMINI_MODEL` | não | modelo Gemini |
| `GEMINI_AUTO_MODEL` | não | procura alternativa compatível |
| `OPENAI_API_KEY` | por provedor | chave OpenAI |
| `OPENAI_APPROACH_MODEL` | não | modelo OpenAI |
| `AI_APPROACHES_ENABLED` | não | habilita geração externa |
| `AI_APPROACH_TIMEOUT_MS` | não | timeout da chamada |
| `AI_APPROACH_TEMPERATURE` | não | variação das respostas |
| `AI_MAX_TOKENS` | não | limite de saída |

### Omnichannel

| Variável | Obrigatória | Descrição |
|---|---:|---|
| `INTEGRATION_ENCRYPTION_KEY` | produção | chave independente usada para criptografar credenciais |

### Billing

| Variável | Obrigatória | Descrição |
|---|---:|---|
| `ALLOW_SIMULATED_BILLING` | desenvolvimento | nunca habilitar em produção |
| `MERCADO_PAGO_PUBLIC_KEY` | produção | chave pública |
| `MERCADO_PAGO_ACCESS_TOKEN` | produção | token privado |
| `MERCADO_PAGO_SUCCESS_URL` | produção | retorno aprovado |
| `MERCADO_PAGO_FAILURE_URL` | produção | retorno recusado |
| `MERCADO_PAGO_PENDING_URL` | produção | retorno pendente |
| `MERCADO_PAGO_WEBHOOK_URL` | produção | endpoint público do webhook |
| `PLAN_DURATION_DAYS` | não | duração padrão do ciclo |

## Comandos

| Comando | Finalidade |
|---|---|
| `npm start` | inicia em modo de produção |
| `npm run dev` | backend com watch |
| `npm run dev:landing` | landing React pelo Vite |
| `npm run build` | gera e valida artefatos |
| `npm run build:react` | gera bundle React |
| `npm run build:static` | sincroniza contingência estática |
| `npm run check:hygiene` | procura resíduos, dados locais e segredos óbvios |
| `npm run check:syntax` | valida sintaxe JavaScript |
| `npm run check:docs` | valida módulos e documentos obrigatórios |
| `npm run check:architecture` | valida limites arquiteturais |
| `npm run check:frontend` | valida contratos do frontend |
| `npm run check:styles` | valida arquitetura CSS |
| `npm run verify:landing` | valida o artefato público |
| `npm test` | executa a suíte automatizada |
| `npm run quality` | executa todos os gates obrigatórios |

## Rotas principais

### Públicas

| Método | Rota | Finalidade |
|---|---|---|
| `GET` | `/` | landing |
| `GET` | `/app` | aplicação principal |
| `GET` | `/admin` | painel administrativo |
| `GET` | `/api/health` | versão, banco, landing e commit implantado |
| `GET` | `/api/plans` | catálogo público de planos |
| `POST` | `/api/auth/register` | cadastro |
| `POST` | `/api/auth/login` | login |
| `POST` | `/api/auth/forgot-password` | solicitação de recuperação |

### Autenticadas

| Grupo | Exemplos |
|---|---|
| Leads | `/api/leads`, `/api/prospectar` |
| CRM 360 | `/api/crm/config`, `/api/crm/leads`, `/api/crm/forecast`, `/api/crm/reports` |
| Importação | `/api/crm/import/preview`, `/api/crm/import` |
| Conversas | `/api/omnichannel/conversations` |
| Agentes | `/api/omnichannel/agents` |
| Relatórios | `/api/reports/commercial` |
| Billing | `/api/billing/usage` |
| Propostas | `/api/proposals` |
| Clientes | `/api/customers` |

Consulte [`docs/API.md`](docs/API.md) para contratos detalhados.

## Banco de dados

Principais coleções e contextos:

### Núcleo

- `users`;
- `leads`;
- `tasks`;
- `searchhistories`;
- `usages`;
- `plan_configurations`;
- `payments`;
- `passwordresets`;
- `adminauditlogs`;
- `trialguards`;
- `copilotconversations`.

### CRM 360

- configuração de pipelines;
- campos personalizados;
- metas;
- catálogo;
- atividades comerciais;
- dados comerciais anexados aos leads.

### Omnichannel

- `conversations`;
- `messages`;
- `messagingintegrations`;
- `agentconfigurations`;
- `agentconfigurationversions`;
- `agentsessions`;
- `agentevaluations`;
- `leadqualifications`;
- `crmactivities`;
- `followuppolicies`;
- `followupexecutions`;
- `integrationevents`;
- `webhookevents`;
- `demoworkspaces`.

Os nomes físicos podem seguir a pluralização do Mongoose.

Em produção, mantenha:

```env
REQUIRE_MONGODB=true
```

Isso impede que o serviço inicie silenciosamente usando persistência local.

## Qualidade e testes

O pipeline verifica:

1. higiene do repositório;
2. sintaxe;
3. documentação dos módulos;
4. arquitetura;
5. contratos do frontend;
6. organização dos estilos;
7. build da landing;
8. testes automatizados.

Execute antes de todo push:

```bash
npm run quality
```

A suíte inclui testes de:

- autenticação e autorização;
- segurança;
- planos e limites;
- scoring;
- CRM;
- importação e forecast;
- omnichannel;
- frontend;
- estilos;
- deploy e metadados;
- regressões visuais estruturais.

## Segurança

Medidas atuais:

- senhas com bcrypt;
- JWT com issuer e audience;
- verificação de usuário ativo;
- autorização administrativa;
- Helmet e CSP;
- CORS configurável;
- rate limit;
- limite de body;
- MongoDB obrigatório em produção;
- tokens de recuperação de uso único;
- credenciais de integração criptografadas;
- isolamento de dados por proprietário;
- mascaramento de segredos;
- logs sem credenciais;
- auditoria administrativa;
- gate automático de higiene.

Leia [`docs/SEGURANCA_E_HIGIENE.md`](docs/SEGURANCA_E_HIGIENE.md).

## Deploy no Render

O Blueprint está em `render.yaml`.

Configuração esperada:

```text
Runtime: Node
Branch: main
Build: npm ci --omit=dev ... && npm run build
Start: npm start
Health check: /api/health
Auto deploy: ativo
```

Fluxo de publicação:

```text
branch
→ pull request
→ npm run quality
→ merge na main
→ Render
→ /api/health
→ smoke test
```

O `/api/health` expõe o commit e a branch fornecidos pelo Render. Uma entrega só deve ser considerada publicada quando o commit esperado aparecer no endpoint e o fluxo tiver sido conferido na interface.

Depois de mudanças de CSS ou JavaScript, faça recarga forçada com `Ctrl + F5`.

## Diagnóstico e solução de problemas

### O Render mostra código antigo

1. confirme o commit Live;
2. consulte `/api/health`;
3. confirme o parâmetro de versão do asset;
4. use `Ctrl + F5`;
5. use `Clear build cache & deploy` somente se necessário.

### O serviço demora para responder

A instância gratuita pode desligar por inatividade. A primeira requisição após o período ocioso pode demorar.

### MongoDB não conecta

Verifique:

- `MONGODB_URI`;
- Network Access no Atlas;
- usuário e senha;
- DNS;
- `REQUIRE_MONGODB`;
- logs de inicialização sem copiar a URI.

### Recuperação de senha não envia

Verifique:

- `RESEND_API_KEY`;
- domínio verificado;
- `MAIL_FROM`;
- `PUBLIC_APP_URL`;
- destinatário permitido pela conta.

### IA usa motor local

Verifique chave, provedor, modelo, timeout e disponibilidade externa. O fallback é intencional e deve continuar claramente identificado.

### Pipeline financeiro aparece inflado

Valores textuais em faixa devem ser normalizados pelo serviço de CRM. Não converta `R$ 3.000 a R$ 15.000` removendo todos os caracteres, pois isso concatenaria os extremos.

### Interface continua com scroll interno

Busque regras de `overflow`, `max-height` e containers aninhados. A Visão Geral usa rolagem natural da página, não rolagem interna.

## Limitações atuais

- Central de Conversas ainda usa modo demonstrativo;
- WhatsApp real ainda não foi ativado;
- Gmail, Outlook e calendário ainda não estão integrados;
- automação visual ainda está no roadmap;
- multiempresa e permissões avançadas ainda não foram entregues;
- scoring ainda será separado em Fit, Opportunity, Reachability, Intent e Close;
- pagamentos reais precisam de validação completa no ambiente do proprietário;
- recuperação de senha depende de remetente verificado.

Consulte [`ROADMAP.md`](ROADMAP.md).

## Documentação

| Documento | Conteúdo |
|---|---|
| [`docs/GUIA_DO_DESENVOLVEDOR.md`](docs/GUIA_DO_DESENVOLVEDOR.md) | instalação, fluxo de trabalho e diagnóstico |
| [`docs/MAPA_DO_CODIGO.md`](docs/MAPA_DO_CODIGO.md) | responsabilidade de diretórios e módulos |
| [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) | camadas e decisões técnicas |
| [`docs/CODING_STANDARDS.md`](docs/CODING_STANDARDS.md) | convenções de código |
| [`docs/SEGURANCA_E_HIGIENE.md`](docs/SEGURANCA_E_HIGIENE.md) | segredos, dados e sanitização |
| [`docs/API.md`](docs/API.md) | contratos HTTP |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | tokens, componentes e estilos |
| [`docs/PLANOS_DINAMICOS.md`](docs/PLANOS_DINAMICOS.md) | catálogo e persistência de planos |
| [`docs/RELEASE_27.0.0.md`](docs/RELEASE_27.0.0.md) | escopo da release |
| [`docs/VALIDATION_27.0.0.md`](docs/VALIDATION_27.0.0.md) | evidências técnicas |
| [`docs/PRODUCT_AUDIT_2026.md`](docs/PRODUCT_AUDIT_2026.md) | auditoria estratégica |
| [`ROADMAP.md`](ROADMAP.md) | evolução planejada |
| [`CHANGELOG.md`](CHANGELOG.md) | histórico |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | regras de contribuição |

## Contribuição

Antes de abrir um PR:

```bash
git status
git diff --check
npm run quality
```

A descrição deve informar:

- problema;
- solução;
- contratos afetados;
- testes;
- risco de dados e segurança;
- evidência visual quando houver interface;
- rollback.

Leia [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Uso responsável

A prospecção deve respeitar:

- LGPD e legislação aplicável;
- privacidade;
- termos dos provedores;
- mecanismos de descadastro;
- limites de contato;
- reputação dos canais;
- uso proporcional de dados públicos.

Dados públicos não autorizam coleta excessiva, perfilamento abusivo ou disparos indiscriminados.
