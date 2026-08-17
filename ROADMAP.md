# Roadmap — LeadHunter Pro

**Versão identificada no código:** 27.0.0  
**Estado da release:** CRM 360 integrado; fundação omnichannel e Motor de Outbound + SDR incorporados; ativação real do WhatsApp depende de configuração e validação no Render  
**Próxima evolução planejada:** ativação controlada do WhatsApp em produção, scoring explicável e Auditor Digital comercial

## Objetivo estratégico

Transformar o LeadHunter Pro no sistema operacional comercial mais eficiente para freelancers, agências e pequenas equipes que vendem sites, automações e soluções digitais.

O diferencial não será copiar CRMs generalistas. O produto deve encontrar empresas com deficiência digital, comprovar a oportunidade, recomendar a oferta adequada, conduzir o contato e acompanhar receita e entrega em um único fluxo.

## Regra de verdade do produto

Uma funcionalidade só pode ser marcada como concluída quando:

1. os arquivos reais estiverem presentes na `main`;
2. `npm run quality` estiver aprovado;
3. o Render estiver executando o commit esperado;
4. o fluxo tiver sido validado na interface;
5. limitações demonstrativas ou dependências externas estiverem claramente informadas.

Documentação, pacote local, branch ou pull request isolado não equivalem a recurso publicado.

## Marco 1 — Base comercial confiável

**Estado:** concluído e validado, com uma pendência operacional isolada.

Entregas confirmadas:

- aplicação publicada no Render;
- MongoDB Atlas conectado;
- cadastro, login e sessão;
- planos e limites;
- painel administrativo;
- pagamento e estrutura de webhook;
- IA com fallback local;
- segurança, auditoria e testes automatizados;
- build e deploy validados.

Pendência:

- atualizar o domínio/remetente da recuperação de senha e repetir o teste com destinatário real no Resend.

## Marco 2 — CRM 360

**Estado:** integrado na release 27.0.0, preservando a Central de Conversas e os dados existentes.

A integração foi refeita sobre uma cópia exata da `main` publicada. O artefato legado corrompido permaneceu encerrado e não foi reutilizado.

Escopo que deverá ser validado na integração:

- múltiplos pipelines;
- etapas, probabilidades e requisitos personalizados;
- campos personalizados;
- filtros salvos;
- visualizações Kanban e Lista;
- catálogo de produtos e serviços;
- valor de contrato, recorrência e receita fechada;
- previsão ponderada;
- metas mensais e trimestrais;
- relatórios por período;
- importação CSV com prévia e mapeamento;
- deduplicação;
- exportação completa;
- motivos estruturados de perda;
- reativação de oportunidades;
- histórico comercial aditivo;
- validação antes da mudança de etapa.

Critério de conclusão: arquivos integrados e suíte completa aprovada. O marco será considerado validado em produção quando o Render executar o commit final e o checklist funcional for concluído.

## Marco 3 — Comunicação integrada e Motor de Outbound + SDR

**Estado:** fundação técnica integrada; envio real permanece protegido até configuração e smoke test do canal.

Concluído no código:

- modelos MongoDB do domínio omnichannel;
- contratos de IA e mensageria;
- criptografia de credenciais;
- isolamento por proprietário;
- Central de Conversas;
- histórico, notas internas, não lidas e transferência humana;
- provedor demonstrativo explicitamente identificado;
- base do agente SDR e playground seguro;
- fila persistente `OutboundJob` com deduplicação;
- modos assistido, semiautomático e autônomo controlado;
- descoberta automática de leads novos/atualizados depois da prospecção;
- score mínimo, bloqueio `DO_NOT_CONTACT` e consentimento obrigatório para modos automáticos;
- worker com claim atômico, retentativas, backoff e estado `DEAD`;
- kill-switch `OUTBOUND_LIVE_SEND` para impedir envio acidental;
- adaptador `MetaWhatsAppProvider` para WhatsApp Cloud API;
- verificação e assinatura do webhook quando o segredo do app estiver configurado;
- deduplicação de eventos de webhook;
- associação autenticada do `phoneNumberId` à conta correta;
- mensagem recebida → lead/conversa → análise → atualização do CRM;
- resposta sugerida retornando para a fila, com revisão humana por padrão;
- endpoints para listar, aprovar e cancelar jobs outbound;
- testes de regressão das políticas de consentimento, kill-switch e parsing de webhook.

Ainda depende de ativação/validação externa:

