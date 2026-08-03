# Auditoria de produto — LeadHunter Pro

**Data:** 2 de agosto de 2026  
**Escopo:** código publicado na `main`, documentação, fluxos comerciais, domínio omnichannel e processo de deploy

## Conclusão executiva

O LeadHunter Pro já possui uma combinação pouco comum em produtos pequenos: busca de empresas, auditoria digital, priorização comercial, CRM, tarefas, campanhas, propostas, clientes, inteligência por IA, planos, billing, administração e uma Central de Conversas demonstrativa.

O produto ainda não é superior aos líderes generalistas em ecossistema, integrações, colaboração, automação e maturidade operacional. A oportunidade real de liderança está em dominar um recorte mais específico:

> encontrar empresas com deficiência digital, comprovar a oportunidade, recomendar o serviço certo e conduzir o vendedor até o fechamento.

Nesse recorte, o LeadHunter pode ser mais útil que CRMs generalistas porque começa antes do cadastro manual do lead e entende o que freelancers e agências vendem.

## Estado verificado

### Pontos fortes

- proposta de valor ligada a geração de receita;
- prospecção local conectada ao CRM;
- auditoria de site e presença digital;
- score, diagnóstico, dores, serviços e abordagem sugerida;
- painel comercial, agenda, campanhas, propostas e pós-venda;
- arquitetura Express modular e Application Factory;
- MongoDB, autenticação, planos, limites e administração;
- fallback de IA e provedores desacoplados;
- Central de Conversas com isolamento, histórico e notas;
- testes automatizados e gates de qualidade;
- Blueprint do Render com auto deploy e health check.

### Lacunas críticas

- documentação afirmava que o CRM 360 estava publicado, mas os arquivos reais não estavam na `main`;
- o PR antigo do CRM 360 continha artefato fragmentado corrompido;
- não existia uma forma inequívoca de confirmar qual commit o Render executava;
- WhatsApp real, e-mail e calendário ainda não estão integrados;
- a Central de Conversas opera somente em modo demonstrativo;
- o score principal mistura aderência, deficiência e possibilidade de contato em uma única nota;
- faltam mapa de oportunidades, benchmark local e reauditoria de resultado;
- faltam filas, retentativas e observabilidade para automações externas;
- faltam proposta, contrato, cobrança e entrega em um fluxo realmente contínuo;
- faltam workspaces, permissões e operação multiempresa.

## Comparação estratégica

Produtos líderes já oferecem venda guiada por IA, filas de ações, sequências, automações, previsão, inteligência de conversas, prospecção com dados, enriquecimento, integrações e colaboração.

O LeadHunter não deve tentar vencer apenas somando telas. Deve entregar uma jornada mais curta para seu público:

```text
empresa encontrada
→ deficiência comprovada
→ oportunidade priorizada
→ oferta recomendada
→ contato personalizado
→ resposta interpretada
→ reunião e proposta
→ pagamento
→ entrega e reauditoria
```

## Avaliação atual

| Dimensão | Nota | Leitura |
|---|---:|---|
| Clareza do problema | 8,5/10 | Dor comercial real e público bem definido |
| Diferenciação | 8,0/10 | Auditoria digital ligada à venda é o principal ativo |
| CRM e operação | 7,0/10 | Boa base, mas CRM 360 ainda precisa de integração limpa |
| Comunicação | 5,5/10 | Central demo pronta; canais reais ausentes |
| IA comercial | 7,0/10 | Boa assistência, ainda sem ciclo de aprendizado e ação controlada completos |
| Dados e enriquecimento | 5,5/10 | Busca útil, mas falta evidência, fonte, atualização e benchmark |
| Automação | 5,0/10 | Tarefas e campanhas existem; falta motor visual e execução resiliente |
| Analytics | 6,5/10 | Indicadores úteis; falta inteligência de receita e coortes |
| Segurança e arquitetura | 8,0/10 | Fundação forte para o porte atual |
| Maturidade comercial | 6,5/10 | Pode operar beta pago, mas ainda precisa reduzir fricção e provar resultado |

**Nota geral atual:** 6,9/10.

## Vantagens que devem se tornar exclusivas

### Auditor Digital comercial

Não apenas listar problemas técnicos. Cada evidência deve gerar:

- impacto provável no negócio;
- serviço recomendado;
- esforço estimado;
- faixa de preço configurável;
- argumento de abordagem;
- prova visual;
- comparação com concorrentes locais;
- indicador de melhoria após a entrega.

### Scoring explicável em cinco dimensões

- Fit;
- Opportunity;
- Reachability;
- Intent;
- Close.

O usuário deve compreender o motivo da prioridade e quais dados estão ausentes.

### Venda guiada orientada a ação

A tela inicial deve responder diariamente:

1. quem contatar;
2. por que agora;
3. qual problema mencionar;
4. qual serviço oferecer;
5. qual próximo passo executar.

### Lead até resultado

O produto deve continuar depois do fechamento com proposta, contrato, pagamento, entrega, reauditoria, renovação e indicação.

## Ajustes iniciados nesta auditoria

- encerramento do PR corrompido sem risco para a `main`;
- criação de branch limpa de integração;
- correção do roadmap para refletir somente recursos realmente publicados;
- geração automática da chave de criptografia das integrações no Render;
- inclusão de branch e commit reais no `/api/health`;
- cabeçalho `X-Deploy-Commit` para identificar o artefato servido;
- testes automatizados para a identidade do deploy.

## Próximas entregas executáveis

1. integração limpa do CRM 360 com o omnichannel;
2. decomposição do score atual em dimensões explicáveis;
3. painel de oportunidade com evidências e próxima melhor ação;
4. Meta WhatsApp Cloud API com webhook idempotente;
5. proposta gerada pela auditoria e vinculada à oportunidade;
6. reauditoria para provar resultado e estimular renovação.

## Métricas de liderança

- primeiro lead útil em menos de 5 minutos;
- primeira abordagem pronta em menos de 10 minutos;
- pelo menos 70% dos novos usuários chegando à primeira oportunidade;
- aumento mensurável de contato, reunião e fechamento;
- redução do tempo entre descoberta e proposta;
- percentual de diagnósticos convertidos em serviço vendido;
- retenção de 30 dias superior a 50% no público ideal;
- disponibilidade mínima de 99,9% quando o produto sair da fase beta.

## Fontes de benchmark consultadas

- documentação oficial do HubSpot Sales Hub;
- páginas oficiais de recursos do Pipedrive;
- documentação e páginas de produto da Apollo;
- páginas oficiais do RD Station CRM;
- documentação oficial do Render para variáveis de ambiente e deploy.
