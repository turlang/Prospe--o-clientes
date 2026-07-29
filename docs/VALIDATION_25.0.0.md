# Relatório de validação — 25.0.0

Data: 2026-07-29

## Resultado

- sintaxe: 124 arquivos JavaScript validados;
- documentação: 137 módulos documentados e 9 documentos obrigatórios;
- arquitetura: camadas e diretórios públicos aprovados;
- frontend: componentes React e contratos do painel aprovados;
- landing: versão, título e seções comerciais aprovados;
- testes automatizados: 143 aprovados, 0 falhas;
- dados JSON: hashes preservados em relação ao pacote de origem;
- pacote: sem `.env`, `node_modules`, `.git` ou chaves reais.

## Build do frontend

O ambiente de manutenção não possuía as dependências npm do subprojeto React e não conseguiu acessar o registro externo. Por isso, o bundle Vite não foi produzido localmente. A landing estática equivalente e versionada foi sincronizada e validada.

No Render, `STRICT_REACT_BUILD=true` obriga o deploy a falhar caso as dependências do frontend não sejam instaladas ou o bundle React não compile. Assim, a aplicação não volta silenciosamente para uma versão antiga.

## Comando de produção

```bash
npm ci --omit=dev --no-audit --no-fund \
  && npm --prefix frontend/landing install --include=dev --no-audit --no-fund \
  && npm run build
```
