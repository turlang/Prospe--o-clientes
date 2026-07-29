# LeadHunter Pro 25.0.0

SaaS de prospecção comercial para desenvolvedores, freelancers e agências que vendem sites, sistemas, automações e agentes de IA.

## O que mudou na versão 25

A versão corrige a causa de a landing antiga continuar em produção. O pacote anterior não continha o bundle React e o servidor servia silenciosamente um HTML legado. Agora o projeto:

- inclui uma landing comercial versionada em `public/landing-react`;
- gera o bundle React/Tailwind quando o Vite está disponível;
- mantém uma landing estática equivalente como contingência segura;
- interrompe a validação quando a versão ou as seções obrigatórias não estão presentes;
- envia cabeçalhos `X-Landing-Version` e `X-Landing-Source` para diagnóstico;
- organiza backend, frontend, páginas e assets por responsabilidade;
- preserva login, recuperação de senha, CRM, planos e painel administrativo.

## Arquitetura

```text
frontend/landing/
  src/app/                 composição da aplicação React
  src/features/            seções comerciais por funcionalidade
  src/shared/              componentes reutilizáveis
  src/hooks/               estado assíncrono da interface
  src/services/            acesso à API pública
  src/data/                conteúdo estático tipado por estrutura
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

- `/` — landing comercial;
- `/app` — autenticação e aplicação;
- `/admin` — painel administrativo;
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

## Qualidade e comentários

Todos os módulos mantidos possuem `@fileoverview`. Funções públicas e decisões não óbvias recebem JSDoc ou comentários de intenção. O projeto não comenta cada linha: comentários que apenas repetem o código são evitados porque aumentam ruído e ficam desatualizados.

As regras completas de nomenclatura, pureza, acessibilidade, segurança, erros, testes e revisão estão em [`docs/CODING_STANDARDS.md`](docs/CODING_STANDARDS.md).

## Recuperação de senha

Para teste com `onboarding@resend.dev`, o destinatário deve ser o e-mail proprietário da conta Resend. Para usuários reais, utilize domínio verificado e configure `MAIL_FROM` no Render.

## Uso responsável

A prospecção deve respeitar legislação, privacidade, termos dos provedores e mecanismos de descadastro. Dados públicos não autorizam coleta excessiva ou disparos abusivos.
