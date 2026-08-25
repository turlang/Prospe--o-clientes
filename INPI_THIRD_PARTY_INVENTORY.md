# LeadHunter Pro — Inventário de Componentes e Direitos de Terceiros

**Objetivo:** separar o código/material próprio do LeadHunter do que permanece sujeito a licenças e direitos de terceiros antes do protocolo no INPI.

Revisar este documento contra a baseline `bdc7f4f83eb0666e19a0930f328f596cc8b17307` antes do pedido.

## 1. Código próprio declarado do projeto

Categorias a validar como desenvolvimento próprio:

- arquitetura e fluxo comercial do LeadHunter;
- prospecção, scoring, auditoria digital e priorização;
- CRM 360, pipelines, forecast, tarefas, propostas e clientes;
- motores de inteligência comercial e automação;
- contratos de omnichannel e agente SDR;
- UI/UX, dashboards, fluxos, testes e documentação próprios;
- prompts e políticas próprias de IA.

## 2. Dependências de software de terceiros

Revisar `package.json`, manifests da landing e lockfiles para versões/licenças exatas. Componentes identificados incluem:

- Express;
- MongoDB/Mongoose;
- React e Vite na landing;
- Tailwind na landing;
- bcryptjs;
- CORS;
- dotenv;
- Helmet;
- jsonwebtoken;
- Fast CSV;
- ferramentas de build/teste associadas.

### Ação obrigatória

- [ ] preservar manifests e lockfiles da baseline;
- [ ] gerar relatório de licenças das dependências;
- [ ] verificar licenças incompatíveis com o uso comercial pretendido;
- [ ] não incluir `node_modules` no pacote técnico.

## 3. APIs, serviços e provedores externos

Não são propriedade do LeadHunter:

- Google Places;
- Groq, Gemini, OpenAI e modelos associados;
- Resend;
- Mercado Pago;
- Meta Cloud API e demais providers de mensageria;
- Render e outros serviços de infraestrutura.

## 4. Dados de leads e terceiros

- [ ] garantir que a baseline/pacote não contenha leads reais, dados pessoais exportados ou credenciais;
- [ ] remover arquivos JSON locais de produção, dumps, backups e caches contendo dados reais;
- [ ] não incluir respostas/propostas de clientes que não sejam necessárias para identificar o software;
- [ ] manter apenas fixtures sintéticas quando necessárias.

## 5. Marcas, assets e conteúdo web

- [ ] classificar logos, imagens, fontes e ícones por titularidade/licença;
- [ ] não reivindicar marcas de empresas prospectadas;
- [ ] revisar assets usados pela landing e dashboards;
- [ ] remover/substituir qualquer asset sem cadeia de direitos clara.

## 6. Colaborações e cessões

- [ ] identificar contribuições autorais de terceiros na baseline;
- [ ] verificar contratos/cessões aplicáveis;
- [ ] obter documentação de cessão/licença quando necessário;
- [ ] guardar instrumentos fora do repositório público.

## 7. Resultado esperado antes do protocolo

O pacote técnico deve distinguir claramente:

**código próprio do LeadHunter** + **dependências legitimamente utilizadas** + **dados/serviços/conteúdo externos não reivindicados**.

Este inventário não substitui a leitura das licenças de cada dependência nem parecer jurídico.