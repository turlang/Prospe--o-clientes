# Arquitetura — LeadHunter Pro 25.0.0

## 1. Objetivos

A arquitetura prioriza separação de responsabilidades, baixo acoplamento, testabilidade, segurança por padrão e deploy reproduzível.

## 2. Camadas do backend

```text
HTTP → routes → services/use cases → domain → repositories/integrations
```

- `routes`: valida o contrato HTTP, aplica políticas e serializa respostas;
- `services`: coordena casos de uso e transações lógicas;
- `domain`: regras puras, sem Express, rede ou persistência;
- `repositories`: adapta MongoDB e armazenamento JSON local;
- `integrations`: encapsula provedores externos;
- `infrastructure`: inicialização de conexões e detalhes operacionais;
- `config`: valores da aplicação e caminhos absolutos centralizados.

`src/app.js` usa Application Factory e não abre porta. `src/server.js` executa o bootstrap do processo.

## 3. Frontend público

A landing adota organização por funcionalidades:

```text
src/app        composição
src/features   hero, fluxo, ferramentas, público, preços e CTA
src/shared     layout e UI reutilizável
src/hooks      estado e efeitos
src/services   acesso à API
src/data       conteúdo estático
```

A página pública tem duas saídas da mesma release:

1. bundle React/Tailwind produzido pelo Vite;
2. contingência estática visualmente equivalente.

O script `verify-landing-build.js` exige a versão `25.0.0`, o título comercial e todas as seções obrigatórias. Assim, a aplicação não volta silenciosamente para a landing antiga.

## 4. Painel autenticado

As páginas ficam em `public/pages`; CSS e controladores ficam em `public/assets` separados por domínio (`dashboard`, `admin`, `auth`). O painel legado continua funcional e deve ser migrado progressivamente para componentes, sempre protegido por testes de regressão.

## 5. Fluxo de dados

- entrada externa é normalizada na borda;
- regras de negócio não dependem de objetos Express;
- persistência é acessada por repositórios;
- erros operacionais são convertidos para respostas pela camada HTTP;
- segredos são lidos somente de variáveis de ambiente.

## 6. Segurança

- autenticação JWT e verificação de usuário ativo;
- autorização administrativa separada;
- rate limit para APIs;
- Helmet/CSP, CORS explícito e limite de corpo;
- URLs públicas normalizadas;
- MongoDB obrigatório em produção;
- recuperação de senha com token de uso único e e-mail transacional;
- logs sem segredos e respostas sem detalhes internos.

## 7. Decisões de compatibilidade

A CSP ainda permite handlers inline apenas no painel legado. Isso é dívida técnica registrada; código novo React não usa handlers HTML inline ou `dangerouslySetInnerHTML`.

## 8. Diagnóstico de release

`GET /api/health` informa versão e origem do artefato da landing. Respostas HTML públicas recebem `Cache-Control: no-store`, `X-Application-Version`, `X-Landing-Version` e `X-Landing-Source`.
