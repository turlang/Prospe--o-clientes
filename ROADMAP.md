# Roadmap — LeadHunter Pro 28+

## Visão do produto

O LeadHunter Pro evolui de uma ferramenta de prospecção e CRM para um **Sistema Operacional Comercial e de Presença Digital**.

```text
Encontrar → Analisar → Identificar oportunidade → Recomendar solução
→ Criar demonstração → Abordar → Negociar → Fechar → Publicar
→ Promover → Medir resultados → Melhorar / Expandir
```

O objetivo não é adicionar funcionalidades indiscriminadamente. A prioridade é tornar o produto mais simples, intuitivo, orientado à próxima ação, comercialmente demonstrável e capaz de gerar valor depois da venda.

## Princípios

### Simplicidade primeiro

A interface deve responder principalmente:

1. O que aconteceu?
2. O que precisa da minha atenção?
3. O que devo fazer agora?

### Uma jornada comercial

Experiência principal pretendida:

```text
Início | Prospecção | CRM | Conversas | Propostas | Relatórios
```

Configurações, integrações, pipelines, campos personalizados, catálogo, usuários e administração ficam em áreas secundárias.

### Uma fonte de verdade

Lead, empresa, contato, oportunidade, negociação e cliente devem possuir relações e estados claros, sem cadastros concorrentes ou informações divergentes.

### IA como infraestrutura

A inteligência aparece dentro das ações normais: analisar empresa, criar abordagem, criar demonstração, responder cliente, criar proposta, planejar follow-up e criar campanha.

### Automação controlada

A evolução seguirá três níveis: assistido, programado/semiautomático e automático controlado. Ações sensíveis exigem autorização, limites, auditoria, logs, interrupção e respeito às regras dos provedores.

---

## Marco 0 — Verdade do produto

Confirmar o estado real antes de expandir:

- versão e commit da `main`;
- commit publicado no Render;
- MongoDB e dependências externas;
- módulos realmente funcionais;
- módulos demonstrativos;
- integrações reais e simuladas;
- funcionalidades incompletas ou abandonadas;
- documentação divergente.

Uma funcionalidade só é operacional quando está na `main`, passa pelos gates, está publicada, foi testada e funciona no ambiente de produção.

## Marco 1 — Limpeza e UX

Primeiro grande trabalho do novo ciclo.

Inventariar páginas, menus, submenus, modais, dashboards, formulários, tabelas, Kanbans, filtros, relatórios, configurações, ações e componentes duplicados.

Classificar cada item como:

```text
MANTER | SIMPLIFICAR | FUNDIR | MOVER | REDESENHAR | REMOVER
```

Reorganizar a arquitetura de informação e criar um dashboard orientado à ação, destacando acontecimentos, pendências e próxima melhor ação.

Revisar sobreposição entre Lead/Empresa/Contato/Oportunidade/Cliente/Negociação; Atividade/Tarefa/Follow-up/Conversa; IA/Copiloto/SDR/Automação.

**Gate:** novo usuário consegue buscar empresa → analisar → salvar → abordar → mover no CRM → criar follow-up sem conhecimento prévio do sistema.

## Marco 2 — Prospecção 2.0

Transformar busca em descoberta de oportunidades.

Cada resultado deve enfatizar empresa, contato, presença digital, problemas encontrados, oportunidade, serviço sugerido e próxima ação, reduzindo dados brutos sem contexto.

## Marco 3 — Auditor Digital

Motor para identificar problemas comercialmente relevantes com evidência.

Analisar, quando aplicável: site, HTTPS, mobile, velocidade, SEO, acessibilidade, CTA, WhatsApp, formulário, agendamento, analytics, pixels, redes sociais, reputação e presença local.

Cada achado deve possuir evidência, impacto, confiança, data e serviço relacionado. Nunca inventar deficiência sem evidência suficiente.

## Marco 4 — Scoring explicável

Separar a avaliação em:

- Fit Score;
- Opportunity Score;
- Reachability Score;
- Intent Score;
- Close Score.

Componentes, evidências, ausência de dados e incerteza devem ser visíveis.

## Marco 5 — CRM simplificado

Preservar o CRM 360 reduzindo a complexidade aparente.

Pipeline padrão:

```text
Novo → Analisado → Contatado → Respondeu → Proposta → Negociação → Fechado
```

Pipelines avançados continuam configuráveis. Cada oportunidade enfatiza estado, última interação, próxima ação, valor, probabilidade e responsável.

## Marco 6 — Comunicação real

Concluir e validar a infraestrutura existente de WhatsApp Cloud API: envio, recebimento, status, webhook, associação com lead, histórico, templates, consentimento e DO_NOT_CONTACT.

