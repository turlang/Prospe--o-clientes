# Release 25.0.0 — Higienização e landing resiliente

## Incidente corrigido

A landing em produção permanecia visualmente igual porque o ZIP não continha o resultado do build React. A rota `/` encontrava o fallback HTML antigo e o servia sem indicar a regressão.

## Correção

- landing React/Tailwind reorganizada por funcionalidades;
- contingência estática redesenhada e sincronizada com a mesma versão;
- artefato público `public/landing-react/index.html` incluído no pacote;
- validação obrigatória por versão, título e IDs de seção;
- cabeçalhos de diagnóstico e cache desativado para HTML;
- backend instalado com `npm ci` e frontend isolado em pacote próprio com versões exatas;
- teste de regressão específico para impedir retorno do HTML antigo.

## Higienização

- backend separado em `config`, `domain`, `repositories`, `integrations`, `services`, `routes` e `infrastructure`;
- páginas e assets públicos separados por contexto;
- caminhos absolutos centralizados;
- módulos mortos removidos;
- imports e testes atualizados para os novos caminhos;
- documentação técnica e padrões de código atualizados.

## Compatibilidade

Login, recuperação de senha, painel, CRM, planos, MongoDB, Resend e administração foram preservados. Dados existentes não são migrados ou apagados por esta release.
