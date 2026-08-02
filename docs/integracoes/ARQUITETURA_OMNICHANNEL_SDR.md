# Arquitetura — Omnichannel e Agente SDR

## Fluxo principal

```text
Frontend autenticado
  → cliente de API
  → routes
  → controllers
  → services
  → repositories
  → MongoDB
```

## Provedores

```text
AiProvider
├── DemoAiProvider
├── GeminiProvider
├── OpenAiProvider
└── GroqProvider

MessagingProvider
├── DemoMessagingProvider
├── UaiZapiProvider
├── EvolutionApiProvider
└── MetaCloudApiProvider
```

Nenhum controller conhece detalhes de endpoint ou autenticação do provedor. O `ProviderRegistry` resolve a implementação pelo identificador persistido na integração.

## Entidades

- `Conversation`: atendimento vinculado ao lead e ao canal.
- `Message`: conteúdo normalizado, estado de entrega e identificador externo.
- `MessagingIntegration`: configuração do provedor e credencial criptografada.
- `AgentConfiguration`: rascunho ou configuração publicada.
- `AgentConfigurationVersion`: histórico restaurável.
- `AgentSession`: sessão real, de playground ou demonstração.
- `AgentEvaluation`: avaliação de alucinação, escopo, preço e segurança.
- `LeadQualification`: saída estruturada do SDR.
- `CrmActivity`: evento imutável da linha do tempo.
- `FollowUpPolicy`: cadência configurável.
- `FollowUpExecution`: tentativa e estado operacional.
- `IntegrationEvent`: evento técnico normalizado.
- `WebhookEvent`: idempotência e auditoria do webhook.
- `DemoWorkspace`: dados fictícios isolados e reinicializáveis.

## Isolamento

Toda entidade inclui `userId`. O campo `organizationId` é opcional nesta etapa e se tornará obrigatório quando workspaces multiempresa forem ativados. Repositories nunca recebem apenas o ID do recurso: recebem também o escopo do proprietário.

## Segredos

Credenciais são armazenadas como envelope AES-256-GCM:

- `ciphertext`;
- `iv`;
- `authTag`;
- `version`.

A chave mestra vem de `INTEGRATION_ENCRYPTION_KEY`. O frontend recebe apenas máscara e estado de configuração.

## Webhook

```text
requisição
→ limite de payload/rate limit
→ localizar integração
→ validar assinatura/timestamp
→ calcular fingerprint
→ registrar WebhookEvent
→ rejeitar replay/duplicidade
→ normalizar mensagem
→ localizar/criar lead
→ criar/atualizar conversa
→ salvar mensagem
→ registrar CrmActivity
→ executar agente conforme política
→ enviar ou sugerir resposta
```

## Playground

O playground sempre usa `AgentSession.mode = playground`. Por padrão usa `DemoAiProvider`, não cria lead, mensagem ou atividade de produção e retorna uma prévia das ações que seriam realizadas.
