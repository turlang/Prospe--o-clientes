# Release v15.1.0 — Correções Admin e Anti-Abuso

## Problemas corrigidos

### Admin preso no Painel Master

Agora o admin pode:

- Entrar automaticamente em `/admin`.
- Clicar em **Abrir dashboard** e acessar `/app?adminDashboard=1`.
- Usar o dashboard comum.
- Voltar ao Painel Master pelo botão **Painel Master** no menu.

### Registro BLOCKED no anti-abuso

Agora o painel de segurança possui ações para:

- Remover registro individual.
- Limpar registros por e-mail.
- Limpar registros anti-abuso automaticamente quando um usuário é promovido para admin.

## Validação

1. Faça login como admin.
2. Confirme que abre `/admin`.
3. Clique em **Abrir dashboard**.
4. Confirme que abre o dashboard comum.
5. Volte pelo botão **Painel Master**.
6. Na seção Segurança, clique em **Remover** ou **Limpar e-mail** em um registro bloqueado.
