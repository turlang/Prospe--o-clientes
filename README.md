# LeadHunter Pro

**Versão atual:** 26.2.0  
**Estado:** aplicação publicada, conectada ao MongoDB e pronta para uso operacional  
**Público:** desenvolvedores, freelancers e agências que vendem sites, sistemas, automações e soluções com IA

O LeadHunter Pro é um SaaS de prospecção comercial que reúne descoberta de oportunidades, organização de leads, CRM, plano de ação, automações, relatórios, administração de planos e assistência comercial por inteligência artificial.

## Estado da release 26.2.0

A versão 26.2.0 conclui a higienização estrutural do repositório e consolida a aplicação em produção.

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
| Render | Deploy da v26.2.0 validado |
| Qualidade automatizada | 172 testes aprovados na validação da release |

Os logs de produção confirmaram respostas válidas para a landing, aplicação, painel administrativo, planos, leads, relatórios, uso, segurança e auditoria. Assets públicos e administrativos estão versionados com `26.2.0`.

## Funcionalidades principais

### Prospecção e CRM

- cadastro, edição, classificação e movimentação de leads;
- funil comercial com sete etapas canônicas;
- histórico de pesquisas e oportunidades;
- tarefas, lembretes e follow-ups;
- priorização de oportunidades;
- plano de ação diário;
- visão executiva com conversão e receita potencial.

### Inteligência comercial

- geração de abordagens comerciais personalizadas;
- sugestões de próximos passos;
- leitura de gargalos do pipeline;
- recomendações de follow-up;
- suporte a Groq, Gemini ou OpenAI por variável de ambiente;
- motor local de contingência quando um provedor externo não estiver disponível.

### Administração

- visão geral de usuários, uso, planos e segurança;
- configuração dinâmica dos planos Trial, Pro e Agência;
- persistência das configurações no MongoDB;
- registros de auditoria administrativa;
- indicadores de uso e limites;
- acesso protegido por autenticação e autorização administrativa.

### Experiência pública

A landing ocupa uma única viewport e troca o conteúdo sem rolagem da página. Os painéis disponíveis são:

- **Início**;
- **Como funciona**;
- **Ferramentas**;
- **Para quem é**;
- **Planos**.

No desktop, a navegação ocorre pelo cabeçalho e pelos controles sequenciais. No mobile, a navegação principal utiliza uma barra inferior fixa.

## Interface e design system

A aplicação utiliza um design system modular com:

- tokens de cor, tipografia, espaçamento e elevação;
- módulos CSS separados por responsabilidade;
- componentes responsivos para desktop, tablet e celular;
- profundidade 3D discreta em dispositivos compatíveis;
- versão estática para touch e preferência por movimento reduzido;
- gráficos construídos com HTML e CSS, sem biblioteca adicional obrigatória.

A documentação visual está em [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).

## Arquitetura

```text
frontend/landing/
  src/app/                 composição da landing React
  src/features/            painéis comerciais
  src/shared/              layout, navegação e componentes reutilizáveis
  src/hooks/               estado e navegação
  src/services/            comunicação com a API pública
  src/data/                conteúdo estruturado
  static/                  contingência equivalente ao bundle React

src/
  app.js                   Application Factory do Express
  server.js                bootstrap, configuração e conexão com o banco
  config/                  variáveis, caminhos e configuração
  domain/                  regras de negócio puras
  repositories/            persistência MongoDB e contingência local
  integrations/            IA, e-mail, pagamento e provedores externos
  services/                casos de uso
  routes/                  adaptadores HTTP
  middleware/              autenticação, autorização e limites
  infrastructure/          conexões e detalhes técnicos

public/
  pages/                   páginas HTML da aplicação
  assets/                  CSS e JavaScript por contexto
  landing-react/           build público versionado

tests/                     testes de unidade, integração e regressão
scripts/                   build, validação e gates de qualidade
```

Consulte também:

- [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md)
- [`docs/CODING_STANDARDS.md`](docs/CODING_STANDARDS.md)
- [`docs/PLANOS_DINAMICOS.md`](docs/PLANOS_DINAMICOS.md)
- [`ROADMAP.md`](ROADMAP.md)
- [`CHANGELOG.md`](CHANGELOG.md)

## Tecnologias

- Node.js 20;
- Express;
- MongoDB Atlas e Mongoose;
- React e Vite na landing;
- JavaScript CommonJS no backend;
- JWT e bcryptjs;
- Helmet e CORS;
- Resend para e-mail transacional;
- Mercado Pago para cobrança;
- Groq, Gemini ou OpenAI para inteligência comercial.

## Requisitos

- Node.js `>=20.19 <23`;
- npm 10 ou superior;
- MongoDB obrigatório em produção;
- variáveis externas configuradas fora do repositório.

## Instalação local

```bash
npm ci
npm --prefix frontend/landing install --include=dev
cp .env.example .env
npm run build
npm run quality
npm start
```

No PowerShell:

