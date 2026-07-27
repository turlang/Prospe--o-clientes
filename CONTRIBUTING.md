# Guia de contribuição

## Objetivo

Este documento define como alterar o LeadHunter Pro sem comprometer a clareza acadêmica, a segurança ou os contratos existentes.

## Fluxo mínimo

1. Crie uma branch com nome descritivo.
2. Faça alterações pequenas e relacionadas a um único objetivo.
3. Atualize ou crie testes para regras de negócio e regressões.
4. Atualize a documentação quando contratos, rotas ou arquitetura mudarem.
5. Execute `npm run check` antes de abrir uma revisão.

## Padrão de código

- Use dois espaços de indentação e ponto e vírgula.
- Prefira funções curtas e nomes que indiquem intenção.
- Separe regras de domínio, acesso a dados e detalhes HTTP.
- Não adicione comentários que apenas repitam o código.
- Use JSDoc em módulos, funções exportadas, objetos complexos e decisões não evidentes.
- Nunca registre tokens, senhas, chaves ou dados pessoais completos.
- Toda entrada externa deve ser validada e toda saída HTML dinâmica deve ser escapada.

## Commits

Formato recomendado:

```text
tipo(escopo): descrição objetiva
```

Exemplos:

```text
fix(billing): validar proprietário do pagamento
refactor(routes): separar rotas administrativas
 docs(architecture): registrar política de persistência
```

## Critérios para revisão

Uma mudança só deve ser aceita quando:

- o comportamento esperado está documentado;
- a suíte de testes passa;
- não há dados sensíveis versionados;
- o código mantém responsabilidade única;
- a mudança não cria dependência circular;
- erros retornados ao cliente não expõem detalhes internos.
