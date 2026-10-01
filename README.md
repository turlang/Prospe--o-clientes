# LeadHunter Pro

> Encontre empresas, descubra oportunidades, apresente uma solução, feche a venda e ajude o cliente a continuar gerando negócios.

O **LeadHunter Pro** é uma plataforma comercial para freelancers, desenvolvedores, agências e pequenas equipes que vendem sites, sistemas, automações, inteligência artificial e outros serviços digitais.

A visão do produto conecta todo o ciclo comercial:

```text
Encontrar → Analisar → Identificar oportunidade → Demonstrar solução
→ Abordar → Negociar → Fechar → Entregar → Promover → Medir → Melhorar
```

O LeadHunter não pretende ser apenas mais um CRM. A proposta é descobrir empresas com necessidades digitais reais, transformar sinais verificáveis em oportunidades comerciais compreensíveis e acompanhar o profissional da prospecção aos resultados posteriores à venda.

## O problema

Profissionais e pequenas agências normalmente usam várias ferramentas para encontrar empresas, armazenar contatos, controlar pipeline, conversar, gerar propostas, entregar sites, publicar conteúdo e medir resultados.

Além da fragmentação, existe um problema anterior: **encontrar uma empresa não significa encontrar uma boa oportunidade**.

O vendedor ainda precisa descobrir:

- qual empresa realmente precisa de ajuda;
- qual problema digital existe;
- qual serviço faz sentido oferecer;
- como demonstrar valor;
- como abordar o responsável;
- quando fazer follow-up;
- se a solução entregue produziu resultado.

O LeadHunter procura transformar essa sequência em um fluxo único.

## Como funciona

Exemplo conceitual:

```text
Bella Napoli Pizzaria

Site                Não encontrado
WhatsApp            Disponível
Reputação           Boa
Presença local      Ativa

Problemas
• ausência de site próprio
• ausência de cardápio web
• dependência de redes sociais

Oportunidade        ALTA
Solução sugerida    Site + Cardápio Digital
Próxima ação        Criar demonstração
```

O objetivo não é apenas mostrar dados, mas responder: **existe uma oportunidade comercial aqui e qual é a próxima ação?**

## Estado atual

A versão 27.0.0 possui uma base operacional com:

- autenticação, usuários, planos e administração;
- prospecção e Google Places;
- auditoria pública inicial;
- CRM 360, pipelines, Kanban e lista;
- tarefas e follow-ups;
- propostas e clientes;
- relatórios e visão executiva;
- IA com Groq, Gemini e OpenAI;
- estrutura de billing com Mercado Pago;
- Central de Conversas em modo demonstrativo;
- fundação omnichannel e SDR/outbound;
- adaptador para Meta WhatsApp Cloud API ainda dependente de configuração e validação real.

Recursos descritos como visão ou roadmap não devem ser interpretados como disponíveis em produção. Consulte [`ROADMAP.md`](ROADMAP.md) para a sequência planejada.

## Auditor Digital

A evolução do LeadHunter inclui um **Auditor Digital** para analisar sinais verificáveis como:

- existência e qualidade básica do site;
- HTTPS, mobile e desempenho;
- SEO e acessibilidade;
- formulários, CTA, WhatsApp e agendamento;
- analytics e pixels;
- presença social, reputação e presença local.

Cada diagnóstico deverá preservar evidência, origem e data. O sistema não deve inventar deficiências quando não houver informação suficiente.

O objetivo é traduzir problemas em oportunidades vendáveis:

```text
Problema → Impacto → Oportunidade → Serviço sugerido → Próxima ação
```

## Scoring explicável

A inteligência comercial será dividida em componentes compreensíveis:

- **Fit Score:** aderência ao público procurado;
- **Opportunity Score:** intensidade da oportunidade digital;
- **Reachability Score:** possibilidade real de contato;
- **Intent Score:** sinais verificáveis de interesse;
- **Close Score:** sinais do histórico comercial relacionados ao avanço da oportunidade.

Sempre que possível, o sistema deverá explicar os fatores utilizados e a incerteza existente.

