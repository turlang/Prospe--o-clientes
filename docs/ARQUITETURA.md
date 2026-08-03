# Arquitetura — LeadHunter Pro 27.0.0

## 1. Objetivos

A arquitetura prioriza:

- separação de responsabilidades;
- baixo acoplamento;
- regras de negócio testáveis;
- segurança por padrão;
- isolamento de dados;
- integração externa substituível;
- acessibilidade;
- deploy reproduzível;
- evolução incremental sem interromper a produção.

## 2. Visão geral

```text
cliente web
→ Express
→ middleware
→ routes
→ services/use cases
→ domain
→ repositories / integrations
→ MongoDB / serviços externos
```

`src/app.js` é uma Application Factory: monta a aplicação e suas dependências, mas não abre porta. `src/server.js` executa o bootstrap do processo, conecta infraestrutura e inicia o servidor.

## 3. Camadas do backend

### `routes`

Responsável pelo contrato HTTP:

- validação de entrada;
- autenticação e autorização;
- rate limit;
- chamada do caso de uso;
- status HTTP;
- serialização segura.

Rotas não devem conter regra comercial extensa nem acesso direto a provedores externos.

### `services`

Coordena casos de uso e combina regras, persistência e integrações.

Exemplos:

- prospecção;
- auditoria digital;
- CRM avançado;
- relatórios;
- propostas;
- clientes;
- copiloto;
- omnichannel;
- reset administrativo.

### `domain`

Regras puras, sem Express, Mongoose, filesystem ou rede.

Responsabilidades atuais:

- scoring;
- normalização de leads;
- pipelines e configuração CRM;
- qualificação;
- políticas de agentes;
- regras de planos;
- cálculos comerciais.

### `repositories`

Abstrai persistência e normaliza o acesso ao banco.

- MongoDB/Mongoose é a fonte de verdade em produção;
- armazenamento local existe somente para desenvolvimento quando permitido;
- dados sempre são filtrados pelo proprietário;
- detalhes de schema não vazam para a camada HTTP.

### `models`

Schemas, índices e validações estruturais do MongoDB. Regras de negócio complexas permanecem no domínio e nos serviços.

### `integrations`

Adaptadores para serviços externos:

- IA;
- e-mail;
- pagamentos;
- mensageria.

Controllers e serviços dependem de contratos, não de detalhes específicos de cada provedor.

### `middleware`

Políticas transversais:

- autenticação;
- autorização;
- limites;
- correlação;
- tratamento de erros;
- segurança HTTP.

### `config` e `infrastructure`

`config` centraliza valores estáveis, caminhos e normalização de ambiente. `infrastructure` contém conexões e detalhes operacionais do processo.

## 4. Domínios principais

### Leads e prospecção

```text
busca
→ normalização
→ auditoria pública
→ scoring
→ persistência
→ recomendação comercial
```

### CRM 360

```text
lead
→ pipeline ativo
→ etapa
→ requisitos obrigatórios
→ dados comerciais
→ atividade
→ forecast e metas
```

O CRM adiciona dados ao lead existente em vez de criar uma entidade comercial paralela incompatível.

### Omnichannel

```text
provedor
→ evento normalizado
→ fingerprint e idempotência
→ conversa/mensagem
→ contato e lead
→ agente ou humano
→ atividade CRM
```

O modo demonstrativo é isolado e deve permanecer claramente identificado. Credenciais reais são criptografadas com chave independente do JWT.

### Planos e billing

Catálogo de planos, consumo, pagamentos e limites usam contratos compartilhados entre landing, aplicação e admin. Alterações feitas no painel administrativo são persistidas e publicadas sem novo deploy.

## 5. Frontend público

A landing segue organização por funcionalidade:

```text
frontend/landing/src/app       composição
frontend/landing/src/features  painéis comerciais
frontend/landing/src/shared    layout e UI reutilizável
frontend/landing/src/hooks     estado e navegação
frontend/landing/src/services  API pública
frontend/landing/src/data      conteúdo estruturado
```

### Navegação

- uma seção principal é exibida por vez;
- hash e histórico preservam a tela ativa;
- teclado e foco permanecem funcionais;
- mobile respeita safe areas;
- a página evita scroll documental quando o contrato visual exige uma viewport única.

### Saídas

