# Plano de testes

## 1. Estratégia

O projeto utiliza testes automatizados com o módulo nativo `node:test`. A estratégia combina testes unitários de regras puras, testes estáticos de segurança e testes de regressão sobre artefatos de interface.

## 2. Níveis

| Nível | Objetivo | Exemplos |
|---|---|---|
| Unitário | Validar uma regra isolada | score, planos, campanhas, relatórios |
| Segurança | Bloquear classes conhecidas de falha | SSRF, segredo JWT, interpolação insegura |
| Regressão | Preservar correções já entregues | recuperação de senha, pipeline, cobrança |
| Estrutural | Impedir retorno ao monólito | factory, bootstrap e rotas por domínio |
| Integração manual | Validar dependências externas | MongoDB, Google Places, Mercado Pago, Resend |

## 3. Critérios de aceite

Uma versão pode ser empacotada quando:

1. todos os arquivos JavaScript passam em `node --check`;
2. todos os arquivos JavaScript possuem `@fileoverview`;
3. os documentos obrigatórios estão presentes;
4. a suíte automatizada não apresenta falhas;
5. o ZIP não contém `.env`, `node_modules` ou dados reais;
6. integrações externas pendentes estão declaradas no relatório de validação.

## 4. Comandos

```bash
npm ci
npm run check
```

Execuções específicas:

```bash
npm run check:syntax
npm run check:docs
npm test
```

## 5. Testes manuais de integração

- cadastrar e autenticar um usuário novo;
- executar uma prospecção real no Google Places;
- alterar um lead em todas as etapas do funil;
- exportar CSV com acentuação preservada;
- criar checkout do Mercado Pago em ambiente de teste;
- simular webhook aprovado e rejeitado;
- solicitar e concluir redefinição de senha;
- suspender usuário e confirmar bloqueio da sessão;
- alterar um plano no painel e confirmar novo limite.
