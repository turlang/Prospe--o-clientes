# LeadHunter Pro 25.4.0

SaaS de prospecção comercial para desenvolvedores, freelancers e agências que vendem sites, sistemas, automações e agentes de IA.

## Experiência pública em tela única

A versão 25.4.0 mantém a landing em uma interface sem rolagem de página. O documento ocupa `100dvh`, mantém `overflow: hidden` e apresenta o conteúdo em cinco painéis alternáveis:

- **Início** — proposta de valor e central de sinais;
- **Como funciona** — etapas da prospecção comercial;
- **Ferramentas** — demonstrações dos recursos do produto;
- **Para quem é** — conteúdo adaptado ao público escolhido;
- **Planos** — catálogo dinâmico publicado pelo painel administrativo.

No desktop, os painéis são acionados por abas no cabeçalho e por controles anterior/próximo. No mobile, a navegação principal fica em uma barra inferior fixa. A troca acontece sem recarregar a página e sem mover o documento.

## Resiliência da landing

O projeto:

- gera o bundle React/Tailwind quando o Vite está disponível;
- inclui uma versão estática equivalente e interativa como contingência;
- impede o retorno silencioso à landing antiga;
- envia `X-Landing-Version` e `X-Landing-Source` para diagnóstico;
- valida versão, painéis, navegação e ausência de scroll antes da release;
- preserva login, recuperação de senha, CRM, planos e painel administrativo.

## Arquitetura

```text
frontend/landing/
  src/app/                 composição da aplicação React
  src/features/            painéis comerciais por funcionalidade
  src/shared/              layout, navegação e UI reutilizável
  src/hooks/               navegação e estado assíncrono
  src/services/            acesso à API pública
  src/data/                conteúdo estático estruturado
  static/                  contingência equivalente ao bundle React

src/
  app.js                   Application Factory do Express
  server.js                bootstrap de processo e banco
  config/                  configuração e catálogo de caminhos
  domain/                  regras de negócio puras
  repositories/            persistência MongoDB/JSON
  integrations/            provedores externos
  services/                casos de uso
  routes/                  adaptadores HTTP
  middleware/              autenticação, autorização e limites
  infrastructure/          conexões e detalhes técnicos

public/
  pages/                   páginas HTML do painel
  assets/                  CSS e JavaScript por contexto
  landing-react/           artefato público versionado da landing
```

Detalhes em [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) e [`docs/CODING_STANDARDS.md`](docs/CODING_STANDARDS.md).

## Requisitos

- Node.js 20.20.2 ou versão compatível com `package.json`;
- npm 10 ou superior;
- MongoDB obrigatório em produção;
- chaves externas somente por variáveis de ambiente.

## Instalação

```bash
npm ci
npm --prefix frontend/landing install --include=dev
cp .env.example .env
npm run build
npm run quality
npm start
```

No PowerShell, copie `.env.example` manualmente quando o comando `cp` não estiver disponível.

## Comandos

| Comando | Finalidade |
|---|---|
| `npm run dev` | inicia o backend em modo watch |
| `npm run dev:landing` | inicia a landing React pelo Vite |
| `npm run build` | sincroniza contingência, tenta o bundle React e valida a release |
| `npm run build:react` | gera exclusivamente o bundle React/Tailwind |
| `npm run build:static` | sincroniza a landing estática equivalente |
| `npm run verify:landing` | bloqueia artefatos antigos ou incompletos |
| `npm run quality` | executa estrutura, documentação, frontend e testes |

## Rotas principais

- `/` — landing comercial em tela única;
- `/app` — autenticação e aplicação;
- `/admin` — painel administrativo;
- `/api/plans` — planos publicados pelo Admin;
- `/api/health` — saúde, versão da aplicação e origem da landing.

## Variáveis de produção essenciais

```env
NODE_ENV=production
REQUIRE_MONGODB=true
MONGODB_URI=mongodb+srv://...
JWT_SECRET=segredo-longo-e-aleatorio
PUBLIC_APP_URL=https://seu-servico.onrender.com
RESEND_API_KEY=re_...
MAIL_FROM=LeadHunter Pro <noreply@dominio-verificado.com>
```

Nunca publique `.env`, tokens, senhas ou dados pessoais no repositório.

## Planos sincronizados com o Admin

Os planos exibidos no painel **Planos** são carregados de `GET /api/plans`. Em produção, as alterações administrativas são persistidas no MongoDB e propagadas para abas abertas sem novo deploy. Consulte [`docs/PLANOS_DINAMICOS.md`](docs/PLANOS_DINAMICOS.md).

## Qualidade e comentários

Todos os módulos mantidos possuem `@fileoverview`. Funções públicas e decisões não óbvias recebem JSDoc ou comentários de intenção. O projeto evita comentários que apenas repetem o código, pois eles aumentam ruído e ficam desatualizados.

As regras de nomenclatura, pureza, acessibilidade, segurança, erros, testes e revisão estão em [`docs/CODING_STANDARDS.md`](docs/CODING_STANDARDS.md).

## Recuperação de senha

Para teste com `onboarding@resend.dev`, o destinatário deve ser o e-mail proprietário da conta Resend. Para usuários reais, utilize domínio verificado e configure `MAIL_FROM` no Render.

## Uso responsável

A prospecção deve respeitar legislação, privacidade, termos dos provedores e mecanismos de descadastro. Dados públicos não autorizam coleta excessiva ou disparos abusivos.
