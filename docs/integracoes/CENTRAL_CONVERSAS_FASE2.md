# Fase 2 — Central de Conversas

## Objetivo

Entregar a primeira fatia vertical utilizável do domínio omnichannel, conectando interface, API, regras de negócio, persistência MongoDB e atividades do CRM sem depender de um provedor externo.

## Entregas

### Caixa de entrada

- lista de conversas ordenada pela última mensagem;
- busca por lead, telefone, tags e conteúdo recente;
- filtros por status, canal e mensagens não lidas;
- contador de não lidas no menu;
- resumo com total, atendimentos ativos, aguardando humano e resolvidas no dia.

### Histórico por contato

- conversa obrigatoriamente vinculada a um documento `Lead` da mesma conta;
- mensagens recebidas e enviadas em ordem cronológica;
- estado de envio e autoria visíveis;
- registro de leitura das mensagens recebidas;
- notas internas da equipe;
- atividades comerciais associadas à conversa e ao lead.

### Controle de atendimento

- estados `open`, `waiting_lead`, `waiting_human`, `resolved` e `archived`;
- modos `ai`, `human` e `hybrid`;
- atividade de transferência quando o atendimento passa para humano;
- bloqueio de envio em conversas arquivadas;
- isolamento obrigatório por `userId` e `organizationId`.

### Ambiente demonstrativo

O provedor `demo` permite:

- criar uma conversa a partir de um lead existente;
- registrar uma mensagem inicial recebida;
- registrar respostas sem envio externo;
- simular novas mensagens do lead;
- validar contadores, histórico, notas e estados.

A interface identifica explicitamente que nenhuma mensagem real é enviada pelo modo de demonstração.

## Endpoints

```text
GET    /api/omnichannel/leads
GET    /api/omnichannel/summary
GET    /api/omnichannel/conversations
POST   /api/omnichannel/conversations
GET    /api/omnichannel/conversations/:id
PATCH  /api/omnichannel/conversations/:id
PATCH  /api/omnichannel/conversations/:id/read
POST   /api/omnichannel/conversations/:id/messages
POST   /api/omnichannel/conversations/:id/demo-inbound
POST   /api/omnichannel/conversations/:id/notes
```

Todos os endpoints exigem autenticação e passam por rate limiting.

## Requisitos operacionais

- MongoDB é obrigatório para este módulo;
- `MONGODB_URI` deve estar configurada;
- o modo demo funciona sem credencial externa;
- canais reais continuam indisponíveis até a implementação e validação de seus adaptadores;
- credenciais futuras serão armazenadas pelo cofre AES-256-GCM da fundação.

## Critérios de conclusão

A fase é considerada concluída quando:

1. o JavaScript da interface passa em validação de sintaxe;
2. os testes específicos da central são aprovados;
3. a suíte completa `npm run quality` passa sem regressões;
4. o arquivo público é carregado pela página autenticada;
5. nenhum provedor simulado é apresentado como conexão real.
