# Roadmap — LeadHunter Pro

**Versão de referência:** 26.2.0  
**Última atualização:** 02/08/2026  
**Estado do produto:** núcleo funcional concluído e publicado

## Legenda

- ✅ concluído e incorporado ao produto;
- 🟡 implementação concluída, aguardando validação operacional do ambiente;
- 🔵 planejado para evolução futura;
- ⏸️ fora do escopo da release atual.

## Marco atual — v26.2.0 ✅

A versão 26.2.0 encerra o ciclo de estabilização, reorganização visual e higienização do repositório.

Entregas consolidadas:

- landing comercial responsiva em tela única;
- autenticação, cadastro e gerenciamento de sessão;
- recuperação de senha;
- CRM de leads e funil comercial;
- tarefas, follow-ups e plano de ação diário;
- histórico operacional e auditoria administrativa;
- relatórios, conversão e receita potencial;
- painel administrativo;
- planos Trial, Pro e Agência configuráveis;
- persistência MongoDB em produção;
- Copiloto Comercial com IA e fallback local;
- design system modular com profundidade 3D acessível;
- build resiliente da landing React com contingência estática;
- gates de arquitetura, frontend, estilos, documentação e segurança;
- higienização de arquivos estrangeiros e implementações legadas;
- 172 testes aprovados na validação da release;
- deploy da v26.2.0 validado no Render.

---

## Fase 15 — Recuperação de senha ✅

### Concluído

- tokens temporários de redefinição;
- expiração e invalidação dos tokens;
- armazenamento protegido no MongoDB;
- páginas de solicitação e redefinição;
- integração com Resend;
- proteção contra exposição do link em produção;
- testes de regressão do fluxo e da configuração pública.

### Validação operacional restante 🟡

- confirmar entrega para um destinatário real usando domínio verificado no Resend;
- revisar SPF, DKIM e reputação quando o domínio comercial estiver definido.

---

## Fase 16 — Automações comerciais ✅

### Concluído

- tarefas e sequências de follow-up;
- próximas ações sugeridas;
- priorização automática;
- plano de ação diário;
- radar operacional;
- abertura direta do lead prioritário;
- histórico de atividades;
- prevenção de duplicidade em rotinas críticas.

---

## Fase 17 — IA comercial ✅

### Concluído

- geração automática de abordagem;
- recomendações comerciais por contexto;
- sugestões de follow-up;
- identificação de gargalos;
- estratégias por segmento;
- suporte a Groq, Gemini e OpenAI;
- troca de provedor por configuração;
- timeout e limites de geração;
- fallback local quando a IA externa estiver indisponível;
- proteção contra exposição de chaves no painel administrativo.

### Validação operacional restante 🟡

- executar uma geração em produção com o provedor definitivo;
- confirmar persistência das conversas quando esse recurso for habilitado para uso contínuo;
- acompanhar custo, latência e taxa de falha do provedor escolhido.

---

## Fase 17.1 — Analytics e operação executiva ✅

### Concluído

- funil comercial com sete etapas;
- larguras proporcionais aos volumes reais;
- indicadores de contato, proposta e fechamento;
- receita potencial e leitura executiva;
- saúde do pipeline sem repetição de métricas;
- plano de ação integrado ao Cockpit;
- histórico consolidado;
- gráficos responsivos sem biblioteca externa obrigatória;
- tratamento específico para componentes estreitos e dispositivos móveis.

---

## Fase 17.2 — Design system e higienização ✅

### Concluído

- reorganização do CSS por responsabilidade;
- tokens visuais e regras documentadas;
- profundidade 3D discreta e acessível;
- revisão de tipografia, cores e espaçamento;
- remoção de cards e blocos redundantes;
- remoção de arquivos do DevBurger misturados ao repositório;
- eliminação de módulos antigos duplicados;
- remoção de páginas e componentes inacessíveis;
- testes para impedir a reintrodução de artefatos estrangeiros;
- atualização do cache-busting para 26.2.0.

---

## Fase 17.3 — Publicação e estabilidade ✅

### Concluído

- deploy da v26.2.0 no Render;
- assets públicos e administrativos versionados;
- MongoDB Atlas conectado;
- leitura de leads, tarefas, usuários, planos e auditoria;
- endpoints administrativos validados;
- relatório comercial validado;
- uso e limites dos planos validados;
- política para impedir fallback local acidental em produção;
- documentação de build, instalação e deploy atualizada.

---

