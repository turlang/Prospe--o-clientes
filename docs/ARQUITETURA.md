# Arquitetura — LeadHunter Pro 25.3.0

## 1. Objetivos

A arquitetura prioriza separação de responsabilidades, baixo acoplamento, testabilidade, segurança por padrão, acessibilidade e deploy reproduzível.

## 2. Camadas do backend

```text
HTTP → routes → services/use cases → domain → repositories/integrations
```

- `routes`: valida o contrato HTTP, aplica políticas e serializa respostas;
- `services`: coordena casos de uso e transações lógicas;
- `domain`: regras puras, sem Express, rede ou persistência;
- `repositories`: adapta MongoDB e armazenamento JSON local;
- `integrations`: encapsula provedores externos;
- `infrastructure`: inicialização de conexões e detalhes operacionais;
- `config`: valores da aplicação e caminhos absolutos centralizados.

`src/app.js` usa Application Factory e não abre porta. `src/server.js` executa o bootstrap do processo.

## 3. Frontend público

A landing adota organização por funcionalidades:

```text
src/app          composição
src/features     painéis de apresentação e recursos comerciais
src/shared       layout, navegação e UI reutilizável
src/hooks        navegação e efeitos
src/services     acesso à API
src/data         conteúdo estático
```

### 3.1 Modelo de navegação

A página é uma aplicação de tela única:

- `html`, `body` e `#root` ocupam `100%` da viewport;
- o documento usa `overflow: hidden`;
- somente um painel fica visível por vez;
- botões semânticos alternam Início, Fluxo, Ferramentas, Público e Planos;
- o hash registra a tela ativa sem provocar scroll;
- histórico, teclado e foco permanecem funcionais;
- no mobile, a barra inferior respeita `env(safe-area-inset-bottom)`.

Conteúdo que ultrapasse a altura disponível deve ser resumido ou reorganizado, não transferido para scroll da página. Componentes internos podem usar overflow controlado apenas quando indispensável e devidamente rotulado.

### 3.2 Saídas de produção

A página pública tem duas saídas da mesma release:

1. bundle React/Tailwind produzido pelo Vite;
2. contingência estática interativa e visualmente equivalente.

O script `verify-landing-build.js` exige a versão `25.3.0`, os cinco painéis, os controles de navegação e as regras de viewport. Assim, a aplicação não volta silenciosamente para a landing antiga.

## 4. Planos dinâmicos

O painel de preços consome `GET /api/plans`. O Admin publica no MongoDB uma revisão do catálogo; a landing revalida os dados por foco, visibilidade, canal entre abas e intervalo controlado. A contingência estática usa o mesmo contrato.

## 5. Painel autenticado

As páginas ficam em `public/pages`; CSS e controladores ficam em `public/assets` separados por domínio (`dashboard`, `admin`, `auth`). O painel legado continua funcional e deve ser migrado progressivamente para componentes, sempre protegido por testes de regressão.

## 6. Fluxo de dados

- entrada externa é normalizada na borda;
- regras de negócio não dependem de objetos Express;
- persistência é acessada por repositórios;
- erros operacionais são convertidos para respostas pela camada HTTP;
- segredos são lidos somente de variáveis de ambiente.

## 7. Segurança

- autenticação JWT e verificação de usuário ativo;
- autorização administrativa separada;
- rate limit para APIs;
- Helmet/CSP, CORS explícito e limite de corpo;
- URLs públicas normalizadas;
- MongoDB obrigatório em produção;
- recuperação de senha com token de uso único e e-mail transacional;
- logs sem segredos e respostas sem detalhes internos.

## 8. Acessibilidade

- abas usam `role="tab"`, `aria-selected` e painéis associados;
- navegação por setas, Home e End no desktop;
- foco visível e ordem de tabulação previsível;
- conteúdo oculto usa o atributo `hidden`;
- animações respeitam `prefers-reduced-motion`;
- componentes críticos não dependem apenas de cor.

## 9. Decisões de compatibilidade

A CSP ainda permite handlers inline apenas no painel legado. Isso é dívida técnica registrada; código novo React não usa handlers HTML inline ou `dangerouslySetInnerHTML`.

## 10. Diagnóstico de release

`GET /api/health` informa versão e origem do artefato da landing. Respostas HTML públicas recebem `Cache-Control: no-store`, `X-Application-Version`, `X-Landing-Version` e `X-Landing-Source`.
