# Auditoria de Engenharia — versão 25.0.0

## Resultado

A higienização reorganizou o projeto por responsabilidades e corrigiu o pipeline que mantinha a landing antiga em produção.

## Pontos resolvidos

- módulos de domínio, persistência, integração e rotas deixaram a raiz de `src`;
- páginas e assets públicos foram separados por contexto;
- landing React foi dividida em `app`, `features`, `shared`, `hooks`, `services` e `data`;
- artefato público versionado passou a integrar o ZIP;
- fallback antigo foi substituído por uma contingência equivalente à release;
- testes e verificadores impedem caminhos legados e builds incompletos;
- documentação e rastreabilidade foram atualizadas.

## Dívida técnica restante

O controlador `public/assets/dashboard/app.js` continua amplo por compatibilidade com o painel já operacional. A redução deve ocorrer por fatias verticais, começando por autenticação, CRM e gráficos, sempre mantendo os testes de interface. A CSP ainda aceita handlers inline exclusivamente nessa interface legada.

## Regras de evolução

1. Código novo não deve ser adicionado ao controlador legado quando puder viver em módulo independente.
2. Nenhuma rota acessa arquivo de dados diretamente; use repositórios.
3. Nenhuma regra de negócio nova deve depender de Express.
4. Toda alteração pública da landing deve atualizar a versão e passar por `verify:landing`.
5. Nenhum deploy deve usar `npm install`; a instalação reproduzível é `npm ci`.