- cadastrar as credenciais reais do WhatsApp no Render;
- associar o `phoneNumberId` da conta real;
- configurar o callback público do webhook;
- executar teste real de entrada, saída, status e retorno;
- manter `OUTBOUND_LIVE_SEND=false` até o smoke test estar aprovado;
- validar regras comerciais, templates e reputação do canal antes de ampliar volume;
- Gmail e Outlook;
- calendário e agendamento;
- tela administrativa específica para configuração do canal;
- Evolution API e UaiZapi como adaptadores opcionais.

Critério para declarar WhatsApp operacional em produção: commit presente na `main`, `npm run quality` verde, Render no commit esperado, integração Meta configurada, webhook real validado e pelo menos um fluxo controlado de envio e resposta concluído sem bypass de segurança.

## Marco 4 — Auditor Digital e mapa de oportunidades

Esta é a principal vantagem competitiva planejada.

- auditoria de site, responsividade, HTTPS, desempenho, SEO, acessibilidade, formulários, WhatsApp, analytics, pixels, reputação e presença social;
- comparação local por segmento e região;
- evidências e data de coleta em cada diagnóstico;
- tradução automática da deficiência em serviço vendável;
- oferta, escopo, faixa de preço e argumento comercial sugeridos;
- mapa territorial de oportunidades;
- reauditoria para demonstrar resultado depois da venda.

## Marco 5 — Scoring explicável

- Fit Score: aderência ao cliente ideal;
- Opportunity Score: intensidade da deficiência digital;
- Reachability Score: possibilidade real de contato;
- Intent Score: sinais de interesse observados;
- Close Score: probabilidade operacional de fechamento;
- componentes, evidências e incerteza visíveis;
- aprendizado com ganhos e perdas reais;
- ausência de dados ou probabilidades inventadas.

## Marco 6 — Venda guiada por IA

- fila diária de prioridades;
- próxima melhor ação explicada;
- preparação para contato e reunião;
- geração de mensagens baseada apenas em evidências disponíveis;
- análise de respostas e objeções;
- atualização assistida do CRM;
- evolução dos modos assistido, semiautônomo e autônomo controlado;
- aprovação obrigatória para ações sensíveis.

## Marco 7 — Automação visual

- Gatilho → Condição → Ação → Espera → Decisão;
- criação por linguagem natural;
- simulação antes da publicação;
- versionamento, auditoria e reversão;
- limites por plano;
- filas, retentativas e dead-letter queue sobre a fundação outbound existente.

## Marco 8 — Propostas, contratos e receita

- catálogo, pacotes e precificação;
- proposta gerada a partir da auditoria;
- assinatura eletrônica;
- Pix, cartão, recorrência e parcelamento;
- rastreamento de abertura;
- renovação, upsell, cross-sell e indicação;
- ligação entre oportunidade, venda, entrega e resultado.

## Marco 9 — Equipes e multiempresa

- workspaces e organizações;
- convites, papéis e permissões;
- metas por pessoa e equipe;
- distribuição e territórios;
- isolamento por tenant;
- MFA, sessões, auditoria e LGPD;
- white label e subcontas para agências.

## Marco 10 — Inteligência de receita

- velocidade de vendas;
- ciclo, ticket, recorrência e churn;
- cohorts e previsão;
- atribuição por origem e canal;
- desempenho de mensagens, ofertas e sequências;
- explicações gerenciais em linguagem natural;
- recomendações associadas a dados verificáveis.

## Marco 11 — Mobile e produtividade

- PWA instalável;
- notificações push;
- operação offline básica;
- registro por voz;
- agenda, conversas, tarefas e CRM em poucos toques;
- aplicativos nativos somente depois da validação da PWA.

## Marco 12 — Plataforma e ecossistema

- API pública versionada;
- OAuth e tokens com escopo;
- webhooks;
- SDK e sandbox;
- n8n, Make e Zapier;
- Google Workspace e Microsoft 365;
- marketplace de integrações e templates.

## Ordem de execução para liderança do segmento

1. verdade de versão, rastreabilidade de deploy e recuperação segura;
2. integração limpa do CRM 360;
3. Motor de Outbound em modo assistido e fila observável;
4. ativação controlada do WhatsApp oficial em produção;
5. Auditor Digital e Opportunity Score;
6. venda guiada e agente SDR controlado;
7. propostas, contratos e pagamentos;
8. automação visual;
9. equipes, analytics avançado e ecossistema.

## Regras de execução

Toda evolução deve:

1. manter `npm run quality` aprovado;
2. preservar compatibilidade e dados existentes;
3. incluir testes de unidade, integração e regressão;
4. manter segredos fora do Git;
5. documentar variáveis e migrações;
6. publicar uma entrega pequena na `main` depois da validação;
7. confirmar o commit implantado pelo `/api/health`;
8. executar smoke test no Render;
9. medir adoção e resultado antes de ampliar o escopo.