Depois: Gmail, Outlook, calendário e agendamento.

## Marco 7 — SDR assistido

Transformar a fundação atual em assistente comercial utilizável.

A IA prepara abordagem, analisa contexto e respostas, identifica objeções, sugere próxima ação/follow-up e auxilia atualização do CRM.

Fluxo inicial:

```text
IA sugere → humano aprova → sistema executa
```

## Marco 8 — Demonstração comercial

Criar o **LeadHunter Demo**.

A partir da oportunidade, gerar demonstrações de site institucional, landing page, cardápio digital, catálogo, página de produto/serviço, captação, agendamento, página promocional ou integração WhatsApp.

A demonstração deve permanecer vinculada ao lead/oportunidade e separada do projeto definitivo.

## Marco 9 — Templates inteligentes

Biblioteca inicial por segmentos, começando por restaurante/pizzaria, clínica, barbearia/salão, automotivo e serviços profissionais.

Templates serão compostos por blocos reutilizáveis, como Hero, Serviços, Produtos, Galeria, Depoimentos, Mapa, Horário, WhatsApp, Formulário e CTA.

## Marco 10 — Preview e link comercial

Gerar endereço temporário compartilhável para a demonstração e registrar, quando permitido, criação, envio, abertura, visitas e interações relevantes.

Esses eventos retornam ao CRM e ajudam a determinar a próxima ação.

## Marco 11 — Proposta inteligente

Fluxo:

```text
Auditoria → Problema → Serviço recomendado → Demonstração → Escopo → Preço → Proposta
```

Vincular proposta, demonstração, oportunidade e histórico comercial.

## Marco 12 — Contratos e pagamento

Adicionar contrato, assinatura eletrônica, Pix, cartão, parcelamento, recorrência, webhook e estado financeiro.

```text
Proposta → Aceite → Contrato → Pagamento → Cliente
```

## Marco 13 — Editor visual

Somente após validar o gerador. Permitir editar texto, imagens, seções, cores, CTA e ordem dos blocos. O objetivo é edição rápida, não replicar um construtor genérico complexo.

## Marco 14 — Publicação

Transformar demonstração vendida em projeto real com publicação, domínio, SSL, versionamento, rollback e analytics.

Manter separação explícita entre DEMO e SITE DO CLIENTE.

## Marco 15 — Marketing Agent

Após a publicação, permitir que o projeto continue ajudando o negócio a gerar demanda.

```text
Site → Marketing Agent → Conteúdo/Campanhas → Redes sociais
→ Visitantes → Site → WhatsApp/Formulário → Leads/Vendas
```

O agente só opera contas e canais explicitamente autorizados.

## Marco 16 — Social Media

Integrações oficiais inicialmente com Instagram e Facebook. Avaliar LinkedIn, TikTok e outros canais conforme segmento, APIs e políticas disponíveis.

Usar permissões mínimas e contas conectadas pelo próprio cliente.

## Marco 17 — Gerador de campanhas

Transformar promoções, produtos, serviços, eventos e conteúdo do negócio em conjuntos de campanha: posts, stories quando suportados, CTA, landing promocional, link rastreável e mensagem comercial.

## Marco 18 — Calendário de marketing

Calendário editorial baseado em segmento, sazonalidade, promoções, produtos, serviços, eventos, datas relevantes e histórico mensurável de desempenho.

## Marco 19 — Autopromoção controlada

Três níveis:

1. Assistido: IA cria → cliente revisa → cliente publica.
2. Programado: cliente aprova → agenda → sistema publica.
3. Automático controlado: regra autorizada → geração/publicação dentro de limites → medição.

Sempre com frequência máxima, categorias permitidas, logs, interrupção e controles antiabuso.

## Marco 20 — SEO contínuo

Monitorar títulos, descrições, conteúdo, páginas, links, indexação, SEO local, desempenho e problemas técnicos. Alterações significativas devem ser recomendadas antes de execução automática, salvo autorização explícita apropriada.

## Marco 21 — Landings dinâmicas

Permitir que campanhas criem páginas específicas em vez de direcionar todo tráfego à homepage.

```text
Campanha → Landing específica → CTA → WhatsApp/Formulário
```

## Marco 22 — Analytics comercial

Unificar marketing e vendas medindo o funil observável entre campanha, interação, visita, contato, oportunidade e venda. Não alegar causalidade quando os dados não sustentarem atribuição.

## Marco 23 — Marketing Copilot

Permitir perguntas em linguagem natural sobre resultados, sempre respondidas com dados verificáveis. Recomendações devem estar ligadas às métricas que as sustentam.

## Marco 24 — Automação visual

```text
Gatilho → Condição → Ação → Espera → Decisão
```

