# Motor de Inteligência Comercial e Automação de Funil — versão 23.8.0

## 1. Objetivo

Esta versão transforma a geração isolada de mensagens em um processo comercial rastreável. O motor analisa os dados públicos do lead, prepara uma abordagem inicial em linguagem natural, identifica o melhor canal disponível e registra a próxima tarefa da etapa comercial.

O envio das mensagens permanece sob revisão humana. O sistema não intercepta conversas privadas e não declara que um número de WhatsApp está ativo sem confirmação do operador ou integração oficial.

## 2. Saída padronizada

As rotas de abordagem retornam os seguintes blocos:

1. `mensagemAbordagemSugerida`: texto pronto para WhatsApp;
2. `statusContatos`: WhatsApp, telefone, e-mail, redes sociais, restrições e canal prioritário;
3. `proximaAcaoFunil`: etapa, ação, descrição, tarefa, duração sugerida, valor de referência e link da agenda comercial;
4. `diagnosticoPratico`: achado, impacto comercial e solução em linguagem simples.

O campo legado `abordagem` foi mantido para compatibilidade.

## 3. Política de linguagem

A primeira abordagem segue a estrutura:

- observação rápida pelo celular;
- consequência comercial, como perder um cliente para outra empresa;
- pergunta de baixo atrito, preferencialmente “Posso te mandar o print do que vi?”.

O motor sanitiza termos técnicos ou estrangeiros antes de exibir o texto. Expressões como SEO, landing page, presença digital, tráfego orgânico, CRM, funil, automação, `dentist`, `website`, `feedback` e `follow-up` são substituídas por linguagem comum. Caso uma resposta externa não cumpra o contrato, o sistema usa a abordagem local validada.

## 4. Auditoria de canais

A auditoria avalia, nesta ordem:

1. link direto de WhatsApp encontrado no site ou nas redes;
2. telefone com formato utilizável para construir link de tentativa;
3. telefone fixo ou comercial;
4. e-mail público;
5. redes sociais secundárias.

A propriedade `whatsapp.verificadoAtivo` permanece `false` por padrão. Um número com formato válido representa somente uma possibilidade de contato, não uma confirmação de atividade.

## 5. Automação do funil

| Status canônico | Etapa comercial | Tarefa automática | Próximo status esperado |
|---|---|---|---|
| `NOVO` | Abordagem | Enviar abordagem inicial | `CONTATADO` |
| `CONTATADO` | Abordagem | Verificar resposta em dois dias | `CONTATADO` |
| `INTERESSADO` | Diagnóstico | Enviar diagnóstico e sugerir conversa | `REUNIAO` |
| `REUNIAO` | Proposta | Preparar proposta | `PROPOSTA` |
| `PROPOSTA` | Fechamento | Acompanhar proposta | `FECHADO` |
| `FECHADO` | Pós-venda | Concluir tarefas comerciais | Cliente ativo |
| `SEM_INTERESSE` | Encerrado | Concluir tarefas e registrar motivo | Encerrado |

Pedidos de preço geram orientação com valor de referência a partir de R$ 300 e conversa de 10 a 15 minutos.

## 6. Idempotência das tarefas

`createTaskIfMissing` impede mais de uma tarefa pendente com o mesmo `leadId` e `automationType`. No armazenamento local, a consulta e a criação ocorrem dentro do mesmo bloqueio de arquivo, evitando duplicação por requisições concorrentes. Ao avançar de etapa, `completePendingAutomationTasksForLead` conclui somente tarefas iniciadas pelo motor (`FUNIL_*`), preservando lembretes manuais do operador.

## 7. Pontos de integração

- `src/services/commercialFunnelEngine.js`: regras de linguagem, contatos, diagnóstico e tarefas;
- `src/services/salesStrategyEngine.js`: abordagem local integrada ao motor;
- `src/services/commercialPromptEngine.js`: regras obrigatórias para provedores externos;
- `src/services/aiApproachService.js`: validação da resposta da IA e fallback local;
- `src/routes/leadRoutes.js`: criação de abordagem, análise de resposta e avanço manual;
- `src/routes/commercialRoutes.js`: proposta, fechamento e clientes ativos;
- `src/localTaskStore.js`: idempotência e conclusão seletiva de tarefas;
- `public/app.js`: apresentação dos três blocos da saída.

## 8. Validação

A versão inclui testes para:

- ausência de jargões e palavras estrangeiras na abordagem;
- estrutura de gancho, consequência e pergunta final;
- seleção do canal prioritário sem alegar atividade não confirmada;
- diagnóstico em linguagem simples;
- referência de R$ 300, conversa de 15 minutos e acesso à agenda comercial;
- presença dos três blocos da saída;
- criação automática da tarefa após resposta positiva;
- preservação do vocabulário canônico do Kanban.
