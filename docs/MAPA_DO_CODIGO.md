# Mapa do código — LeadHunter Pro 27.0.0

Este documento orienta novos desenvolvedores sobre onde cada responsabilidade está localizada. Ele complementa os comentários `@fileoverview` existentes nos módulos e evita a necessidade de comentários repetitivos em cada linha.

## 1. Fluxo principal da aplicação

```text
src/server.js
  → carrega ambiente e infraestrutura
  → conecta o MongoDB
  → cria a aplicação por src/app.js
  → inicia o servidor HTTP

requisição HTTP
  → middleware de segurança/autenticação
  → rota do domínio
  → serviço/caso de uso
  → regra de domínio
  → repositório ou integração externa
  → resposta HTTP normalizada
```

## 2. Raiz do repositório

| Caminho | Responsabilidade |
|---|---|
| `package.json` | comandos, versão, dependências e engines |
| `package-lock.json` | resolução reproduzível das dependências do backend |
| `.env.example` | catálogo seguro das variáveis de ambiente |
| `render.yaml` | Blueprint de build, execução e variáveis no Render |
| `README.md` | visão geral, instalação, operação e manutenção |
| `ROADMAP.md` | sequência de evolução do produto |
| `CHANGELOG.md` | histórico de releases e alterações relevantes |
| `CONTRIBUTING.md` | processo obrigatório para contribuições |
| `.editorconfig` | formatação compartilhada entre editores |
| `.gitattributes` | normalização de texto e classificação de binários |
| `.gitignore` | proteção contra segredos, dados locais e resíduos |

## 3. Backend

### `src/server.js`

Bootstrap do processo. Deve permanecer pequeno e não conter regras de negócio. Responsabilidades esperadas:

- carregar variáveis de ambiente;
- configurar DNS quando necessário;
- conectar a infraestrutura;
- criar a aplicação;
- iniciar e encerrar o servidor com segurança;
- registrar apenas informações operacionais sem segredos.

### `src/app.js`

Application Factory do Express. Monta dependências, middlewares e rotas, mas não abre porta. Alterações neste arquivo devem ser apenas de composição.

### `src/config/`

Configuração estável e normalização de valores do ambiente.

- caminhos absolutos;
- versão da aplicação;
- limites e constantes;
- leitura segura de variáveis.

Não deve conter acesso ao banco nem chamadas HTTP externas.

### `src/domain/`

Regras puras do negócio, sem dependência de Express, Mongoose ou rede.

Principais áreas:

- leads e scoring;
- CRM e pipelines;
- planos e limites;
- omnichannel e qualificação;
- regras comerciais e normalização.

Funções de domínio devem receber dados simples e devolver dados simples, facilitando testes unitários.

### `src/services/`

Coordena casos de uso. É o local adequado para combinar repositórios, regras de domínio e integrações.

Exemplos:

- prospecção e auditoria;
- CRM avançado;
- relatórios e previsão;
- propostas e clientes;
- copiloto comercial;
- follow-up;
- reset administrativo.

### `src/repositories/`

Abstrai persistência. As rotas e regras de domínio não devem consultar Mongoose diretamente quando já existe um repositório para o contexto.

A implementação pode usar:

- MongoDB/Mongoose em produção;
- JSON local somente quando permitido em desenvolvimento;
- normalização de identificadores e datas na borda da persistência.

### `src/models/`

Schemas Mongoose. Devem representar persistência, índices e validações estruturais. Regras comerciais complexas continuam no domínio ou nos serviços.

### `src/routes/`

Contrato HTTP de cada domínio. Responsabilidades:

- validar entrada;
- aplicar autenticação, autorização e rate limit;
- chamar serviços;
- escolher status HTTP;
- impedir vazamento de erros internos.

### `src/middleware/`

Políticas transversais da camada HTTP:

- autenticação;
- autorização administrativa;
- limites de requisição;
- tratamento de erros;
- correlação e segurança.

### `src/integrations/`

Adaptadores para provedores externos. Nenhuma rota deve depender diretamente de detalhes de Groq, Gemini, OpenAI, Resend, Mercado Pago ou mensageria.

### `src/infrastructure/`

Detalhes operacionais, como conexão de banco, inicialização e recursos compartilhados do processo.

## 4. Frontend autenticado

### `public/pages/app.html`

Estrutura semântica das views autenticadas. Identificadores de DOM são contratos consumidos pelos controladores JavaScript; renomeá-los exige busca global e testes de regressão.

### `public/assets/dashboard/app.js`

