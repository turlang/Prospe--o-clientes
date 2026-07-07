# Case Técnico — LeadHunter Pro

## Problema

Pequenos negócios, vendedores, autônomos e agências frequentemente perdem oportunidades comerciais por falta de organização na prospecção. Leads ficam espalhados, follow-ups são esquecidos e não há clareza sobre plano, limite de uso, funil ou histórico.

## Solução

O LeadHunter Pro organiza a prospecção comercial em um SaaS com geração e gestão de leads, CRM, pipeline, exportação, planos de assinatura, painel administrativo, integração de pagamento e regras de segurança anti-abuso.

## Público-alvo

- Vendedores autônomos.
- Prestadores de serviço.
- Agências pequenas.
- Negócios locais.
- Profissionais que fazem prospecção ativa.

## Principais módulos

- Cadastro e login.
- CRM de leads.
- Pipeline comercial.
- Exportação CSV.
- Planos Trial, Pro e Agência.
- Integração Mercado Pago.
- Painel administrativo.
- Controle de assinatura.
- Limites por plano.
- Segurança anti-abuso.

## Arquitetura

```text
Frontend HTML/CSS/JavaScript
        |
        v
API Node.js/Express
        |
        v
Mongoose
        |
        v
MongoDB Atlas
        |
        v
Mercado Pago
```

## Decisões técnicas

### Express como base da API

Escolhido por simplicidade, velocidade de implementação e facilidade para organizar rotas SaaS, autenticação e regras de negócio.

### MongoDB com Mongoose

Permite modelar usuários, leads, planos e assinaturas com flexibilidade, mantendo evolução rápida do produto.

### JWT para autenticação

Permite controle de sessão via token e protege áreas internas do sistema.

### Mercado Pago

Integração escolhida por aderência ao mercado brasileiro e facilidade para pagamentos recorrentes ou planos pagos.

### Segurança anti-abuso

O projeto inclui limites de cadastro por IP, trial único, bloqueio de e-mails temporários e auditoria de tentativas.

## Diferenciais para empregabilidade

- Demonstra produto SaaS comercial.
- Tem integração real de pagamento.
- Possui CRM e pipeline.
- Usa autenticação e banco de dados.
- Mostra preocupação com segurança e limites de uso.
- Tem proposta de negócio clara.

## Riscos e pontos de melhoria

- Criar testes automatizados.
- Documentar endpoints da API.
- Adicionar screenshots do CRM e painel admin.
- Melhorar responsividade do painel.
- Refinar monitoramento e logs.
- Adicionar camada de serviços para reduzir lógica nas rotas.

## Evolução recomendada

1. Criar documentação de API.
2. Adicionar testes de autenticação e planos.
3. Melhorar dashboard do administrador.
4. Criar onboarding inicial.
5. Adicionar templates de abordagem comercial.
6. Adicionar segmentação de leads.

## Como apresentar em entrevista

Este projeto deve ser apresentado como um SaaS de CRM e prospecção comercial. O ponto forte é a união de regra de negócio, autenticação, pagamento, controle de assinatura, painel administrativo e foco em resolver uma dor real de vendas.
