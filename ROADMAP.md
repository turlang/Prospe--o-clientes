# Roadmap — LeadHunter Pro

**Versão atual:** 27.0.0  
**Estado:** Marco 2 concluído; aplicação pronta para validação em produção

## Objetivo estratégico

Transformar o LeadHunter Pro no sistema operacional comercial mais eficiente para freelancers, agências e pequenas equipes que vendem sites, automações e soluções digitais.

A estratégia não é apenas copiar CRMs generalistas. O produto deve unir descoberta de oportunidades, auditoria digital, CRM, comunicação, IA, proposta, pagamento e acompanhamento de clientes em um único fluxo.

## Marco 1 — Base comercial confiável

**Estado:** concluído e validado.

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

Pendência operacional isolada:

- atualizar o domínio/remetente usado na recuperação de senha e repetir o teste com destinatário real no Resend.

Essa pendência não bloqueia a evolução do CRM.

## Marco 2 — CRM 360

**Estado:** concluído na versão 27.0.0.

Entregas:

- múltiplos pipelines por usuário;
- nomes, probabilidades e requisitos personalizados por etapa;
- campos personalizados de texto, número, data, seleção e booleano;
- filtros salvos;
- etiquetas, segmentos e serviços;
- visualizações Kanban e lista;
- previsão ponderada de receita;
- metas mensais e trimestrais;
- relatórios por período;
- importação CSV com mapeamento e prévia;
- deduplicação por domínio, telefone, e-mail ou nome/endereço;
- exportação completa do CRM;
- catálogo de produtos e serviços;
- valor de contrato, receita recorrente e valor fechado;
- motivos estruturados de perda;
- reativação de leads perdidos ou parados;
- histórico comercial preservado por adição;
- validação de campos obrigatórios antes de avançar etapas;
- interface responsiva para configuração e operação;
- 185 testes automatizados aprovados.

### Validação de produção do Marco 2

1. criar um segundo pipeline;
2. personalizar uma etapa;
3. adicionar um campo personalizado;
4. definir metas;
5. importar um CSV de teste;
6. confirmar a detecção de duplicidades;
7. registrar produto, contrato e recorrência em um lead;
8. mover o lead até Fechado respeitando os campos obrigatórios;
9. alternar entre Kanban e Lista;
10. salvar e aplicar um filtro;
11. conferir previsão, metas e reativação.

## Marco 3 — Comunicação integrada

**Próxima execução recomendada.**

- WhatsApp Business oficial;
- Gmail e Outlook;
- caixa de entrada centralizada;
- histórico de mensagens no lead;
- modelos e sequências;
- captura de respostas;
- Google Calendar e Microsoft Calendar;
- página de agendamento;
- resumo de reuniões por IA;
- limites, descadastro e proteção de reputação.

## Marco 4 — Dados e Auditor Digital

- enriquecimento autorizado de contatos;
- validação de e-mail e telefone;
- dados empresariais com fonte e data;
- auditoria automática de site, SEO, desempenho e presença digital;
- comparação com concorrentes locais;
- mapa de oportunidades;
- recomendação de serviço e faixa de preço.

## Marco 5 — Scoring explicável

- Fit Score;
- Opportunity Score;
- Intent Score;
- Close Score;
- explicação detalhada dos fatores da nota;
- aprendizado com ganhos e perdas reais;
- revisão humana e ausência de dados inventados.

## Marco 6 — Agente comercial controlado

- modos assistido, semiautônomo e autônomo controlado;
- criação de ICP;
- priorização diária;
- abordagem e follow-up;
- interpretação de objeções;
- atualização automática do CRM;
- memória comercial por conta;
- aprovação obrigatória para ações sensíveis.

## Marco 7 — Automação visual

- construtor Gatilho → Condição → Ação → Espera → Decisão;
- criação por linguagem natural;
- testes de fluxo antes da publicação;
- versionamento, auditoria e reversão;
- webhooks e filas de execução.

## Marco 8 — Propostas, contratos e receita

- catálogo e pacotes;
- propostas personalizadas;
- assinatura eletrônica;
- Pix, cartão e recorrência;
- rastreamento de abertura;
- cobrança, renovação, upsell e cross-sell;
- geração de proposta baseada na auditoria digital.

## Marco 9 — Equipes e multiempresa

- workspaces e organizações;
- convites, papéis e permissões;
- metas por pessoa e equipe;
- distribuição de leads;
- isolamento por tenant;
- MFA, sessões, logs e LGPD;
- white label e subcontas para agências.

## Marco 10 — Analytics e inteligência de receita

- velocidade de vendas;
- ciclo, ticket, recorrência e churn;
- cohorts e forecasting;
- atribuição por origem e canal;
- desempenho de mensagens e sequências;
- respostas gerenciais em linguagem natural.

## Marco 11 — Mobile e produtividade

- PWA instalável;
- notificações push;
- uso offline básico;
- registro por voz;
- agenda, tarefas e CRM em poucos toques;
- aplicativos nativos após validação da PWA.

## Marco 12 — Plataforma e ecossistema

- API pública versionada;
- OAuth e tokens com escopo;
- webhooks;
- SDK e sandbox;
- n8n, Make e Zapier;
- Google Workspace e Microsoft 365;
- marketplace de integrações e templates.

## Regras de execução

Toda evolução deve:

1. manter `npm run quality` aprovado;
2. preservar compatibilidade e dados existentes;
3. incluir testes de unidade, integração e regressão;
4. manter segredos fora do Git;
5. documentar variáveis e migrações;
6. executar smoke test após o deploy;
7. medir adoção e resultado antes de ampliar o escopo.
