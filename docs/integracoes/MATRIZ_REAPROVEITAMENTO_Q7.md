# Matriz de reaproveitamento — CRM-IA/Q7

| Recurso | Arquivo de origem | Arquivo de destino | Classificação | Adaptações necessárias | Riscos | Status | Testes |
|---|---|---|---|---|---|---|---|
| Contrato único de backend | `src/lib/backend/types.ts` | arquitetura de services/repositories do LeadHunter | USAR COMO REFERÊNCIA | Converter para contratos por domínio e CommonJS atual | Não confundir mock com produção | Mapeado | arquitetura |
| Cliente HTTP centralizado | `src/lib/backend/api.ts` | futura camada `public/assets/shared/api-client.js` | ADAPTAR | Remover token exposto, padronizar timeout, correlation ID e erros | sessão em localStorage no original | Planejado | frontend/API |
| Tradução de erros | `src/lib/translateError.ts` | `src/utils/httpError.js` + catálogo frontend | ADAPTAR | Códigos estáveis, mensagem pública e detalhes privados | mascaramento incompleto | Planejado | unitário |
| HelpGuide | `src/components/HelpGuide.tsx` | componentes contextuais do dashboard | ADAPTAR | Aplicar design system atual e carregamento progressivo | poluição visual | Planejado | acessibilidade |
| DemoBanner | `src/components/layout/DemoBanner.tsx` | modo demo do LeadHunter | REUTILIZAR | Ajustar identidade e regras de isolamento | confusão com produção | Planejado | E2E demo |
| Sidebar/AppLayout | `src/components/layout/*` | shell do dashboard atual | USAR COMO REFERÊNCIA | Não substituir a navegação existente; incorporar novas áreas | segunda identidade visual | Mapeado | visual |
| Kanban | `src/pages/CRM.tsx` | CRM atual | ADAPTAR | Preservar etapas, validações, histórico, métricas e auditoria | regressão do CRM | Planejado | regressão/drag |
| Configurador SDR | `src/pages/AgenteIA.tsx` | módulo Agente SDR | REESCREVER | Versões, rascunho/publicação, contratos, campos completos e segredos backend | prompt incompleto | Em implementação | API/unitário |
| Playground | `src/pages/AgenteIA.tsx` | AgentSession/AgentEvaluation | ADAPTAR | Isolamento, saída estruturada, cenários, custo e guardrails | alterar produção por engano | Em implementação | playground |
| Prompt Builder | `src/lib/promptBuilder.ts` | `src/domain/omnichannel/promptCompiler.js` | ADAPTAR | Remover Q7, adicionar serviços digitais, dados permitidos e proibições | prompt injection | Implementado na fundação | unitário |
| Gemini direto no browser | `src/lib/ai/gemini.ts` | `src/integrations/ai/GeminiProvider.js` | REESCREVER | Executar somente no backend, timeout, schema e limite | chave exposta | Planejado | integração |
| UaiZapi direto no browser | `src/lib/whatsapp/uaizapi.ts` | `src/integrations/messaging/UaiZapiProvider.js` | REESCREVER | Backend, endpoints configuráveis, assinatura e idempotência | token exposto/CORS | Planejado | integração/webhook |
| Backend local JSON | `server/db.js` | MongoDB/repositories atuais | DESCARTAR | Nenhuma; somente referência de entidades | perda/corrupção e concorrência | Descartado | n/a |
| Auth local HMAC | `server/auth.js` | auth JWT existente | DESCARTAR | Preservar JWT do LeadHunter | secret fixo | Descartado | segurança |
| Servidor local | `server/index.js` | rotas/controllers/services do LeadHunter | USAR COMO REFERÊNCIA | Reescrever status HTTP, validação, autorização e persistência | CORS aberto e admin fixo | Mapeado | API/segurança |
| Migração Supabase | `supabase/migrations/0001_init.sql` | modelos Mongoose | USAR COMO REFERÊNCIA | Traduzir entidades e índices; não substituir MongoDB | duplicidade de banco | Mapeado | modelos |
| RLS Supabase | `supabase/migrations/0002_policies.sql` | filtros `userId/organizationId` e RBAC | USAR COMO REFERÊNCIA | Aplicar autorização por recurso em todos os repositories | bypass de tenant | Em implementação | isolamento |
| Webhook | `supabase/functions/whatsapp-webhook/index.ts` | controller público de webhook | REESCREVER | assinatura, replay, schema, idempotência, fila e correlação | fraude/duplicidade | Planejado | segurança/webhook |
| Envio de mensagem | `supabase/functions/send-message/index.ts` | MessagingProvider | REESCREVER | estado de entrega, retentativa, auditoria e limites | spam/falhas silenciosas | Planejado | integração |
| Agente edge | `supabase/functions/ai-agent/index.ts` | AiProvider + AgentSdrService | REESCREVER | saída estruturada, validação, guardrails, custo e planos | alucinação | Em implementação | unitário/integração |
| Modo mock | `src/lib/backend/mock.ts` | DemoWorkspace + provedores demo | ADAPTAR | Sem credenciais reais, sem dados de produção, reset seguro | contas/senhas em texto | Planejado | isolamento demo |
| Configurações em localStorage | `src/lib/settings.ts` | CredentialVault backend | DESCARTAR | Criptografia AES-GCM e máscara | vazamento de segredo | Fundação implementada | segurança |
| Documentação Q7 | `docs/*.docx`, `README.md`, `PROJECT_PROMPT.md` | documentação LeadHunter | USAR COMO REFERÊNCIA | Atualizar nomes, arquitetura e integrações reais | instruções conflitantes | Mapeado | documentação |