```powershell
Copy-Item .env.example .env
npm ci
npm --prefix frontend/landing install --include=dev
npm run build
npm run quality
npm start
```

A aplicação usa `http://localhost:3000` por padrão.

## Comandos disponíveis

| Comando | Finalidade |
|---|---|
| `npm start` | inicia a aplicação |
| `npm run dev` | inicia o backend em modo watch |
| `npm run dev:landing` | inicia a landing pelo Vite |
| `npm run build` | gera e valida os artefatos de produção |
| `npm run build:react` | gera exclusivamente o bundle React |
| `npm run build:static` | sincroniza a landing estática |
| `npm run verify:landing` | valida versão, origem e estrutura da landing |
| `npm run check:syntax` | verifica a sintaxe dos arquivos JavaScript |
| `npm run check:architecture` | valida a organização arquitetural |
| `npm run check:frontend` | valida a estrutura do frontend |
| `npm run check:styles` | valida a arquitetura dos estilos |
| `npm run check:docs` | valida a documentação obrigatória |
| `npm test` | executa os testes automatizados |
| `npm run quality` | executa todos os gates e testes |

## Rotas principais

| Rota | Finalidade |
|---|---|
| `/` | landing comercial |
| `/app` | autenticação e aplicação principal |
| `/admin` | painel administrativo |
| `/api/health` | saúde, versão e origem da landing |
| `/api/plans` | catálogo público de planos |
| `/api/leads` | gestão de leads autenticada |
| `/api/reports/commercial` | relatório comercial |
| `/api/billing/usage` | consumo e limites do plano |

## Configuração de ambiente

Copie `.env.example` para `.env` e configure somente os serviços utilizados.

### Produção essencial

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

### E-mail de recuperação

```env
RESEND_API_KEY=re_...
MAIL_FROM=LeadHunter Pro <noreply@seu-dominio-verificado.com>
EXPOSE_PASSWORD_RESET_LINK=false
```

Para enviar a usuários reais, o domínio usado em `MAIL_FROM` deve estar verificado no Resend.

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

Também podem ser configurados Gemini ou OpenAI pelas variáveis disponíveis em `.env.example`.

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

Nunca publique `.env`, tokens, senhas, chaves de API, dados de usuários ou arquivos reais da pasta `data`.

## Banco de dados

Em produção, `REQUIRE_MONGODB=true` impede que a aplicação inicie usando persistência local acidentalmente.

As principais coleções incluem:

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

Índices e regras de persistência são inicializados pela camada de repositórios e infraestrutura.

## Deploy no Render

Configuração recomendada:

```text
Runtime: Node
Build Command: npm ci && npm run build
Start Command: npm start
Health Check Path: /api/health
```

Depois de uma mudança estrutural ou troca completa de versão, utilize **Clear build cache & deploy** para evitar a reutilização de artefatos antigos.

## Validação de produção

A release 26.2.0 já teve os seguintes fluxos básicos confirmados:

- carregamento da landing;
- carregamento da aplicação autenticada;
- carregamento do painel administrativo;
- leitura de usuários, planos, segurança e auditoria;
- leitura de leads e relatório comercial;
- leitura de uso e limites;
- persistência no MongoDB Atlas.

Antes de uma operação comercial com cobrança real, execute também:

1. recuperação de senha com destinatário real e domínio verificado;
2. pagamento de teste completo no Mercado Pago;
3. confirmação do webhook e da atualização do plano;
4. geração de uma abordagem pelo provedor de IA configurado;
5. reinicialização do serviço para confirmar a persistência dos dados.

Esses itens são validações operacionais do ambiente, não bloqueios de código da v26.2.0.

## Segurança

O projeto inclui:

- senhas protegidas com bcrypt;
- autenticação JWT com issuer e audience;
- autorização administrativa;
- Helmet e política de segurança de conteúdo;
- CORS configurável;
- limites contra abuso;
- proteção de URLs públicas;
- auditoria administrativa;
- exclusão de segredos e dados locais pelo `.gitignore`;
- testes de regressão de autenticação e segurança.

## Higiene do repositório

A versão 26.2.0 removeu:

- arquivos pertencentes a outros projetos;
- módulos antigos duplicados;
- páginas públicas obsoletas;
- componentes React inacessíveis;
- artefatos legados que poderiam retornar ao deploy.

Os gates arquiteturais e os testes de higiene impedem a reintrodução desses arquivos.

## Roadmap

O escopo funcional planejado até a IA comercial foi entregue. As próximas etapas estão direcionadas a:

- validação comercial ponta a ponta;
- observabilidade e desempenho;
- white label;
- equipes e multiempresa;
- permissões avançadas.

O planejamento atualizado está em [`ROADMAP.md`](ROADMAP.md).

## Uso responsável

A prospecção deve respeitar a legislação aplicável, a privacidade, os termos dos provedores, a finalidade dos dados e os mecanismos de descadastro. A existência de informações públicas não autoriza coleta excessiva, enriquecimento indevido ou disparos abusivos.
