# Arquitetura — LeadHunter Pro

## Visão
O projeto é um SaaS de prospecção comercial com CRM, planos, pagamentos, painel administrativo e motor de estratégias comerciais.

## Camadas atuais
- `public/`: interface HTML/CSS/JS.
- `src/server.js`: servidor Express e rotas principais.
- `src/services/`: regras de negócio reutilizáveis.
- `src/models/`: modelos MongoDB/Mongoose.
- `src/middleware/`: autenticação, admin, logs e rate limit.
- `tests/`: testes automatizados.

## Nova direção
A evolução deve continuar migrando responsabilidades de `server.js` para services e rotas dedicadas, mantendo entregas pequenas e validadas.

## Motor de Estratégias Comerciais
O arquivo `src/services/salesStrategyEngine.js` centraliza a lógica de diagnóstico do lead, seleção de estratégia, mensagem personalizada e sequência sugerida de follow-up.

## V20.6 — Prompt Engine Comercial

A geração de abordagem agora passa por uma camada de briefing antes da IA:

```text
Lead salvo
  -> Motor local de estratégia
  -> Perfil comercial do lead
  -> Memória comercial/timeline
  -> Prompt Engine Comercial
  -> Provedor de IA (Groq/Gemini/OpenAI)
  -> Fallback local quando necessário
```

O objetivo é impedir mensagens genéricas. O prompt enviado à IA contém:

- empresa, segmento, score e maturidade digital;
- dor principal e oportunidades detectadas;
- estratégia recomendada;
- histórico recente de abordagens e respostas;
- modo de geração: nova, variação, melhoria ou follow-up;
- regras de qualidade para evitar clichês e informações inventadas.

Cada abordagem gerada é registrada na timeline do lead para que futuras versões não repitam o mesmo argumento.
