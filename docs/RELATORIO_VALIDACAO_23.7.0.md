# Relatório de validação — versão 23.7.0

**Data:** 27 de julho de 2026  
**Escopo:** refatoração estrutural, comentários, documentação acadêmica e preservação de regressões.

## Evidências automatizadas

| Verificação | Resultado |
|---|---|
| Sintaxe JavaScript | 95 arquivos aprovados |
| Padrão documental | 95 módulos e 9 documentos obrigatórios aprovados |
| Testes automatizados | 97 aprovados, 0 falhas |
| Paridade de endpoints | 57 rotas no servidor anterior e 57 na arquitetura nova |
| Dados locais distribuídos | arquivos vazios, sem usuários ou leads reais |

## Alterações estruturais verificadas

- `src/server.js` reduzido para bootstrap de infraestrutura;
- `src/app.js` implementa Application Factory e não chama `listen`;
- rotas separadas em cinco módulos por domínio;
- políticas financeiras puras extraídas para `src/domain/billingPolicy.js`;
- duplicidade de `module.exports` removida de `campaignEngine.js`;
- contratos de domínio registrados em `src/types/domain.js`;
- cabeçalhos `@fileoverview` adicionados aos módulos JavaScript;
- HTML e CSS identificados por responsabilidade;
- controlador legado do frontend organizado por seções.

## Comando reproduzível

```bash
npm run check
```

## Limitação da validação

As dependências não foram instaladas neste ambiente durante esta revisão. A suíte foi estruturada para testar regras puras sem carregar Mongoose, porém a inicialização completa com Express, MongoDB, Google Places, Mercado Pago e Resend deve ser executada em uma máquina com `npm ci` e credenciais de teste.
