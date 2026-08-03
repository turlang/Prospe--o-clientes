# Changelog

## 27.0.0 — CRM 360 integrado ao Omnichannel

### CRM

- múltiplos pipelines configuráveis por usuário;
- etapas, probabilidades e requisitos personalizados;
- campos personalizados, filtros salvos e catálogo comercial;
- visualizações Kanban e Lista;
- valores de contrato, recorrência, fechamento e perda;
- previsão ponderada, metas e relatórios por período;
- importação CSV com mapeamento, prévia e deduplicação;
- exportação completa e reativação de oportunidades;
- validação antes da mudança de etapa;
- histórico comercial preservado.

### Omnichannel e plataforma

- Central de Conversas preservada e vinculada ao CRM;
- modo demonstrativo explicitamente identificado;
- chave de criptografia das integrações gerada no Render;
- branch e commit implantados expostos pelo `/api/health`;
- cache de assets atualizado para a release 27.0.0.

### Qualidade

- testes específicos do CRM 360;
- testes de regressão do omnichannel;
- validação de sintaxe, arquitetura, frontend, estilos, landing e documentação.

## 26.2.0 — Entrega consolidada

### Produto

- landing comercial responsiva em tela única;
- cadastro, login, sessão e recuperação de senha;
- CRM com gestão de leads e funil comercial;
- tarefas, follow-ups e plano de ação diário;
- histórico operacional e auditoria administrativa;
- relatórios de conversão, pipeline e receita potencial;
- painel administrativo;
- planos Trial, Pro e Agência configuráveis;
- persistência no MongoDB Atlas;
- Copiloto Comercial com IA e fallback local;
- integração preparada para Resend e Mercado Pago.

### Interface

- identidade visual unificada;
- design system modular;
- tokens de cor, tipografia, espaçamento e elevação;
- profundidade 3D discreta e acessível;
- layout responsivo para desktop, tablet e celular;
- navegação da landing sem rolagem da página;
- gráficos e indicadores construídos com HTML e CSS;
- tratamento para touch e preferência por movimento reduzido.

### Arquitetura

- backend organizado por domínio, serviços, repositórios, integrações, rotas, middleware e infraestrutura;
- Application Factory do Express;
- separação entre bootstrap e composição da aplicação;
- landing React com build pelo Vite;
- contingência estática equivalente;
- persistência MongoDB obrigatória em produção;
- configuração externa por variáveis de ambiente;
- estrutura preparada para provedores de IA, e-mail e pagamento.

### Segurança

- autenticação JWT com issuer e audience;
- senhas protegidas com bcrypt;
- autorização administrativa;
- Helmet e política de segurança de conteúdo;
- CORS configurável;
- limites contra abuso;
- proteção de URLs públicas;
- auditoria administrativa;
- exclusão de segredos e dados locais pelo `.gitignore`.

### Qualidade

- gates de sintaxe, arquitetura, frontend, estilos e documentação;
- validação da landing publicada;
- testes de unidade, integração e regressão;
- 172 testes aprovados na validação da entrega;
- verificação automática da organização do repositório;
- documentação de instalação, execução e deploy.

### Produção

- deploy validado no Render;
- MongoDB Atlas conectado;
- landing, aplicação e painel administrativo operacionais;
- endpoints de planos, leads, relatórios, uso, segurança e auditoria validados;
- assets públicos e administrativos versionados em `26.2.0`.

### Validações externas recomendadas

- recuperação de senha com domínio verificado no Resend;
- pagamento completo de teste no Mercado Pago;
- confirmação do webhook e da atualização automática do plano;
- geração de abordagem pelo provedor definitivo de IA;
- confirmação da persistência após reinicialização do serviço.
