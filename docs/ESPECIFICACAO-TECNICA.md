# Especificação Técnica Acadêmica

## 1. Finalidade

O sistema permite que clientes consultem um cardápio, adicionem produtos ao carrinho, escolham entrega ou retirada e enviem um pedido. Administradores podem cadastrar produtos e alterar o estado operacional dos pedidos.

## 2. Arquitetura lógica

A solução adota um monorepositório com duas aplicações independentes:

```text
Navegador
  └── React/Vite
        └── HTTP/JSON + JWT
              └── Express API
                    ├── Middlewares
                    ├── Controllers
                    ├── Services
                    └── Prisma ORM
                          └── PostgreSQL
```

### 2.1. Separação de responsabilidades

- **Página/Componente:** apresentação e interação.
- **Contexto React:** estado compartilhado de sessão e carrinho.
- **Controller:** adaptação HTTP, sem regra de negócio complexa.
- **Service:** regras de negócio e orquestração de persistência.
- **Middleware:** autenticação, autorização, validação e erros.
- **Prisma:** mapeamento objeto-relacional e transações.

## 3. Estrutura de diretórios

```text
delivery-burger-academico/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.js
│   │   └── src/
│   │       ├── config/
│   │       ├── errors/
│   │       ├── lib/
│   │       ├── middlewares/
│   │       ├── modules/
│   │       │   ├── auth/
│   │       │   ├── orders/
│   │       │   └── products/
│   │       ├── routes/
│   │       ├── utils/
│   │       ├── app.js
│   │       └── server.js
│   └── web/
│       └── src/
│           ├── api/
│           ├── components/
│           ├── contexts/
│           ├── pages/
│           ├── routes/
│           └── utils/
├── docs/
├── scripts/
└── docker-compose.yml
```

## 4. Regras de negócio

1. O e-mail de usuário deve ser único.
2. A senha deve possuir no mínimo oito caracteres, com letras maiúsculas, minúsculas e números.
3. Somente produtos disponíveis podem ser adicionados a um pedido.
4. O preço final é calculado no servidor; preços enviados pelo navegador são ignorados.
5. Cada item de pedido mantém nome, imagem e preço unitário como fotografia histórica.
6. Retirada no local possui frete igual a zero.
7. Entrega custa R$ 7,90; pedidos com subtotal a partir de R$ 70,00 recebem frete gratuito.
8. Um pedido deve possuir ao menos um item e no máximo vinte unidades por item.
9. Clientes consultam apenas os próprios pedidos.
10. Administradores podem consultar todos os pedidos e alterar seu estado.
11. As transições de estado respeitam a sequência definida no serviço de pedidos.

## 5. Estados do pedido

```text
PENDING → CONFIRMED → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED
   └──────────────────────────────→ CANCELED
```

Para retirada, o estado `OUT_FOR_DELIVERY` não é obrigatório; o administrador pode avançar de `READY` para `DELIVERED`.

## 6. Autenticação

O servidor emite um JWT assinado com HS256. O token contém:

- `sub`: identificador do usuário.
- `role`: papel do usuário.
- `iss`: emissor configurado.
- `aud`: audiência configurada.
- `exp`: expiração.

Rotas protegidas recebem o cabeçalho:

```http
Authorization: Bearer <token>
```

## 7. Modelo de dados

### Entidades

- **User:** identidade e papel de acesso.
- **Product:** item comercializável do cardápio.
- **Order:** cabeçalho financeiro e logístico.
- **OrderItem:** quantidade e fotografia histórica do produto.

### Cardinalidades

```text
User 1 ─── N Order
Order 1 ─── N OrderItem
Product 1 ─── N OrderItem
```

## 8. Decisões de engenharia

- PostgreSQL foi escolhido por consistência transacional e relações explícitas.
- Prisma reduz código repetitivo de persistência e oferece operações relacionais e transações.
- Zod centraliza contratos de entrada.
- Context API é suficiente para o escopo; Redux não é necessário.
- Fetch nativo reduz dependências.
- Valores monetários são persistidos em `Decimal(10,2)`.
- A criação do pedido ocorre em transação para preservar consistência.

## 9. Limites deliberados do projeto

O checkout é simulado. Não existe captura de cartão, Pix real, geocodificação, cálculo por distância, emissão fiscal ou integração com entregadores. Esses módulos devem ser adicionados por adaptadores externos, sem misturar credenciais de terceiros aos controllers.
