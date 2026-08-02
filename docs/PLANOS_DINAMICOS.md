# Planos dinâmicos

## Fluxo de publicação

1. O administrador altera um plano em `/admin`.
2. `PATCH /api/admin/plans/:id` valida e normaliza os dados.
3. O catálogo em memória é atualizado para uso imediato pelas regras de negócio.
4. A configuração completa é persistida na coleção `plan_configurations` do MongoDB.
5. O Admin publica um evento local para abas abertas da landing.
6. A landing busca novamente `GET /api/plans` com política `no-store`.
7. O endpoint entrega um DTO público com preço, período, benefícios e limites.

## Persistência

Em produção, o MongoDB é a fonte durável. O arquivo `src/data/plans.json` é um
fallback local e não deve ser tratado como armazenamento persistente no Render,
pois o filesystem de runtime pode ser substituído em novos deploys.

## Diagnóstico

A resposta de `GET /api/plans` contém o cabeçalho `X-Plans-Revision`. O retorno
de `PATCH /api/admin/plans/:id` também informa a revisão publicada.
