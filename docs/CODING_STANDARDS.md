# Padrões de Código — LeadHunter Pro

## Princípios

- responsabilidade única e dependências explícitas;
- funções pequenas, nomes orientados ao domínio e retornos previsíveis;
- composição em vez de duplicação;
- validação na borda e regra de negócio isolada;
- segurança, acessibilidade e observabilidade como critérios de aceite;
- código legível sem depender de comentário para explicar sintaxe básica;
- alteração acompanhada por teste e documentação proporcional ao risco.

## JavaScript e Node.js

- CommonJS no backend existente; ESM no Vite/React;
- `const` por padrão e `let` apenas quando há reatribuição;
- `async/await` com tratamento no limite adequado;
- nenhuma captura vazia de erro;
- caminhos centralizados em `src/config/paths.js`;
- módulos não iniciam servidor ou banco durante importação;
- funções públicas ou complexas declaram contrato com JSDoc;
- entrada externa é normalizada antes de chegar ao domínio;
- funções de domínio evitam efeitos colaterais;
- provedores externos são acessados por adaptadores;
- repositórios escondem Mongoose das camadas superiores;
- exports globais no navegador só existem quando outro módulo depende deles.

## Organização de módulos

Ordem sugerida:

1. `@fileoverview`;
2. imports/requires nativos;
3. dependências externas;
4. módulos internos;
5. constantes;
6. funções auxiliares privadas;
7. funções públicas;
8. exportação.

Não crie arquivo `utils.js` genérico para regras de domínios diferentes. Prefira nomes que expliquem o contexto.

## Erros e assincronismo

- erros esperados recebem código e mensagem segura;
- respostas públicas não expõem stack trace;
- chamadas externas possuem timeout;
- operações repetíveis são idempotentes;
- fallback é explícito e observável;
- retentativas têm limite;
- falha não pode ser convertida silenciosamente em sucesso;
- logs usam contexto e correlation ID, nunca segredo.

## React

- componentes puros: renderização não altera estado externo;
- efeitos somente para sincronização com sistemas externos;
- hooks em nível superior e dependências explícitas;
- dados remotos em `services` e estado assíncrono em `hooks`;
- conteúdo repetido em estruturas de dados, não em marcação duplicada;
- chaves estáveis; nenhum índice quando a identidade existe;
- proibido `dangerouslySetInnerHTML` sem análise de segurança formal.

## Dashboard autenticado

O dashboard legado é migrado progressivamente.

- IDs de DOM são contratos;
- novo domínio deve preferir arquivo próprio;
- regra de negócio não fica no navegador;
- funções globais existentes só podem ser removidas após busca e teste;
- alteração de asset exige cache busting;
- Visão Geral não usa scroll interno;
- componentes com overflow devem justificar o comportamento.

## CSS e responsividade

- mobile-first quando o componente for novo;
- nenhuma largura fixa maior que o viewport;
- `min-width: 0` em filhos de grid/flex com conteúdo variável;
- overflow horizontal limitado ao componente necessário;
- estados `hover`, `focus-visible`, `disabled` e `aria-expanded` coerentes;
- suporte a `prefers-reduced-motion`;
- tokens antes de valores repetidos;
- folhas adicionadas na camada correta da arquitetura CSS;
- `!important` apenas para compatibilidade documentada;
- sem scrollbar interna em views que usam rolagem natural da página.

## HTML e acessibilidade

- HTML semântico e ordem de títulos coerente;
- foco visível por teclado;
- links e botões com nomes acessíveis;
- imagens informativas com texto alternativo;
- contraste suficiente;
- informação não depende apenas de cor;
- conteúdo oculto usa `hidden` quando possível;
- diálogos possuem foco e fechamento previsíveis;
- tabelas usam cabeçalhos apropriados.

## Segurança

- nunca interpolar HTML não confiável;
- validar, limitar e normalizar entradas;
- autorização sempre no backend;
- não registrar tokens, senhas ou conteúdo sensível;
- segredos somente por variáveis de ambiente;
- `userId` vem da sessão autenticada;
- credenciais de integração são criptografadas;
- webhooks reais exigem assinatura, replay protection e idempotência;
- dependências são instaladas por `npm ci` e travadas por lockfile.

## Comentários

O padrão exige comentários de intenção, não narração linha a linha.

### Obrigatório

- `@fileoverview` para responsabilidade do módulo;
- JSDoc para contrato público ou lógica complexa;
- comentário local para regra incomum, risco, compatibilidade ou fallback.

### Evitar

```js
// Soma um ao contador.
counter += 1;
```

### Preferir

```js
// O provedor pode reenviar o webhook; o contador só avança após idempotência.
counter += 1;
```

Comentários desatualizados devem ser corrigidos junto com o código.

## Nomenclatura

- componentes React: `PascalCase`;
- funções e variáveis: `camelCase`;
- constantes globais: `UPPER_SNAKE_CASE`;
- booleanos: `is`, `has`, `can`, `should`;
- rotas e serviços: vocabulário do negócio;
- eventos: ação concluída no passado quando representam fato;
- IDs: sufixo `Id`;
- datas: sufixo `At` para timestamp e `Date` para data de calendário.

## Formatação e arquivos

- UTF-8 sem BOM;
- LF, exceto PowerShell em CRLF;
- newline final;
- dois espaços de indentação;
- sem whitespace ao final da linha;
- sem arquivos temporários, backups, logs ou pacotes no Git;
- `.editorconfig` e `.gitattributes` são a fonte de formatação básica.

## Testes

- bug corrigido recebe regressão;
- teste descreve comportamento, não implementação;
- fixtures usam dados fictícios;
- teste deve ser determinístico;
- rede real não é dependência de teste unitário;
- contratos de UI importantes recebem teste estrutural;
- segurança inclui teste de isolamento e autorização.

## Critérios antes de merge/deploy

```bash
npm ci
npm run build
npm run quality
```

A mudança deve incluir teste quando modifica contrato, regra, segurança, dados ou comportamento visível.