## CRM 360

O CRM atual oferece recursos como:

- múltiplos pipelines e etapas configuráveis;
- Kanban e lista;
- campos personalizados e filtros;
- catálogo de produtos e serviços;
- valor de contrato e receita recorrente;
- forecast e metas;
- motivos de perda e reativação;
- importação, exportação e deduplicação;
- histórico comercial.

A próxima evolução de UX pretende preservar essa capacidade reduzindo a complexidade aparente e orientando a interface para a próxima ação.

## Inteligência comercial e SDR

A IA deve funcionar como infraestrutura dentro do fluxo normal:

```text
Analisar empresa → Explicar oportunidade → Sugerir serviço
→ Preparar abordagem → Analisar resposta → Preparar follow-up → Criar proposta
```

A fundação atual inclui contratos de IA e mensageria, fila persistente de outbound, controles de consentimento, deduplicação, retentativas e kill-switch para envio externo.

A evolução seguirá o princípio:

```text
IA sugere → humano aprova → sistema executa
```

Autonomia maior só será habilitada depois de validação operacional e controles adequados.

## Demonstrações comerciais

Uma das principais novas capacidades planejadas é permitir mostrar uma solução antes do fechamento.

Em vez de apenas dizer ao cliente que determinado serviço pode ser criado, o vendedor poderá gerar uma demonstração vinculada à oportunidade.

Tipos previstos:

- site institucional;
- landing page;
- cardápio digital;
- catálogo;
- página de produto ou serviço;
- página promocional;
- captação de leads;
- agendamento;
- integração com WhatsApp.

A demonstração poderá gerar um endereço temporário compartilhável e registrar eventos comerciais, como visualização e interação, quando tecnicamente e legalmente apropriado.

## Da demonstração ao projeto real

```text
Demonstração → Proposta → Contrato → Pagamento → Publicação → Site do cliente
```

A evolução planejada inclui templates, editor visual, publicação, domínio, SSL, versionamento e analytics.

Demonstração e projeto definitivo permanecerão conceitos separados.

## Marketing Agent

A visão de longo prazo continua depois da publicação.

O **Marketing Agent** deverá ajudar o cliente a promover o negócio usando contas e integrações explicitamente autorizadas:

```text
Site → Marketing Agent → Conteúdo/Campanhas → Redes sociais
→ Visitantes → Site → WhatsApp/Formulário → Oportunidades
```

Poderá auxiliar na criação de:

- posts e campanhas;
- promoções e landing pages;
- CTAs e links rastreáveis;
- conteúdo e calendário editorial;
- SEO contínuo;
- análise de resultados.

Integrações sociais deverão utilizar APIs e mecanismos oficiais, permissões mínimas necessárias, logs e possibilidade de interrupção.

## Autopromoção controlada

A automação será progressiva:

1. **Assistido:** IA cria, humano revisa e publica.
2. **Programado:** humano aprova, agenda e o sistema publica.
3. **Automático controlado:** regras previamente autorizadas permitem geração/publicação dentro de limites definidos.

Toda automação deverá possuir autorização, limites, histórico, logs, mecanismos antiabuso e interrupção.

## Marketing conectado a vendas

O objetivo é ligar divulgação a resultado mensurável, sem inventar atribuição.

```text
Campanha → Impressões/Interações → Visitas → Contatos
→ Oportunidades → Vendas
```

Quando os dados não permitirem afirmar que uma campanha causou uma venda, o sistema deverá mostrar apenas a relação observável disponível.

## Para quem é

Principalmente:

- freelancers;
- desenvolvedores e web designers;
- profissionais de automação e IA;
- agências;
- consultores digitais;
- pequenas equipes comerciais.

Especialmente profissionais que precisam encontrar e desenvolver a própria carteira de clientes.

## Arquitetura

Fluxo principal atual:

```text
HTTP
→ middleware
→ routes
→ services/use cases
→ domain
→ repositories/integrations
→ MongoDB ou provedor externo
```

Princípios:

