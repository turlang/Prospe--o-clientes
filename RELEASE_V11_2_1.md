# Release v11.2.1 — Estabilização de sessão e plano

## Correções

- Botão Sair limpa sessão e volta imediatamente para a landing page.
- Não precisa mais apertar F5 após logout.
- Retorno de pagamento limpa a URL após sincronização.
- Sincronização de plano após pagamento reforçada.
- Sidebar atualiza plano/limite após login e retorno do Mercado Pago.

## Validação

1. Faça login.
2. Clique em Sair.
3. Deve voltar para `/` imediatamente.
4. Faça login novamente.
5. O plano deve aparecer correto na sidebar.
