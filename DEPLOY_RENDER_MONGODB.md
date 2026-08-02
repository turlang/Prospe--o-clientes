# Guia rápido: MongoDB Atlas + Render

## 1. MongoDB Atlas

Crie um cluster gratuito M0.

Depois crie:

- Database user
- Senha
- Network Access

Para teste, libere:

```text
0.0.0.0/0
```

Copie a string de conexão:

```text
mongodb+srv://usuario:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Ajuste para:

```text
mongodb+srv://usuario:SENHA@cluster0.xxxxx.mongodb.net/prospeccao_leads?retryWrites=true&w=majority
```

## 2. Render

Crie um Web Service com:

```text
Build Command: npm install
Start Command: npm start
Health Check Path: /api/health
```

Variáveis obrigatórias:

```env
NODE_ENV=production
REQUIRE_MONGODB=true
JWT_SECRET=gere_uma_chave_grande
MONGODB_URI=sua_string_do_atlas
GOOGLE_PLACES_API_KEY=sua_chave_google
PUBLIC_APP_URL=https://seu-app.onrender.com
```

Variáveis opcionais:

```env
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_SUCCESS_URL=https://seu-app.onrender.com/?pagamento=sucesso
MERCADO_PAGO_FAILURE_URL=https://seu-app.onrender.com/?pagamento=falha
MERCADO_PAGO_PENDING_URL=https://seu-app.onrender.com/?pagamento=pendente
MERCADO_PAGO_WEBHOOK_URL=https://seu-app.onrender.com/api/billing/webhook
```

## 3. Teste de produção

Abra:

```text
https://seu-app.onrender.com/api/health
```

Verifique:

```json
"mongodbAtivo": true
```

Depois teste:

- cadastro
- login
- prospecção
- trial de 10 leads
- upgrade simulado/checkout
- CRM
- follow-up