- regras de negócio fora das rotas;
- persistência atrás de repositórios;
- integrações atrás de contratos;
- segredos fora do código;
- isolamento por usuário;
- Application Factory testável;
- testes de regressão;
- build e deploy reproduzíveis.

Documentação técnica: [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) e [`docs/MAPA_DO_CODIGO.md`](docs/MAPA_DO_CODIGO.md).

## Tecnologias atuais

### Backend

- Node.js 20;
- Express 4;
- MongoDB Atlas;
- Mongoose 8;
- JWT e bcryptjs;
- Helmet e CORS.

### Frontend

- HTML e JavaScript modular na aplicação autenticada;
- CSS modular;
- React, Vite e Tailwind na landing.

A modernização e simplificação da experiência fazem parte do novo roadmap.

### Integrações atuais ou preparadas

- Google Places;
- Groq;
- Gemini;
- OpenAI;
- Resend;
- Mercado Pago;
- Meta WhatsApp Cloud API.

## Estrutura do projeto

```text
.
├── frontend/landing/
├── public/
│   ├── pages/
│   └── assets/
├── src/
│   ├── config/
│   ├── domain/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── integrations/
│   └── infrastructure/
├── tests/
├── scripts/
├── docs/
├── ROADMAP.md
├── render.yaml
└── package.json
```

## Executando localmente

Requisitos:

- Node.js `>=20.19 <23`;
- npm `>=10`;
- MongoDB para produção;
- Git.

### Bash

```bash
git clone https://github.com/turlang/Prospe--o-clientes.git
cd Prospe--o-clientes
npm ci
npm --prefix frontend/landing install --include=dev
cp .env.example .env
npm run build
npm run quality
npm start
```

### PowerShell

```powershell
git clone https://github.com/turlang/Prospe--o-clientes.git
Set-Location Prospe--o-clientes
npm ci
npm --prefix frontend/landing install --include=dev
Copy-Item .env.example .env
npm run build
npm run quality
npm start
```

Endereço padrão: `http://localhost:3000`

- `/` — landing;
- `/app` — aplicação autenticada;
- `/admin` — administração.

Use `.env.example` como fonte de verdade das variáveis de ambiente. Nunca publique `.env`.

## Qualidade

A suíte completa é executada com:

```bash
npm run quality
```

Ela agrega gates de higiene, sintaxe, documentação, arquitetura, frontend, estilos e testes automatizados. A evolução do projeto deve manter esses gates aprovados.

## Segurança e uso responsável

Princípios:

- segredos somente em variáveis de ambiente;
- autenticação e isolamento de dados;
- validação e proteção HTTP;
- auditoria e controles antiabuso;
- criptografia de credenciais de integração;
- consentimento e bloqueio para comunicação automatizada;
- kill-switch para operações externas sensíveis;
- respeito às políticas e permissões dos provedores externos.

Credenciais reais nunca devem ser adicionadas ao Git.

## Roadmap

A próxima fase começa pela própria experiência do LeadHunter:

```text
Verdade do produto e limpeza/UX
→ Prospecção 2.0
→ Auditor Digital
→ Scoring
→ CRM simplificado
→ Comunicação real
→ SDR assistido
→ Demonstrações
→ Propostas/Contratos
→ Publicação
→ Marketing Agent
→ Autopromoção
→ Analytics
→ Automação
→ Plataforma
```

Leia [`ROADMAP.md`](ROADMAP.md) para a especificação completa.

## Filosofia

O LeadHunter parte de uma ideia simples:

**uma empresa encontrada não é necessariamente uma oportunidade.**

O valor aparece quando conseguimos compreender:

```text
Quem precisa de ajuda?
→ Qual é o problema?
→ O que podemos oferecer?
→ Como podemos demonstrar?
→ Como podemos vender?
→ Funcionou?
```

## Visão

O objetivo final é permitir que um profissional use o LeadHunter para **encontrar uma empresa, entender sua necessidade, apresentar uma solução concreta, conquistar o cliente, entregar o projeto e continuar ajudando aquele negócio a gerar resultados**.
