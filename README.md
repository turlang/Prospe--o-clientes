# LeadHunter Pro 23.7.1

Sistema web para prospecção de estabelecimentos, qualificação de leads, CRM, automação comercial, relatórios e administração de assinaturas.

## Estado da versão

A versão 23.7.1 reorganiza o projeto para facilitar manutenção e avaliação técnica:

- bootstrap separado da composição Express;
- aplicação criada pelo padrão Application Factory;
- 58 rotas agrupadas por domínio;
- módulos identificados com `@fileoverview`;
- contratos centrais documentados com JSDoc;
- requisitos, arquitetura, API, testes e rastreabilidade formalizados;
- verificação automática do padrão documental;
- pacote sem dados reais, `.env` ou `node_modules`.

## Funcionalidades

- cadastro, autenticação e recuperação de senha;
- prospecção por segmento e região;
- pontuação e priorização de oportunidades;
- CRM Kanban e histórico de interações;
- abordagens comerciais com IA e fallback local;
- campanhas, tarefas e agenda de follow-ups;
- propostas, customer success e crescimento de clientes;
- relatórios executivos e exportação CSV;
- planos Trial, Pro e Agência;
- integração com Mercado Pago;
- painel administrativo e auditoria;
- controles antiabuso e segurança de URLs.

## Arquitetura

```text
src/
  server.js                 # bootstrap: banco e porta HTTP
  app.js                    # factory: middlewares e composição
  routes/                   # adaptadores HTTP por domínio
    systemRoutes.js
    billingRoutes.js
    leadRoutes.js
    adminRoutes.js
    commercialRoutes.js
  services/                 # regras comerciais e integrações
  core/                     # Sales OS, IA, memória e automação
  middleware/               # autenticação, autorização, logs e limites
  security/                 # validação de recursos externos
  models/                   # esquemas Mongoose
  types/domain.js           # contratos JSDoc
  *Store.js                 # persistência local permitida
public/                     # interface web
scripts/                    # validações automatizadas
tests/                      # suíte node:test
docs/                       # documentação técnica e acadêmica
```

Detalhes: [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

## Requisitos de ambiente

- Node.js 20, 21 ou 22;
- npm 10 ou superior;
- MongoDB para produção;
- credenciais externas conforme as funcionalidades utilizadas.

## Instalação

```bash
npm ci
cp .env.example .env
npm run check
npm run dev
```

No Windows PowerShell, crie manualmente `.env` a partir de `.env.example` quando `cp` não estiver disponível.

Aplicação local:

```text
http://localhost:3000
```

Painel administrativo:

```text
http://localhost:3000/admin
```

## Validação

```bash
npm run check
```

O comando executa:

1. `check:syntax`: sintaxe de todos os arquivos JavaScript;
2. `check:docs`: cabeçalhos, documentos obrigatórios e limites estruturais;
3. `test`: regras de negócio, segurança, regressões e arquitetura.

## Configuração

Use `.env.example` como referência. Em produção:

- defina um `JWT_SECRET` longo e aleatório;
- configure `MONGODB_URI` e mantenha `REQUIRE_MONGODB=true`;
- defina `PUBLIC_APP_URL` e origens CORS explícitas;
- desative cobrança simulada;
- configure credenciais do Mercado Pago;
- habilite Resend para recuperação real de senha;
- não registre dados pessoais ou segredos em logs.

## Regra oficial do Trial

```text
Teste Gratuito
R$ 0
10 leads totais
CRM Kanban básico
Abordagens comerciais por templates
Follow-ups manuais
Uso único por usuário/dispositivo
```

## Documentação

| Documento | Finalidade |
|---|---|
| [`RELATORIO_ACADEMICO.md`](docs/RELATORIO_ACADEMICO.md) | texto-base para apresentação acadêmica |
| [`ESPECIFICACAO_REQUISITOS.md`](docs/ESPECIFICACAO_REQUISITOS.md) | requisitos funcionais e não funcionais |
| [`ARQUITETURA.md`](docs/ARQUITETURA.md) | camadas, fluxos e responsabilidades |
| [`API.md`](docs/API.md) | catálogo de endpoints |
| [`PLANO_DE_TESTES.md`](docs/PLANO_DE_TESTES.md) | estratégia e critérios de aceite |
| [`MATRIZ_RASTREABILIDADE.md`](docs/MATRIZ_RASTREABILIDADE.md) | relação entre requisito, código e teste |
| [`GUIA_DE_CODIGO.md`](docs/GUIA_DE_CODIGO.md) | padrão de comentários e implementação |
| [`decisoes/`](docs/decisoes/) | registros de decisões arquiteturais |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | fluxo de contribuição |

## Limitações conhecidas

`public/app.js` continua amplo por ser um controlador legado. Ele foi organizado por seções e documentado, mas sua divisão em módulos deve ocorrer de forma incremental, acompanhada por testes de interface. A CSP ainda permite handlers inline por compatibilidade; a meta futura é remover essa exceção.

## Uso responsável

A ferramenta deve ser utilizada de acordo com a legislação aplicável, termos dos provedores e boas práticas de privacidade. A existência de um dado público não autoriza mensagens abusivas, coleta excessiva ou disparos não solicitados.
