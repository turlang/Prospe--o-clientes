# Relatório de validação — LeadHunter Pro 23.9.0

## Escopo

A versão 23.9.0 adiciona ao painel administrativo uma ferramenta de reinicialização controlada dos dados operacionais, preservando todas as contas com função `admin`.

## Componentes implementados

- `src/services/databaseResetService.js`: política de prévia, confirmação, reautenticação, bloqueio concorrente e limpeza dos armazenamentos.
- `GET /api/admin/database-reset/preview`: estimativa de impacto da operação.
- `POST /api/admin/database-reset`: execução protegida por autenticação e papel administrativo.
- `public/admin.html` e `public/admin.js`: zona de perigo, prévia, senha atual, frase destrutiva e confirmação final.
- manutenção temporária de requisições mutáveis durante a reinicialização.
- recibo `ADMIN_DATABASE_RESET_COMPLETED` criado após a remoção da auditoria anterior.

## Dados preservados

- todas as contas com função `admin`;
- configurações de planos;
- código-fonte e variáveis de ambiente.

## Dados removidos

No MongoDB: leads, histórico de pesquisas, tarefas, uso, pagamentos, controles antiabuso, recuperações de senha, conversas do copiloto, auditoria anterior e usuários não administradores.

No JSON local: leads, tarefas, uso, conversas do copiloto e usuários não administradores.

## Controles de segurança

1. token autenticado;
2. função `admin` validada no servidor;
3. senha atual comparada com o hash armazenado;
4. frase exata `REINICIAR LEADHUNTER`;
5. confirmação final no navegador;
6. bloqueio quando nenhuma conta administrativa puder ser preservada;
7. bloqueio de reinicializações concorrentes;
8. senha e frase não são gravadas na auditoria.

## Resultado automatizado

- 104 arquivos JavaScript com sintaxe validada;
- 104 módulos com `@fileoverview` validados;
- 126 testes aprovados;
- 0 testes com falha;
- testes específicos para JSON local, MongoDB simulado, senha, frase, autorização, interface e preservação de administradores.

## Limitação do ambiente

A instalação completa das dependências não foi concluída no ambiente de execução. Por isso, o boot integrado com Express, MongoDB e bcrypt deve ser validado localmente após `npm ci`. As regras de domínio e regressões estáticas foram integralmente executadas.

## Comandos recomendados

```bash
npm ci
npm run check
npm start
```
