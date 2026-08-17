# Controle Start/Stop do Outbound

## Objetivo

O LeadHunter pode preparar contatos logo após a prospecção, mas o processamento automático da fila fica **parado por padrão** para cada usuário.

O fluxo operacional é:

```text
Prospecção
→ lead salvo
→ regras de score/contato/consentimento
→ OutboundJob preparado
→ STOPPED
→ usuário clica em Iniciar contatos
→ RUNNING
→ worker processa somente jobs elegíveis daquela conta
→ WhatsApp Cloud API
→ webhook/resposta
→ CRM + Central de Conversas
```

## Controle por usuário

O estado é persistido em `OutboundAutomationState` e possui dois estados:

- `STOPPED`: a descoberta pode continuar preparando a fila, mas o worker não pode consumir jobs do usuário;
- `RUNNING`: o worker pode consumir os jobs elegíveis daquele usuário.

O botão **Parar** interrompe novos claims de jobs sem apagar a fila. Um job que ainda não foi enviado continua disponível para um novo Start.

## Endpoints

```text
GET  /api/omnichannel/outbound/automation
POST /api/omnichannel/outbound/automation/start
POST /api/omnichannel/outbound/automation/stop
```

O Start padrão utiliza:

```json
{
  "mode": "autonomous",
  "channel": "whatsapp"
}
```

## Travas independentes

O Start do usuário não substitui os kill-switches de produção. Para um Start real ser aceito, o backend também exige:

```env
OUTBOUND_AFTER_PROSPECTING=true
OUTBOUND_WORKER_ENABLED=true
OUTBOUND_LIVE_SEND=true
```

Além disso, o provider do WhatsApp precisa estar configurado e validado.

As regras existentes de elegibilidade permanecem ativas: contato válido, score mínimo, consentimento exigido nos modos automáticos e bloqueio de `DO_NOT_CONTACT`/`NAO_CONTATAR`.

## Interface

A aba **Campanhas** contém o painel **Automação pós-prospecção** com:

- estado `PARADO` ou `ATIVO`;
- quantidade de jobs prontos;
- quantidade aguardando revisão;
- quantidade enviada;
- botão **Iniciar contatos**;
- botão **Parar**;
- diagnóstico quando o ambiente ainda não está pronto para envio real.

Com isso, realizar uma nova prospecção nunca equivale, por si só, a autorizar disparos.
