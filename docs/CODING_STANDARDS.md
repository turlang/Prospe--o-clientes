# Padrões de Código

## Princípios

- responsabilidade única e dependências explícitas;
- funções pequenas, nomes orientados ao domínio e retornos previsíveis;
- composição em vez de duplicação;
- validação na borda e regra de negócio isolada;
- segurança e acessibilidade como critérios de aceite.

## JavaScript e Node.js

- CommonJS no backend existente; ESM no Vite/React;
- `const` por padrão e `let` apenas quando há reatribuição;
- `async/await` com tratamento no limite adequado;
- nenhuma captura vazia de erro;
- caminhos de arquivos centralizados em `src/config/paths.js`;
- módulos não devem executar servidor ou conectar ao banco durante importação;
- funções públicas complexas devem declarar contrato com JSDoc.

## React

- componentes puros: renderização não altera estado externo;
- efeitos somente para sincronização com sistemas externos;
- hooks em nível superior e dependências explícitas;
- dados remotos em `services` e estado assíncrono em `hooks`;
- conteúdo repetido em estruturas de dados, não em marcação duplicada;
- chaves estáveis; nenhum índice quando a identidade do item existe;
- proibido `dangerouslySetInnerHTML` sem análise de segurança formal.

## CSS e responsividade

- mobile-first;
- nenhuma largura fixa maior que o viewport;
- `min-width: 0` em filhos de grid/flex que recebem conteúdo variável;
- overflow horizontal limitado ao componente que realmente necessita;
- estados `hover`, `focus-visible`, `disabled` e `aria-expanded` coerentes;
- suporte a `prefers-reduced-motion`.

## Acessibilidade

- HTML semântico e ordem de títulos coerente;
- foco visível por teclado;
- links e botões com nomes acessíveis;
- imagens informativas com texto alternativo;
- contraste suficiente e informação não dependente apenas de cor;
- skip link para o conteúdo principal.

## Segurança

- nunca interpolar HTML não confiável;
- validar, limitar e normalizar entradas;
- não registrar tokens, senhas ou dados sensíveis;
- segredos somente por variáveis de ambiente;
- respostas públicas não expõem stack trace;
- backend travado pelo `package-lock.json` e instalado por `npm ci`; o frontend mantém versões diretas exatas no seu próprio `package.json` e deve gerar/atualizar seu lockfile sempre que houver acesso ao registro npm.

## Comentários

O padrão exige comentários de intenção, não narração linha a linha:

- `@fileoverview` explica a responsabilidade do módulo;
- JSDoc documenta contratos públicos ou lógica complexa;
- comentários locais explicam por que uma decisão existe;
- comentários que apenas traduzem a instrução seguinte são removidos.

## Nomenclatura

- componentes React: `PascalCase`;
- funções, variáveis e arquivos utilitários: `camelCase`;
- constantes globais: `UPPER_SNAKE_CASE`;
- booleanos começam com `is`, `has`, `can` ou `should`;
- rotas e serviços usam vocabulário do negócio.

## Critérios antes de merge/deploy

```bash
npm ci
npm run build
npm run quality
```

A alteração deve incluir teste quando modifica contrato, regra, segurança ou comportamento visível.