Suportar automações comerciais e de marketing com simulação, versionamento, auditoria, reversão, limites, filas, retentativas e dead-letter queue.

## Marco 25 — Customer Success

Depois da venda, acompanhar site, campanhas, leads, manutenção e resultados. Identificar oportunidades de renovação, upsell, cross-sell e melhoria sem inventar necessidades.

## Marco 26 — Equipes e agências

Organizações, workspaces, convites, papéis, permissões, territórios, metas, distribuição de leads, isolamento por tenant, MFA, auditoria, white label e subcontas.

## Marco 27 — Portal do cliente

Interface simplificada para o cliente final acompanhar site, campanhas, resultados, leads, mensagens, pagamentos e solicitações sem acessar o CRM completo da agência/vendedor.

## Marco 28 — Receita recorrente

Permitir estruturar ofertas que combinem criação com serviços recorrentes, como hospedagem, manutenção, Marketing Agent, social media, analytics e IA.

## Marco 29 — Inteligência de receita

Medir, quando houver dados suficientes: CAC, ticket, MRR, churn, conversão, ciclo comercial, velocidade de vendas, origem, campanhas, canais, serviços e segmentos.

A IA explica dados; não inventa dados.

## Marco 30 — Mobile

Priorizar PWA instalável para CRM, tarefas, conversas, aprovação de conteúdo, campanhas, propostas e notificações. Aplicativo nativo somente se houver justificativa posterior.

## Marco 31 — Plataforma e ecossistema

Depois da consolidação: API pública versionada, OAuth, webhooks, SDK, sandbox, n8n, Make, Zapier, Google Workspace, Microsoft 365 e marketplace de integrações/templates.

---

## Arquitetura final pretendida

```text
                    LEADHUNTER PRO
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   AQUISIÇÃO             VENDAS             ENTREGA
        │                  │                  │
  Prospecção             CRM              Studio
  Auditor               Conversas          Sites
  Scoring                SDR               Publicação
        │                  │                  │
        └─────────────── Proposta ───────────┘
                           │
                         Venda
                           │
                           ▼
                     SITE DO CLIENTE
                           │
                           ▼
                    MARKETING AGENT
                           │
             ┌─────────────┼─────────────┐
             │             │             │
           Social         SEO        Campanhas
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                       VISITANTES
                           │
                           ▼
                    LEADS / CONTATOS
                           │
                           ▼
                          CRM
                           │
                           ▼
                        RECEITA
```

O ciclo é:

```text
ENCONTRAR → VENDER → ENTREGAR → PROMOVER → GERAR DEMANDA → MEDIR → MELHORAR ↺
```

## Ordem prática de desenvolvimento

### Fase A
Marco 0 — Verdade do produto  
Marco 1 — Limpeza e UX

### Fase B
Marco 2 — Prospecção 2.0  
Marco 3 — Auditor Digital  
Marco 4 — Scoring explicável

### Fase C
Marco 5 — CRM simplificado  
Marco 6 — Comunicação real  
Marco 7 — SDR assistido

### Fase D
Marco 8 — Demonstração  
Marco 9 — Templates  
Marco 10 — Preview

### Fase E
Marco 11 — Propostas  
Marco 12 — Contratos e pagamentos

### Fase F
Marco 13 — Editor  
Marco 14 — Publicação

### Fase G
Marcos 15–19 — Marketing Agent, social, campanhas, calendário e autopromoção

### Fase H
Marcos 20–23 — SEO, landings, analytics e Marketing Copilot

### Fase I
Marcos 24–29 — Automação, Customer Success, equipes, portal e inteligência de receita

### Fase J
Marcos 30–31 — Mobile e ecossistema

## Regra de entrega

Cada marco será quebrado em entregas pequenas com:

```text
Objetivo → Escopo → Banco → Backend → Frontend → Testes
→ Documentação → Gate → Deploy → Smoke test
```

Toda evolução deve:

1. manter `npm run quality` aprovado;
2. preservar compatibilidade e dados existentes;
3. incluir testes adequados e regressão para bugs corrigidos;
4. manter segredos fora do Git;
5. documentar variáveis e migrações;
6. confirmar o commit implantado;
7. executar smoke test em produção antes de declarar a entrega operacional.

## Próxima entrega

O desenvolvimento deve retomar pelo **Marco 0 + Marco 1**.

Primeiro será produzido um inventário da interface e dos recursos atuais, classificando cada item como MANTER, SIMPLIFICAR, FUNDIR, MOVER, REDESENHAR ou REMOVER. Depois será definido o novo mapa de navegação e os fluxos principais.

Somente então a interface será reorganizada. Isso evita construir Demonstrações, Marketing Agent e outras capacidades novas sobre uma experiência já identificada como pouco intuitiva.