Controlador principal do dashboard legado. Concentra autenticação, carregamento das views e integração com APIs. Por ser um arquivo grande, alterações devem:

1. preservar funções públicas usadas por outros módulos;
2. evitar nova regra de negócio no navegador;
3. adicionar comentários de intenção em decisões não óbvias;
4. extrair novos domínios para arquivos próprios sempre que possível;
5. receber teste de regressão.

### `public/assets/dashboard/omnichannel.js`

Central de Conversas e integração visual do domínio omnichannel. Não deve simular integração real sem identificação explícita.

### CSS do dashboard

A ordem em `public/assets/dashboard/styles.css` é deliberada:

```text
99-legacy.css
→ 00-tokens.css
→ 10-base.css
→ 20-layout.css
→ 30-components.css
→ 40-views.css
→ 45-operational-polish.css
→ 50-depth.css
→ 90-responsive.css
→ 95-top-navigation.css
```

Folhas posteriores podem refinar regras anteriores. Não use `!important` sem necessidade de compatibilidade documentada.

### `public/pages/admin.html` e `public/assets/admin/`

Painel administrativo, separado do dashboard comum. Toda ação de escrita deve permanecer protegida no backend; esconder um botão no frontend não é autorização.

## 5. Landing React

```text
frontend/landing/
  src/app/          composição e navegação
  src/features/     painéis e seções comerciais
  src/shared/       componentes reutilizáveis
  src/hooks/        estado e efeitos
  src/services/     acesso à API pública
  src/data/         conteúdo estruturado
  static/           contingência estática
```

O bundle gerado é publicado em `public/landing-react/`. Não edite manualmente esse diretório; altere a fonte e execute o build.

## 6. Testes

`tests/` contém testes unitários, integração leve, arquitetura e regressão visual estrutural.

Padrão de nome:

```text
<domínio>.test.js
<recurso>Frontend.test.js
<risco>Security.test.js
```

Uma correção de bug deve incluir um teste que falha antes da correção e passa depois dela.

## 7. Scripts de qualidade

| Script | Finalidade |
|---|---|
| `scripts/check-repository-hygiene.js` | resíduos, dados locais, codificação e segredos óbvios |
| `scripts/check-all.js` | sintaxe JavaScript |
| `scripts/check-documentation.js` | cabeçalhos e documentos obrigatórios |
| `scripts/check-architecture.js` | limites arquiteturais |
| `scripts/check-frontend.js` | contratos do frontend |
| `scripts/check-style-architecture.js` | organização dos estilos |
| `scripts/verify-landing-build.js` | artefato público da landing |
| `scripts/build.js` | build de produção e validações associadas |

## 8. Onde implementar cada tipo de mudança

| Mudança | Local principal |
|---|---|
| nova regra de score | `src/domain/` + testes |
| novo caso de uso | `src/services/` |
| nova coleção | `src/models/` + `src/repositories/` |
| novo endpoint | `src/routes/` + serviço |
| novo provedor externo | `src/integrations/` |
| nova view autenticada | `public/pages/app.html` + módulo em `public/assets/dashboard/` |
| nova seção da landing | `frontend/landing/src/features/` |
| alteração de layout global | CSS modular correspondente |
| nova variável | `.env.example`, README, Render e validação de configuração |
| migração de dados | script idempotente documentado, nunca lógica oculta no bootstrap |

## 9. Comentários no código

O projeto documenta intenção, contratos e decisões, não a tradução literal de cada instrução.

Comente quando houver:

- motivo de uma regra incomum;
- compatibilidade legada;
- risco de segurança;
- formato de integração externa;
- comportamento assíncrono não evidente;
- invariantes do domínio;
- estratégia de fallback.

Evite comentários como `incrementa contador`, pois o próprio código já comunica isso. Comentários desatualizados são mais perigosos do que ausência de comentários.

## 10. Fluxos críticos

### Prospecção

```text
formulário
→ POST /api/prospectar
→ provedor de busca
→ auditoria pública
→ scoring
→ persistência
→ CRM e recomendações
```

### CRM

```text
lead
→ pipeline configurado
→ validação de campos obrigatórios
→ atualização comercial
→ atividade na linha do tempo
→ forecast, metas e relatórios
```

### Conversas

```text
mensagem
→ normalização do provedor
→ idempotência
→ conversa e contato
→ vínculo com lead
→ agente ou humano
→ atividade comercial
```

As integrações externas reais ainda devem ser ativadas somente quando seus adaptadores, webhooks e credenciais estiverem configurados e validados.
