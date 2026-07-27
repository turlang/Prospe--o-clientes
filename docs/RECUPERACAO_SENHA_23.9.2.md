# Recuperação de senha — versão 23.9.2

## Fluxo

1. O usuário informa o e-mail na tela de login.
2. A API valida se o provedor de e-mail está disponível.
3. Um token aleatório é criado e somente seu hash é persistido.
4. O link usa `PUBLIC_APP_URL` ou a URL pública detectada pelo proxy.
5. O e-mail é enviado pelo Resend com validade de 30 minutos.
6. Após a confirmação do envio, links anteriores são invalidados.
7. A nova senha é gravada com `bcrypt` e as sessões anteriores são revogadas.

## Render

Configure estas variáveis no serviço:

```env
PUBLIC_APP_URL=https://seu-servico.onrender.com
RESEND_API_KEY=re_sua_chave
MAIL_FROM=LeadHunter Pro <noreply@seu-dominio-verificado.com>
```

O domínio do remetente precisa estar verificado no Resend. O endereço `onboarding@resend.dev` serve apenas para testes limitados e não deve ser usado como remetente geral em produção.

## Desenvolvimento local

Sem `RESEND_API_KEY`, o link é registrado no terminal. Para também exibi-lo na interface local:

```env
EXPOSE_PASSWORD_RESET_LINK=true
```

Essa opção é ignorada em produção.
