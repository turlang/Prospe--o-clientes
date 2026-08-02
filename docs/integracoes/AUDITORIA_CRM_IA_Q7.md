# Auditoria técnica — CRM-IA/Q7 → LeadHunter Pro

## Escopo analisado

A auditoria considerou o ZIP `Claude_Code_Version(1).zip`, contendo 96 arquivos do projeto CRM-IA/Q7, incluindo:

- frontend React 18 + Vite + TypeScript + Tailwind;
- backend local Node/Express com persistência JSON;
- adaptadores frontend para mock, API local e Supabase;
- migrações e políticas RLS do Supabase;
- funções de borda para Gemini, UaiZapi, webhook e envio de mensagens;
- páginas de Dashboard, CRM, WhatsApp, Agente IA, Configuração, Perfil e Admin;
- documentação operacional e especificação técnica.

A referência foi comparada com a arquitetura vigente do LeadHunter Pro, que já possui Express, MongoDB/Mongoose, autenticação JWT, planos Trial/Pro/Agência, CRM, tarefas, auditoria, IA comercial, billing, rate limit, Helmet, CSP e testes automatizados.

## Conclusão executiva

O CRM-IA/Q7 contém boas ideias de produto e componentes visuais, mas não deve ser incorporado como backend de produção. O reaproveitamento correto é:

1. adaptar a experiência de central de conversas, configuração do agente, playground, indicadores e ajuda contextual;
2. reescrever integrações, persistência, autenticação e webhooks na arquitetura do LeadHunter;
3. preservar MongoDB, JWT, planos, limites, auditoria e isolamento já existentes;
4. não importar credenciais, contas, marcas ou regras específicas da Q7 Educação.

## Pontos positivos encontrados

- contrato único de backend para alternar mock/API/Supabase;
- separação visual das páginas e componentes React;
- playground do agente com prompt dinâmico;
- centralização de mensagens de erro em português;
- indicadores de conexão e guias contextuais;
- RLS do Supabase baseada em proprietário e função administrativa;
- funções separadas para webhook, envio de mensagem e agente de IA;
- modo de demonstração claramente sinalizado;
- Kanban simples e compreensível.

## Riscos e incompatibilidades

### Críticos — proibidos em produção

- segredo de autenticação com fallback fixo;
- administrador definido por e-mail fixo;
- senha administrativa padrão documentada e semeada;
- persistência principal em `server/data.json`;
- CORS aberto com `app.use(cors())`;
- tokens de sessão e chaves de integração em `localStorage`;
- chaves Gemini/UaiZapi usadas diretamente no navegador no modo local;
- conexão de WhatsApp marcada como conectada sem prova real;
- endpoints que retornam HTTP 200 mesmo em falhas;
- ausência de rate limit, validação de schema, idempotência e proteção contra replay no backend local.

### Altos

- webhook UaiZapi não valida assinatura criptográfica;
- mensagem externa pode ser processada sem deduplicação robusta;
- modelos de chat/mensagem são simples demais para entrega, leitura, mídia, correlação e transferência humana;
- configuração SDR não possui versões, publicação, restauração ou validação completa;
- agente retorna principalmente texto livre, sem contrato forte de qualificação;
- mock possui usuários e senhas em texto puro;
- frontend e backend podem selecionar estratégias diferentes por variáveis, aumentando risco de comportamento divergente.

### Médios

- nomes de endpoints UaiZapi variam e estão codificados como suposição;
- falta de fila, retentativa e dead-letter queue;
- falta de controle de custo e limite de tokens por plano;
- onboarding é marcado como concluído sem armazenar progresso estruturado;
- CRM de referência possui apenas quatro etapas e não pode substituir o funil maduro do LeadHunter.

## Decisões arquiteturais

- MongoDB permanece como banco principal.
- Autenticação e autorização continuam sob o LeadHunter.
- O novo domínio será isolado em `domain/omnichannel`, `integrations`, `repositories`, `services`, `controllers` e `routes`.
- Credenciais serão criptografadas no backend.
- Provedores implementarão contratos comuns.
- Toda consulta usará `userId` e, quando o multi-tenant for ativado, `organizationId`.
- O modo demo utilizará provedores simulados explícitos e nunca será apresentado como integração real.
- O agente produzirá texto e saída estruturada validada.
- Webhooks usarão idempotência, correlação, validação e logs sem segredos.

## Resultado da Fase 1

A referência é útil principalmente para UX, fluxos e organização conceitual. A base técnica de produção deve ser reescrita como módulos nativos do LeadHunter.
