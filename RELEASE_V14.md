# Release v14.0.0 — Segurança e Anti-abuso

## Incluído

- Proteção contra criação indefinida de usuários.
- Limite de cadastros por IP em 24h.
- 1 teste gratuito por dispositivo.
- Bloqueio de domínios de e-mail temporários.
- Registro de tentativas permitidas e bloqueadas na collection `trialguards`.
- Campos `deviceId` e `registrationIp` no usuário.
- `REGISTER_IP_DAILY_LIMIT=3`.
- Painel Admin com seção de Segurança e Anti-abuso.

## Como funciona

- Cada navegador recebe um `deviceId` salvo no `localStorage`.
- No cadastro, o frontend envia esse `deviceId`.
- O backend bloqueia novo trial se o dispositivo já tiver usado o teste.
- O backend limita o número de contas por IP em 24h.
- O backend bloqueia domínios de e-mail descartáveis conhecidos.

## Variável de ambiente

```env
REGISTER_IP_DAILY_LIMIT=3
```
