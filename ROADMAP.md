# Roadmap — LeadHunter Pro

**Versão atual:** 26.2.0  
**Estado:** núcleo funcional concluído, publicado e conectado ao MongoDB Atlas

Este documento apresenta o produto como uma única entrega consolidada. O histórico interno de etapas foi removido para manter o planejamento objetivo e alinhado ao estado real da aplicação.

## Entrega atual

O LeadHunter Pro já reúne:

- landing comercial responsiva em tela única;
- cadastro, login e gerenciamento de sessão;
- recuperação de senha;
- CRM de leads e funil comercial;
- tarefas, follow-ups e plano de ação diário;
- histórico operacional;
- relatórios de conversão e receita potencial;
- painel administrativo;
- planos Trial, Pro e Agência configuráveis;
- persistência no MongoDB Atlas;
- auditoria administrativa;
- Copiloto Comercial com IA e fallback local;
- integração preparada para Resend e Mercado Pago;
- design system modular com profundidade 3D acessível;
- landing React com contingência estática;
- gates de arquitetura, frontend, estilos, documentação e segurança;
- 172 testes aprovados;
- deploy validado no Render.

## Fechamento operacional

As funcionalidades centrais estão concluídas. Restam apenas validações dos serviços externos usados em produção.

### Prioridade imediata

- enviar uma recuperação de senha para um destinatário real usando domínio verificado no Resend;
- realizar um pagamento completo de teste no Mercado Pago;
- confirmar a idempotência do webhook;
- confirmar a atualização automática do plano após o pagamento;
- gerar uma abordagem usando o provedor definitivo de IA;
- confirmar a persistência das conversas do Copiloto quando esse recurso estiver habilitado;
- reiniciar o serviço e verificar a permanência dos dados.

### Critério de encerramento operacional

Um usuário de teste deve conseguir:

1. criar uma conta;
2. entrar no sistema;
3. criar ou importar um lead;
4. gerar uma abordagem comercial;
5. criar uma tarefa de follow-up;
6. recuperar a senha por e-mail;
7. contratar ou simular um plano;
8. permanecer com os dados após reinicialização ou novo deploy.

## Próximas evoluções

### Observabilidade e desempenho

- logs estruturados com correlação por requisição;
- acompanhamento de erros e latência;
- métricas dos provedores externos;
- alertas de falha do MongoDB, Resend, IA e pagamento;
- revisão de índices do MongoDB;
- paginação e filtros no backend;
- otimização das consultas administrativas e comerciais;
- testes de carga;
- metas de disponibilidade e tempo de resposta.

Meta inicial:

- leituras comuns abaixo de 500 ms em condições normais;
- consultas limitadas e paginadas em coleções crescentes;
- alertas claros para falhas de integração.

### White label

- nome e logotipo configuráveis;
- paleta visual por conta;
- domínio próprio;
- e-mails transacionais personalizados;
- landing e painel com a marca do cliente;
- configuração segura pelo painel administrativo.

### Equipes e multiempresa

- organizações e workspaces;
- convite de membros;
- papéis e permissões avançadas;
- leads, tarefas e relatórios por organização;
- limites de plano por equipe;
- auditoria por usuário e empresa;
- isolamento lógico de dados;
- transferência de propriedade;
- remoção e desativação de membros.

Requisito arquitetural: toda consulta persistente deverá validar o identificador da organização antes de acessar dados comerciais.

### Escala comercial

- importação em lote aprimorada;
- deduplicação por domínio, telefone e e-mail;
- campanhas com filas de processamento;
- templates compartilhados;
- segmentos salvos;
- relatórios por período e responsável;
- exportações assíncronas;
- webhooks de integração;
- API pública com tokens revogáveis;
- integrações com agenda e comunicação.

## Fora do escopo atual

- aplicativo móvel nativo;
- marketplace de templates;
- discador telefônico;
- envio massivo sem integração oficial;
- enriquecimento de dados por fontes sem autorização;
- scraping irrestrito;
- white label e multiempresa completos.

## Regras para evolução

Toda alteração futura deve:

1. manter `npm run quality` aprovado;
2. preservar a organização atual do repositório;
3. atualizar `README.md`, `ROADMAP.md` e `CHANGELOG.md` quando o escopo mudar;
4. manter segredos e dados reais fora do Git;
5. validar a landing React e a contingência estática;
6. testar autenticação, planos, leads e relatórios;
7. usar limpeza de cache no deploy quando houver mudança estrutural;
8. executar smoke test após a publicação;
9. documentar migrações de banco e novas variáveis;
10. preservar compatibilidade ou fornecer instruções explícitas de migração.

## Próxima ação recomendada

Concluir as validações externas de e-mail, pagamento e IA antes de iniciar white label ou multiempresa.
