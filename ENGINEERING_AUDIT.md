# Relatório de Engenharia — LeadHunter Pro 23.6.1

Data da revisão: 27 de julho de 2026

## Resultado

O projeto foi analisado como aplicação SaaS Node.js/Express com frontend JavaScript, autenticação JWT, persistência MongoDB/JSON, CRM e integração com Mercado Pago. Os problemas reproduzíveis encontrados foram corrigidos diretamente no código, com testes de regressão adicionados.

## Correções críticas

1. **Ativação indevida de plano pago**
   - O checkout ativava plano pago automaticamente quando o Mercado Pago não estava configurado.
   - Agora a simulação funciona somente em desenvolvimento; produção retorna indisponibilidade até a credencial real ser configurada.

2. **Sincronização de pagamento sem vínculo de proprietário**
   - Um usuário autenticado podia tentar sincronizar qualquer `payment_id`.
   - Agora o usuário do pagamento precisa coincidir com o usuário autenticado.

3. **Validação financeira incompleta**
   - Pagamentos aprovados não tinham conferência suficiente de valor e moeda.
   - Agora o sistema valida plano, valor esperado e BRL antes de ativar a assinatura.

4. **SSRF na auditoria de sites**
   - A auditoria podia acessar localhost, IPs privados, serviços internos e redirecionamentos para redes privadas.
   - Foi criada uma camada de URL pública segura, com resolução DNS, bloqueio de faixas privadas/reservadas, validação a cada redirecionamento, limite de redirecionamentos e limite de 1,5 MB por resposta.

5. **Sessões válidas para usuários removidos ou suspensos**
   - O middleware validava apenas a assinatura JWT.
   - Agora cada requisição autenticada confirma que o usuário ainda existe e está ativo.

6. **Sessões antigas após redefinição de senha**
   - Tokens antigos continuavam válidos depois da troca de senha.
   - Foi adicionado `passwordChangedAt`; tokens emitidos antes da alteração são rejeitados.

7. **Dados sensíveis dentro da distribuição**
   - O ZIP original continha leads, e-mail de usuário e hash de senha em `data/*.json`.
   - A distribuição corrigida está higienizada, os JSONs locais estão vazios e o Git ignora esses arquivos.
   - Os dados originais foram preservados em um ZIP separado, exclusivamente para restauração privada.

## Correções funcionais

- O dashboard deixou de falhar quando `#stats` não existe no HTML.
- Foi incluído o botão visível “Esqueci minha senha”.
- Foi incluído o container `#v23Pipeline`, que o JavaScript já tentava preencher.
- A leitura do usuário no `localStorage` agora tolera JSON corrompido.
- Respostas HTTP 401 limpam a sessão local e retornam para o login.
- Cópia de mensagem/proposta passou a ler o texto renderizado, evitando quebra de HTML e injeção por aspas.
- Valores usados em handlers inline agora recebem serialização apropriada para argumento JavaScript.
- Mensagens de erro inseridas via `innerHTML` são escapadas.
- Foi removido um `</article>` duplicado nas sequências de follow-up.
- O texto corrompido `MÉDautomacao` foi corrigido para `MÉDIA`.
- O identificador `SOCautomacaoL_PATTERNS` foi corrigido para `SOCIAL_PATTERNS`.

## Persistência e concorrência

- Foi criado `jsonFileStore` com gravação em arquivo temporário + `rename` atômico.
- Operações por arquivo são serializadas para evitar perda de atualização em acessos simultâneos.
- JSON corrompido não é mais silenciosamente tratado como base vazia.
- Usuários, uso, tarefas, leads e metadados locais adotaram a nova camada.
- Datas, incrementos e campos de tarefas recebem validação básica.

## Endurecimento adicional

- Produção exige MongoDB, independentemente de configuração permissiva de fallback.
- Limites de cadastro por IP são validados e têm fallback seguro.
- Senhas exigem de 8 a 128 caracteres.
- E-mails são normalizados e validados.
- Tokens de recuperação são consumidos atomicamente.
- Recuperação de senha não diferencia e-mail existente de inexistente.
- Rate limiter limpa chaves antigas e retorna cabeçalhos de limite/retry.
- Rate limiting global foi movido para `/api`, evitando penalizar arquivos estáticos.
- Payload JSON foi limitado a 256 KB.
- CORS de produção aceita apenas origens configuradas.
- Métricas internas exigem administrador.
- Busca administrativa escapa expressão regular fornecida pelo usuário.
- Status de lead é restrito a uma lista permitida.
- Quantidade de prospecção precisa ser inteira entre 1 e 20.
- Erros internos deixam de expor detalhes técnicos em produção.
- `PUBLIC_APP_URL` é obrigatória para checkout em produção, evitando uso inseguro do cabeçalho Host.
- Preços em formato brasileiro como `R$ 1.999,90` são interpretados corretamente.

## Validação executada

- **86 arquivos JavaScript** verificados com `node --check`.
- **92 testes** executados sem qualquer dependência externa instalada: 92 aprovados, 0 falhas.
- **96 testes** executados no total: 96 aprovados, 0 falhas. Para carregar o teste puro de billing, foi usado temporariamente um stub de importação do Mongoose, pois o ambiente não conseguiu baixar a dependência.
- Testes novos cobrem frontend, SSRF, cobrança, sessão, produção sem fallback e escrita JSON concorrente.

## Limitação da validação

A instalação com `npm ci` foi tentada novamente usando o registro oficial, mas o gateway de pacotes do ambiente respondeu HTTP 503 ao baixar `whatwg-url`. Por isso, não foi possível iniciar o servidor completo com Express/Mongoose nem executar integração real com MongoDB, Google Places, Resend ou Mercado Pago neste ambiente.

Essa limitação é externa ao código. Em uma máquina com acesso normal ao npm, execute:

```bash
npm ci
npm run check
npm run dev
```

## Arquivos principais alterados

- `src/server.js`
- `src/authRoutes.js`
- `src/middleware/auth.js`
- `src/middleware/admin.js`
- `src/middleware/rateLimit.js`
- `src/services/billingService.js`
- `src/siteAuditor.js`
- `src/security/publicUrl.js`
- `src/utils/jsonFileStore.js`
- `src/utils/httpError.js`
- `src/localUserStore.js`
- `src/localUsageStore.js`
- `src/localTaskStore.js`
- `src/storage.js`
- `public/app.js`
- `public/admin.js`
- `public/index.html`
- `scripts/check-all.js`
- testes de regressão em `tests/`
