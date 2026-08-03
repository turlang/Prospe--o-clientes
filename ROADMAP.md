# Roadmap — LeadHunter Pro

**Versão identificada no código:** 27.0.0  
**Estado da release:** CRM 360 integrado à fundação omnichannel e aprovado localmente; publicação depende de merge e validação no Render  
**Próxima evolução planejada:** scoring explicável e Auditor Digital comercial

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

## Marco 3 — Comunicação integrada

**Estado:** fundação e Central de Conversas demonstrativa publicadas; canais reais ainda pendentes.

Concluído:

- modelos MongoDB do domínio omnichannel;
- contratos de IA e mensageria;
- criptografia de credenciais;
- isolamento por proprietário;
- Central de Conversas;
- histórico, notas internas, não lidas e transferência humana;
- provedor demonstrativo explicitamente identificado;
- base do agente SDR e playground seguro.

Pendente:

- Meta WhatsApp Cloud API;
- Evolution API e UaiZapi como adaptadores opcionais;
- webhook seguro com idempotência;
- processamento assíncrono, retentativas e fila de falhas;
- criação ou vinculação automática de lead;
- Gmail e Outlook;
- calendário e agendamento;
- agente SDR atuando em mensagens reais conforme modo publicado;
- limites, descadastro e proteção de reputação.

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
- modos assistido, semiautônomo e autônomo controlado;
- aprovação obrigatória para ações sensíveis.

## Marco 7 — Automação visual

- Gatilho → Condição → Ação → Espera → Decisão;
- criação por linguagem natural;
- simulação antes da publicação;
- versionamento, auditoria e reversão;
- limites por plano;
- filas, retentativas e dead-letter queue.

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
3. Auditor Digital e Opportunity Score;
4. WhatsApp oficial e caixa de entrada real;
5. venda guiada e agente SDR controlado;
6. propostas, contratos e pagamentos;
7. automação visual;
8. equipes, analytics avançado e ecossistema.

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
