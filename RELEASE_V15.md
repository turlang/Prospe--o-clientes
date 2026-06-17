# Release v15.0.0 — Recuperação de Senha

## Incluído

- Botão **Esqueci minha senha** na tela de login.
- Geração de token seguro.
- Token com expiração de 30 minutos.
- Página `/reset-password.html`.
- Redefinição de senha com `bcrypt`.
- Token inutilizado após o uso.
- Collection `passwordresets`.
- Contador de resets no painel de segurança.

## Validação

1. Na tela de login, preencha o e-mail.
2. Clique em **Esqueci minha senha**.
3. No Render Logs, procure por `[PASSWORD_RESET_LINK]`.
4. Abra o link.
5. Defina uma nova senha.
6. Faça login com a nova senha.

## Observação

O envio por e-mail real está preparado como próxima melhoria.
Nesta versão, o link é exibido nos logs do Render para validação segura.