1. bundle React/Vite;
2. contingência estática equivalente.

`public/landing-react/` é gerado. A fonte deve ser alterada em `frontend/landing/`.

## 6. Frontend autenticado

A aplicação autenticada usa HTML semântico, JavaScript progressivamente modular e CSS por responsabilidade.

```text
public/pages/app.html
public/assets/dashboard/app.js
public/assets/dashboard/omnichannel.js
public/assets/dashboard/css/
```

IDs de DOM são contratos consumidos pelos controladores. Renomeações exigem atualização global e teste de regressão.

### Navegação superior

A navegação, marca, conta, plano, uso diário e saída compartilham uma única superfície superior. Em desktop, o menu deve permanecer legível sem scrollbar visível; em larguras menores, rolagem horizontal controlada é permitida.

### Visão Geral

A Visão Geral não possui rolagem interna. O conteúdo usa apenas a rolagem natural da página quando excede a viewport.

### CSS modular

A ordem de importação é intencional:

```text
99-legacy
→ tokens
→ base
→ layout
→ components
→ views
→ operational-polish
→ depth
→ responsive
→ top-navigation
```

Regras posteriores podem refinar compatibilidade anterior. Novos estilos devem ser colocados na camada adequada e cobertos por testes estruturais.

## 7. Painel administrativo

O admin é separado da aplicação comum. A interface pode ocultar controles, mas autorização real sempre ocorre no backend.

Áreas:

- visão executiva;
- economia;
- usuários;
- planos;
- pagamentos;
- segurança;
- manutenção;
- auditoria.

## 8. Fluxo de dados e isolamento

- entrada externa é normalizada na borda;
- `userId` vem da autenticação, nunca do corpo confiável;
- recursos futuros podem incluir `organizationId` sem quebrar o isolamento atual;
- persistência é acessada por repositórios;
- erros são traduzidos pela camada HTTP;
- segredos vêm somente do ambiente;
- operações externas repetíveis devem ser idempotentes.

## 9. Segurança

- senhas com bcrypt;
- JWT com issuer e audience;
- verificação de usuário ativo;
- autorização administrativa;
- Helmet/CSP;
- CORS explícito;
- limite de body;
- rate limit;
- MongoDB obrigatório em produção;
- token de recuperação de uso único;
- criptografia AES-256-GCM para credenciais de integração;
- mascaramento de segredos;
- logs sem credenciais;
- auditoria administrativa;
- proteção contra replay e duplicidade planejada para webhooks reais.

## 10. Comentários e documentação

Todos os módulos JavaScript mantidos devem possuir `@fileoverview`. Funções públicas ou complexas recebem JSDoc. Comentários explicam intenção, invariantes, compatibilidade e risco; não repetem linha por linha o que o código já expressa.

O mapa de responsabilidades está em [`MAPA_DO_CODIGO.md`](MAPA_DO_CODIGO.md).

## 11. Testabilidade

- domínio usa funções puras sempre que possível;
- Application Factory permite testes sem abrir porta;
- provedores são injetados;
- repositórios podem usar implementações controladas em teste;
- bugs recebem teste de regressão;
- scripts impedem regressão arquitetural, documental, visual e de higiene.

## 12. Qualidade

```text
check:hygiene
→ check:syntax
→ check:docs
→ check:architecture
→ check:frontend
→ check:styles
→ verify:landing
→ tests
```

O gate completo é `npm run quality`.

## 13. Diagnóstico de release

`GET /api/health` informa:

- versão;
- estado do MongoDB;
- artefato da landing;
- branch implantada;
- commit implantado;
- uptime.

Respostas HTML recebem cabeçalhos de versão e não devem permanecer obsoletas após deploy.

## 14. Dívidas técnicas controladas

- dashboard principal ainda possui controlador legado grande;
- handlers inline permanecem em áreas de compatibilidade;
- Central de Conversas usa provedor demonstrativo;
- integrações externas reais ainda precisam de filas e idempotência operacional completas;
- migração progressiva para componentes menores deve preservar contratos e testes.

## 15. Regra de evolução

Uma funcionalidade só é considerada concluída quando:

1. os arquivos reais estão na `main`;
2. `npm run quality` passou;
3. o Render executa o commit esperado;
4. o fluxo foi validado na interface;
5. limitações e dependências externas estão documentadas.
