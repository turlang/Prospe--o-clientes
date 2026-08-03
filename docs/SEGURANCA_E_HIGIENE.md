# Segurança e higiene do repositório

Este documento define o que pode ser versionado, como segredos são tratados e quais verificações impedem resíduos ou dados reais de entrar no Git.

## 1. Princípios

- o repositório contém código e exemplos, nunca credenciais reais;
- produção usa variáveis de ambiente e serviços gerenciados;
- dados locais são descartáveis e não são fonte de verdade;
- arquivos gerados não devem ser editados manualmente;
- toda mudança passa por verificação automática de higiene;
- logs devem permitir diagnóstico sem revelar informações sensíveis.

## 2. Itens proibidos

Nunca versione:

- `.env` ou variantes de ambiente;
- senhas, tokens, chaves privadas ou certificados;
- strings de conexão com credenciais;
- JSON local contendo usuários, hashes, leads, conversas ou uso;
- logs;
- `node_modules`;
- cobertura e relatórios de teste;
- backups e arquivos temporários;
- bancos SQLite/Redis locais;
- ZIPs e pacotes de release;
- arquivos do sistema operacional ou IDE com dados pessoais.

## 3. Itens permitidos

- `.env.example` apenas com placeholders;
- `data/*.example.json` sem dados reais;
- artefato público da landing gerado pelo processo oficial;
- documentação com exemplos claramente fictícios;
- imagens e recursos estáticos necessários ao produto.

## 4. Segredos

### Geração

Use valores aleatórios e independentes para:

- `JWT_SECRET`;
- `INTEGRATION_ENCRYPTION_KEY`;
- credenciais de banco;
- chaves de webhook;
- tokens dos provedores.

Não reutilize o mesmo valor em ambientes diferentes.

### Armazenamento

- desenvolvimento: arquivo `.env` ignorado;
- Render: Environment/Secret Files;
- GitHub Actions: Secrets;
- credenciais omnichannel persistidas: criptografadas com AES-256-GCM pelo domínio de integração.

### Rotação

Quando houver suspeita de exposição:

1. revogue o segredo no provedor;
2. gere outro valor;
3. atualize o ambiente;
4. reinicie o serviço;
5. revise logs e auditoria;
6. remova o segredo do histórico Git quando necessário;
7. registre o incidente sem copiar o segredo.

Apagar apenas o commit mais recente não remove o conteúdo do histórico.

## 5. Dados pessoais

O repositório não deve conter:

- e-mails reais de usuários;
- telefones de leads;
- endereços coletados;
- mensagens privadas;
- hashes de senha;
- IDs de pagamento;
- exportações CSV reais.

Fixtures de teste devem usar dados fictícios reconhecíveis.

## 6. Logs

Permitido:

- correlation ID;
- rota e método;
- status;
- duração;
- nome do provedor;
- código de erro normalizado;
- identificador interno não sensível.

Proibido:

- Authorization header;
- cookies ou JWT;
- senha;
- token de recuperação;
- chave de API;
- corpo completo de webhook;
- conteúdo privado de conversa;
- URI do MongoDB.

## 7. Arquivos gerados

`public/landing-react/` é produzido pelo build da landing. Mudanças devem ocorrer em `frontend/landing/` e depois passar por `npm run build`.

Pacotes ZIP, artefatos temporários e relatórios de CI devem ser publicados como artifacts/releases, não commitados no código.

## 8. Gate automático

Execute:

```bash
npm run check:hygiene
```

O script verifica:

- arquivos temporários e backups;
- ambientes reais;
- dados locais;
- arquivos de sistema operacional;
- codificação UTF-8 com BOM;
- caracteres inválidos;
- ausência de newline final;
- whitespace residual em arquivos mantidos;
- padrões óbvios de tokens reais.

A verificação faz parte de `npm run quality`.

## 9. Revisão manual

O gate automático não substitui revisão humana. Antes do push:

```bash
git status
git diff --check
git diff --staged
npm run quality
```

Procure especialmente por:

- valores colados durante diagnóstico;
- screenshots contendo tokens;
- fixtures copiadas da produção;
- URLs privadas;
- variáveis novas não documentadas;
- permissões excessivas;
- mudanças em `.gitignore` que liberem dados sensíveis.

## 10. Dependências

- use versões compatíveis com Node 20;
- execute `npm audit` como diagnóstico, avaliando contexto antes de atualizar;
- não use `latest` em produção sem validação;
- preserve `package-lock.json`;
- remova dependência não utilizada;
- prefira API nativa quando reduzir superfície de risco.

## 11. Webhooks e integrações

Toda integração real deve ter:

- assinatura ou verificação equivalente;
- proteção contra replay;
- idempotência;
- timeout;
- retentativa controlada;
- dead-letter ou estado de falha recuperável;
- mascaramento de credenciais;
- auditoria;
- isolamento por usuário/organização.

## 12. Checklist antes do deploy

- [ ] `npm run quality` aprovado;
- [ ] nenhuma variável real no diff;
- [ ] `.env.example` atualizado;
- [ ] Render configurado;
- [ ] autorização testada;
- [ ] dados de outro usuário não podem ser acessados;
- [ ] logs revisados;
- [ ] rollback documentado;
- [ ] commit confirmado em `/api/health`;
- [ ] smoke test executado.
