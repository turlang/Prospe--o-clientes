# Motor de Outbound + SDR

## Estado

A fundação de outbound está integrada ao backend do LeadHunter Pro. Ela transforma leads novos ou atualizados em trabalhos persistentes de contato sem acoplar mensageria ao endpoint de prospecção.

O envio real permanece protegido por `OUTBOUND_LIVE_SEND=false` até a configuração e validação do canal WhatsApp no ambiente de produção.

## Fluxo

```text
/api/prospectar
→ Lead salvo no MongoDB
→ outboundWorker detecta Lead novo/atualizado
→ outboundService aplica score, contato, consentimento e deduplicação
→ OutboundJob
→ revisão humana ou fila automática
→ provider de mensageria
→ WhatsApp Cloud API
→ webhook
→ vínculo com Lead e Conversation
→ análise da resposta
→ atualização do CRM
→ resposta sugerida entra novamente na fila
```

## Modos

### Assistido

É o padrão e o modo recomendado para ativação inicial.

- cria a abordagem automaticamente;
- grava `OutboundJob` como `PENDING_REVIEW`;
- não envia até aprovação explícita;
- permite validar texto, destino e segmentação antes de liberar o canal.

### Semiautomático

- exige score mínimo;
- exige contato válido;
- exige consentimento registrado;
- bloqueia `DO_NOT_CONTACT`;
- coloca jobs elegíveis em `PENDING`.

### Autônomo

Usa as mesmas travas do modo semiautomático e pode também enfileirar respostas sugeridas a mensagens recebidas. Respostas automáticas permanecem em revisão enquanto `OUTBOUND_AUTO_REPLY_ENABLED=false`.

## Estados da fila

| Estado | Significado |
|---|---|
| `PENDING_REVIEW` | mensagem criada e aguardando aprovação |
| `PENDING` | pronta para execução |
| `PROCESSING` | job tomado atomicamente pelo worker |
| `SENT` | provedor aceitou a mensagem |
| `BLOCKED` | política comercial ou de contato impediu a execução |
| `DEAD` | tentativas esgotadas |
| `CANCELLED` | cancelado pelo usuário |

A chave `dedupeKey` impede a duplicação da primeira abordagem para o mesmo usuário, lead, canal e finalidade.

## Segurança operacional

O sistema foi projetado com dois níveis independentes de ativação:

```env
OUTBOUND_WORKER_ENABLED=true
OUTBOUND_LIVE_SEND=false
```

Com essa configuração, o worker descobre leads e cria a fila, mas não consome jobs `PENDING` nem envia mensagens reais.

Para modos automáticos, o lead precisa possuir consentimento registrado no campo de consentimento do canal. Leads com `doNotContact=true`, tag `DO_NOT_CONTACT` ou `NAO_CONTATAR` são bloqueados.

## WhatsApp Cloud API

Variáveis esperadas:

```env
WHATSAPP_GRAPH_API_VERSION=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_WABA_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
```

As credenciais reais devem existir somente no ambiente seguro do deploy.

### Associação da conta

Depois de autenticar no LeadHunter, associe o `phoneNumberId` ao proprietário correto pelo endpoint:

```text
POST /api/omnichannel/integrations/meta
```

Exemplo de corpo:

```json
{
  "name": "WhatsApp Comercial",
  "phoneNumberId": "SEU_PHONE_NUMBER_ID",
  "phone": "+55..."
}
```

Essa associação é necessária para o webhook descobrir a qual usuário pertence uma mensagem recebida.

### Webhook público

```text
GET  /api/omnichannel/webhooks/whatsapp
POST /api/omnichannel/webhooks/whatsapp
```

O GET trata a verificação inicial. O POST preserva o corpo bruto para validação de assinatura quando `WHATSAPP_APP_SECRET` estiver configurado.

Eventos recebidos são deduplicados em `WebhookEvent` antes de atualizar conversa e CRM.

## Endpoints da fila

```text
GET  /api/omnichannel/outbound/jobs
GET  /api/omnichannel/outbound/summary
POST /api/omnichannel/outbound/jobs/:id/approve
POST /api/omnichannel/outbound/jobs/:id/cancel
```

## Configuração recomendada para primeiro deploy

```env
OUTBOUND_AFTER_PROSPECTING=true
OUTBOUND_DEFAULT_MODE=assisted
OUTBOUND_DEFAULT_CHANNEL=whatsapp
OUTBOUND_MIN_SCORE=70
OUTBOUND_WORKER_ENABLED=true
OUTBOUND_AUTO_REPLY_ENABLED=false
OUTBOUND_LIVE_SEND=false
```

Com isso, novas prospecções já alimentam a fila automaticamente, mas nada é enviado sem revisão.

## Validação antes do envio real

1. confirmar `npm run quality` verde;
2. publicar a `main` no Render;
3. cadastrar as variáveis do WhatsApp;
4. associar o `phoneNumberId` à conta pelo endpoint autenticado;
5. validar o GET de verificação do webhook;
6. validar recebimento de uma mensagem de teste;
7. validar que o CRM recebeu conversa, mensagem e atividade;
8. aprovar um único job controlado;
9. somente depois ativar `OUTBOUND_LIVE_SEND=true`;
10. manter o modo `assisted` até o fluxo real estar estável.

## Limitações atuais

- o provider real implementado nesta entrega é o WhatsApp Cloud API;
- e-mail outbound permanece sem provider real;
- a configuração do canal está disponível via API autenticada; a tela administrativa específica ainda pode ser adicionada;
- templates, regras comerciais específicas do provedor e políticas operacionais devem ser configurados no ambiente do proprietário antes de escala;
- o sistema não considera um canal validado em produção apenas porque o código existe: webhook, envio e retorno precisam de smoke test real.