## Fase 17.4 — Fechamento comercial de produção 🟡

Esta fase não exige novas funcionalidades centrais. Ela encerra a validação ponta a ponta dos serviços externos.

### Prioridade alta

- realizar pagamento de teste completo no Mercado Pago;
- confirmar recebimento e idempotência do webhook;
- confirmar atualização automática do plano após pagamento;
- validar URLs de sucesso, falha e pendência;
- realizar recuperação de senha com e-mail real;
- testar o provedor definitivo de IA em produção;
- reiniciar o serviço e confirmar a persistência dos dados.

### Critério de conclusão

A fase será considerada concluída quando um usuário de teste conseguir:

1. criar uma conta;
2. entrar no sistema;
3. criar ou importar um lead;
4. gerar uma abordagem comercial;
5. criar uma tarefa de follow-up;
6. recuperar a senha por e-mail;
7. contratar ou simular a contratação de um plano;
8. manter os dados após um novo deploy ou reinicialização.

---

## Fase 18 — Observabilidade e desempenho 🔵

### Objetivo

Reduzir o tempo de diagnóstico e manter desempenho previsível conforme o volume de dados crescer.

### Planejado

- logs estruturados com correlação por requisição;
- painel de erros e latência;
- métricas de chamadas aos provedores externos;
- alertas de falha do MongoDB, Resend, IA e pagamento;
- revisão dos índices do MongoDB;
- paginação e filtros no backend;
- cache controlado para consultas públicas;
- otimização das consultas administrativas e comerciais;
- testes de carga dos endpoints principais;
- definição de metas de disponibilidade e latência.

### Meta inicial

- endpoints de leitura comuns abaixo de 500 ms em condições normais;
- ausência de consultas sem limite em coleções crescentes;
- alertas claros para falhas de integração.

---

## Fase 19 — White label 🔵

### Planejado

- nome e logotipo configuráveis;
- paleta e identidade visual por conta;
- domínio próprio;
- e-mails transacionais personalizados;
- landing e painel com marca do cliente;
- configuração segura pelo painel administrativo.

### Dependências

- modelo multiempresa;
- armazenamento de configurações por organização;
- estratégia de domínios e certificados;
- isolamento de assets e cache.

---

## Fase 20 — Equipes e multiempresa 🔵

### Planejado

- organizações e workspaces;
- convite de membros;
- papéis e permissões avançadas;
- proprietário, administrador, gestor e operador;
- leads, tarefas e relatórios por organização;
- limites de plano por equipe;
- trilha de auditoria por usuário e empresa;
- isolamento lógico de dados;
- transferência de propriedade;
- desativação e remoção de membros.

### Requisito arquitetural

Toda consulta persistente deverá carregar e validar o identificador da organização antes de acessar dados comerciais.

---

## Fase 21 — Escala comercial 🔵

### Planejado

- importação em lote aprimorada;
- deduplicação por domínio, telefone e e-mail;
- campanhas com filas de processamento;
- templates compartilhados;
- segmentos salvos;
- relatórios por período e responsável;
- exportações assíncronas;
- webhooks de integração;
- API pública com tokens revogáveis;
- integrações com ferramentas de agenda e comunicação.

---

## Fora do escopo atual ⏸️

Os seguintes itens não fazem parte da v26.2.0 e não devem ser tratados como falhas da release:

- aplicativo móvel nativo;
- marketplace de templates;
- discador telefônico;
- envio massivo de mensagens sem integração oficial;
- enriquecimento de dados por fontes sem autorização;
- scraping irrestrito;
- multiempresa e white label completos.

---

## Regras para novas releases

Toda release deverá:

1. manter `npm run quality` aprovado;
2. preservar a higiene do repositório;
3. atualizar `CHANGELOG.md`, `README.md` e este roadmap quando o escopo mudar;
4. manter segredos e dados reais fora do Git;
5. validar a landing React e a contingência estática;
6. testar autenticação, planos, leads e relatórios;
7. executar deploy com limpeza de cache quando houver mudança estrutural;
8. realizar smoke test após a publicação;
9. documentar qualquer migração de banco ou variável nova;
10. preservar compatibilidade ou fornecer instruções explícitas de migração.

## Próximo passo recomendado

Concluir a **Fase 17.4 — Fechamento comercial de produção** antes de iniciar white label ou multiempresa. Ela possui menor esforço, maior impacto imediato e confirma que todos os serviços externos funcionam juntos no ambiente real.
