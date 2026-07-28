# Landing React + Tailwind — versão 24.2.0

## Objetivo

Reposicionar a página pública do LeadHunter Pro para desenvolvedores, freelancers,
agências de tecnologia e especialistas em automação que vendem sites, sistemas e
agentes de IA.

## Estrutura

- Header responsivo com CTA para `/app`.
- Hero escuro com proposta de valor específica para serviços de tecnologia.
- Fluxo de prospecção: varredura, diagnóstico, abordagem com IA e CRM Kanban.
- Seção de público-alvo.
- Cards de ferramentas.
- Planos carregados por `/api/plans` com fallback local.
- CTA final e rodapé.

## Stack

- React 19
- Vite
- Tailwind CSS 4 via `@tailwindcss/vite`
- Lucide React

## Correções no painel autenticado

Os gráficos passaram a usar container queries. Assim, o layout compacto é ativado
pela largura real do card, inclusive em viewport emulada, iframe ou coluna estreita,
e não apenas pela largura global da janela.
