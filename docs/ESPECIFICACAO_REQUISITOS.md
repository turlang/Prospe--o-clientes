# Especificação de requisitos de software

## 1. Escopo

O LeadHunter Pro é uma aplicação SaaS para prospecção de estabelecimentos, qualificação de leads, organização do funil de vendas, preparação de abordagens comerciais, planejamento de follow-ups e administração de planos.

## 2. Atores

| Ator | Responsabilidade |
|---|---|
| Visitante | Conhecer o produto e acessar cadastro ou login |
| Usuário comercial | Prospectar, organizar leads e executar atividades comerciais |
| Administrador | Gerenciar usuários, planos, segurança e pagamentos |
| Provedor de lugares | Fornecer estabelecimentos pesquisados |
| Provedor de pagamento | Processar e informar o estado de assinaturas |
| Provedor de IA | Melhorar textos comerciais quando configurado |

## 3. Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | Permitir cadastro, login, logout e recuperação de senha | Alta |
| RF-02 | Impedir acesso de contas suspensas | Alta |
| RF-03 | Prospectar estabelecimentos por segmento e região | Alta |
| RF-04 | Qualificar e ordenar leads por pontuação comercial | Alta |
| RF-05 | Persistir leads por proprietário | Alta |
| RF-06 | Atualizar estágio, observações e interações do lead | Alta |
| RF-07 | Gerar abordagens e respostas sugeridas | Média |
| RF-08 | Criar campanhas e follow-ups com revisão humana | Média |
| RF-09 | Exibir indicadores e relatórios comerciais | Média |
| RF-10 | Exportar leads e relatórios em CSV | Média |
| RF-11 | Controlar consumo de acordo com o plano | Alta |
| RF-12 | Criar checkout e reconciliar pagamentos | Alta |
| RF-13 | Permitir edição administrativa dos planos | Alta |
| RF-14 | Registrar ações administrativas relevantes | Alta |
| RF-15 | Manter proteção de trial por usuário/dispositivo | Alta |

## 4. Requisitos não funcionais

| ID | Requisito | Critério verificável |
|---|---|---|
| RNF-01 | Segurança | JWT, autorização por papel, CSP, CORS e rate limit ativos |
| RNF-02 | Privacidade | Dados de usuários isolados por proprietário |
| RNF-03 | Disponibilidade | Endpoint `/api/health` informa estado do processo e banco |
| RNF-04 | Manutenibilidade | Camadas separadas e módulos com `@fileoverview` |
| RNF-05 | Testabilidade | Aplicação criada por factory sem abrir porta automaticamente |
| RNF-06 | Portabilidade | Execução em Node.js 20 a 22 e configuração por ambiente |
| RNF-07 | Integridade | Escrita local atômica e MongoDB obrigatório em produção |
| RNF-08 | Observabilidade | Logs HTTP e métricas administrativas protegidas |
| RNF-09 | Usabilidade | Interface em português do Brasil e valores em real |
| RNF-10 | Desempenho | Limite de payload e paginação/filtros onde aplicável |

## 5. Casos de uso resumidos

### UC-01 — Prospectar leads

**Pré-condições:** usuário autenticado, conta ativa e limite disponível.  
**Fluxo principal:** informar segmento/região → consultar provedor → normalizar → pontuar → filtrar → persistir → contabilizar uso → exibir resultados.  
**Exceções:** provedor indisponível, limite esgotado, entrada inválida ou falha de persistência.

### UC-02 — Alterar plano de usuário

**Pré-condições:** administrador autenticado.  
**Fluxo principal:** selecionar usuário → selecionar plano válido → persistir alteração → registrar auditoria → devolver usuário atualizado.  
**Exceções:** usuário inexistente, plano inválido ou tentativa de remover o último acesso administrativo necessário.

### UC-03 — Reconciliar pagamento

**Pré-condições:** pagamento conhecido pelo provedor.  
**Fluxo principal:** receber identificador → consultar provedor → validar proprietário, valor e moeda → registrar pagamento → ativar plano.  
**Exceções:** pagamento divergente, usuário não associado ou ambiente sem credenciais.


### RF-ADM-RESET-01 — Prévia de reinicialização
O sistema deve permitir que administradores consultem uma estimativa dos registros que serão excluídos.

### RF-ADM-RESET-02 — Limpeza integral controlada
O sistema deve remover pesquisas, leads, tarefas, uso, pagamentos, registros de segurança, conversas do copiloto, auditoria anterior e usuários não administradores.

### RF-ADM-RESET-03 — Preservação administrativa
O sistema deve preservar todas as contas cuja função seja `admin` e bloquear a operação quando nenhuma conta administrativa puder ser preservada.

### RNF-SEG-RESET-01 — Confirmação reforçada
A operação deve exigir sessão administrativa válida, senha atual, frase exata de confirmação e confirmação explícita na interface.
