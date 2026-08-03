# Contribuindo com o LeadHunter Pro

Obrigado por contribuir. O objetivo deste processo é permitir evolução rápida sem perder segurança, rastreabilidade ou estabilidade no Render.

## 1. Antes de começar

Leia:

- [`README.md`](README.md);
- [`docs/GUIA_DO_DESENVOLVEDOR.md`](docs/GUIA_DO_DESENVOLVEDOR.md);
- [`docs/MAPA_DO_CODIGO.md`](docs/MAPA_DO_CODIGO.md);
- [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md);
- [`docs/CODING_STANDARDS.md`](docs/CODING_STANDARDS.md);
- [`docs/SEGURANCA_E_HIGIENE.md`](docs/SEGURANCA_E_HIGIENE.md).

## 2. Preparação

```bash
npm ci
npm --prefix frontend/landing install --include=dev
cp .env.example .env
npm run build
npm run quality
```

No PowerShell, use `Copy-Item .env.example .env`.

## 3. Branches

Use nomes curtos e orientados ao objetivo:

```text
feat/meta-whatsapp-provider
fix/crm-forecast-range
refactor/lead-service
chore/project-hygiene
 docs/update-api-contracts
```

Não misture correção visual, refatoração estrutural e nova funcionalidade sem necessidade técnica.

## 4. Processo obrigatório

1. reproduza o problema ou defina o contrato;
2. encontre a camada responsável;
3. adicione ou atualize teste;
4. implemente a menor alteração completa;
5. documente contrato, variável ou decisão alterada;
6. execute `npm run quality`;
7. revise o diff;
8. abra o pull request;
9. confirme o deploy e execute smoke test.

## 5. Comentários e documentação

Todo módulo JavaScript mantido deve possuir `@fileoverview`.

Use JSDoc em funções públicas ou complexas. Comentários devem explicar:

- intenção;
- regra de negócio;
- compatibilidade;
- risco;
- idempotência;
- fallback;
- comportamento externo não evidente.

Não comente linha por linha. Comentários que apenas repetem a sintaxe ficam desatualizados e aumentam a manutenção.

## 6. Regras arquiteturais

- rotas tratam HTTP;
- serviços coordenam casos de uso;
- domínio contém regra pura;
- repositórios tratam persistência;
- integrações encapsulam provedores;
- `src/app.js` compõe dependências;
- `src/server.js` executa bootstrap;
- frontend não substitui autorização do backend;
- IDs de DOM são contratos até migração explícita;
- código novo não deve aumentar o acoplamento do controlador legado.

## 7. Segurança e dados

Proibido incluir:

- `.env`;
- tokens e chaves;
- URI real de banco;
- dados pessoais;
- logs;
- exportações CSV;
- bancos locais;
- backups;
- ZIPs e artefatos temporários.

Execute:

```bash
npm run check:hygiene
```

Qualquer variável nova deve aparecer em `.env.example`, README e configuração de produção quando aplicável.

## 8. Testes

Correções de bug precisam de regressão automatizada.

Tipos de teste esperados:

- domínio: entrada e saída puras;
- serviço: coordenação e erros;
- rota: autenticação, status e payload;
- segurança: isolamento e autorização;
- frontend: contratos de DOM e comportamento estrutural;
- CSS: regras críticas de layout;
- deploy: metadados e configuração.

Pipeline completo:

```bash
npm run quality
```

## 9. Alterações de frontend

Inclua evidência visual em desktop e mobile quando a mudança afetar layout.

Valide:

- zoom padrão;
- 1366×768;
- 1920×1080;
- largura móvel;
- teclado;
- foco;
- contraste;
- ausência de sobreposição;
- scroll apenas onde o contrato permite;
- cache busting do asset.

A Visão Geral não deve criar rolagem interna.

## 10. Alterações de banco

Documente:

- campo novo;
- default;
- índice;
- compatibilidade com documentos antigos;
- migração;
- rollback.

Migrações devem ser idempotentes. Não esconda migração destrutiva no bootstrap.

## 11. Integrações externas

Toda integração real deve prever:

- timeout;
- validação;
- mascaramento de segredo;
- idempotência;
- proteção contra replay;
- retentativa;
- estado de falha recuperável;
- auditoria;
- modo demonstração claramente separado.

## 12. Commits

Prefira mensagens no padrão:

```text
feat: adicionar provedor Meta Cloud API
fix: corrigir cálculo de receita ponderada
refactor: separar normalização do lead
chore: reforçar higiene do repositório
docs: atualizar contratos do CRM
```

O commit deve descrever a mudança real, não a ferramenta usada.

## 13. Pull request

A descrição deve conter:

### Problema

O que foi observado e por que importa.

### Solução

Como o comportamento foi alterado.

### Arquivos e contratos

Rotas, schemas, eventos, IDs de DOM, variáveis ou dados afetados.

### Validação

Comandos executados e evidências.

### Riscos

Segurança, compatibilidade, dados, performance e integrações.

### Rollback

Como retornar à versão anterior com segurança.

## 14. Critério de conclusão

Uma mudança está concluída somente quando:

- arquivos reais estão na `main`;
- qualidade passou;
- Render executa o commit esperado;
- comportamento foi conferido;
- documentação está atualizada;
- limitações estão explícitas.
