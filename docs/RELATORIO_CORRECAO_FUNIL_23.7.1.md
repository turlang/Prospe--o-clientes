# Relatório de correção do funil — versão 23.7.1

## Resumo

Foi investigada a falha relatada na qual o usuário registrava o primeiro contato, recebia uma resposta do lead e não observava avanço no funil. A análise confirmou inconsistência entre os estados produzidos pelo motor de conversação e as colunas reconhecidas pelo CRM.

## Diagnóstico

O motor retornava `RESPONDEU`, `QUALIFICANDO` e `PERDIDO`. Entretanto, o Kanban somente renderizava etapas previamente configuradas. O registro era persistido, mas não havia coluna correspondente, fazendo o card desaparecer da visão principal. Adicionalmente, a ficha em popup — interface principal do CRM — não continha o formulário de resposta existente na visualização legada de cartões.

## Solução aplicada

- Criação de `src/domain/leadStatus.js` como fonte única de verdade.
- Normalização automática de dados legados na camada de persistência.
- Alteração do motor de conversa para produzir apenas etapas canônicas.
- Inclusão da etapa `REUNIAO` em todas as visões e métricas relevantes.
- Inclusão do formulário “Resposta recebida” na ficha do lead.
- Atualização imediata do estado visual após resposta, sem depender de recarga manual.
- Retorno explícito de transição pela API.
- Proteção contra regressão automática de oportunidades avançadas.

## Validação

Foram executadas verificações de sintaxe, documentação e testes automatizados. A suíte final contém 110 testes aprovados e nenhuma falha. As dependências externas não estavam instaladas no ambiente, portanto a inicialização completa do servidor deve ser validada localmente após `npm ci`.
