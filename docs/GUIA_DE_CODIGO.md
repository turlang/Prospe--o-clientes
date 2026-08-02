# Guia de código e comentários

## 1. Finalidade

Este guia estabelece um padrão uniforme para que estudantes, avaliadores e desenvolvedores consigam compreender o projeto sem depender do autor original.

## 2. Organização por camadas

| Camada | Diretório | Responsabilidade |
|---|---|---|
| Bootstrap | `src/server.js` | Inicializar persistência e porta HTTP |
| Composição HTTP | `src/app.js` | Configurar middlewares e registrar módulos |
| Rotas | `src/routes/` | Traduzir HTTP para chamadas de domínio |
| Serviços | `src/services/` | Aplicar regras de negócio reutilizáveis |
| Núcleo | `src/core/` | Processar Sales OS, memória, IA e automação |
| Persistência | `src/models/`, `src/*Store.js` | Ler e gravar entidades |
| Segurança | `src/security/`, `src/middleware/` | Autenticar, autorizar e validar entradas |
| Interface | `public/` | Exibir dados e capturar ações do usuário |
| Testes | `tests/` | Proteger contratos e regressões |

## 3. Regra para comentários

Um comentário deve explicar pelo menos um destes pontos:

- por que uma decisão foi tomada;
- qual contrato precisa ser preservado;
- qual risco de segurança está sendo mitigado;
- qual regra de negócio não é óbvia;
- qual limitação temporária ainda existe.

Comentários que apenas traduzem a instrução seguinte são proibidos.

### Exemplo inadequado

```js
// Soma um ao contador.
counter += 1;
```

### Exemplo adequado

```js
// O consumo é contabilizado somente após a persistência do lead para evitar
// cobrar uma tentativa que falhou antes de gerar valor ao usuário.
await addDailyUsage(userId, persistedLeads.length);
```

## 4. JSDoc

Todo módulo deve conter `@fileoverview`. Funções exportadas devem documentar parâmetros, retorno e erros relevantes.

```js
/**
 * Normaliza um plano antes de persistir alterações administrativas.
 *
 * @param {object} input Dados recebidos pela API.
 * @param {object} current Plano atualmente persistido.
 * @returns {object} Plano validado e normalizado.
 * @throws {Error} Quando limites ou preço são inválidos.
 */
function normalizePlan(input, current) {}
```

## 5. Tratamento de erros

- Rotas devem capturar erros esperados e delegar a serialização a `sendApiError`.
- Serviços devem lançar erros com mensagem técnica suficiente para logs, sem dados secretos.
- A resposta de produção não deve conter stack trace.
- Falhas de dependências obrigatórias impedem o bootstrap.

## 6. Nomenclatura

- Funções: verbo + objeto, como `buildCommercialReport`.
- Booleanos: prefixos `is`, `has`, `can` ou `should`.
- Constantes: `UPPER_SNAKE_CASE`.
- Arquivos: `camelCase.js` para módulos CommonJS.
- Rotas: substantivos e ações coerentes com o domínio existente.

## 7. Limites de tamanho

Os limites não são absolutos, mas funcionam como alerta:

- bootstrap: até 150 linhas;
- composição da aplicação: até 400 linhas;
- módulo de rotas: até 600 linhas;
- função: preferencialmente até 50 linhas;
- arquivo de serviço: preferencialmente até 500 linhas.

Arquivos legados acima do limite devem ser reduzidos progressivamente, sem refatorações arriscadas sem testes.
