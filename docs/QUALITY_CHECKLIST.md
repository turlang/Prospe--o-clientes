# Checklist de Qualidade — LeadHunter Pro

Este checklist organiza validações técnicas, funcionais e comerciais para fortalecer o LeadHunter Pro como SaaS de prospecção e CRM.

## 1. Instalação e ambiente

- [ ] `.env.example` atualizado.
- [ ] Versão do Node documentada.
- [ ] `npm install` validado.
- [ ] `npm run dev` validado.
- [ ] `npm start` validado em ambiente de produção.
- [ ] MongoDB Atlas conectado em ambiente de teste.

## 2. Back-end

- [ ] API inicia sem erros.
- [ ] Conexão com MongoDB validada.
- [ ] Rotas principais protegidas.
- [ ] Autenticação JWT validada.
- [ ] Mongoose models revisados.
- [ ] Erros retornam mensagens claras.
- [ ] Logs básicos implementados.
- [ ] Helmet ativo.
- [ ] CORS configurado corretamente.

## 3. Front-end

- [ ] Login funcionando.
- [ ] Cadastro funcionando.
- [ ] Logout funcionando sem precisar atualizar a página.
- [ ] Painel principal carregando corretamente.
- [ ] CRM de leads navegável.
- [ ] Pipeline comercial funcional.
- [ ] Exportação CSV validada.
- [ ] Responsividade testada.
- [ ] Estados de erro e loading visíveis.

## 4. Planos e limites

- [ ] Plano gratuito validado.
- [ ] Plano Pro validado.
- [ ] Plano Agência validado.
- [ ] Limite de leads por plano funcionando.
- [ ] Bloqueio ao exceder limite funcionando.
- [ ] Trial único validado.
- [ ] Upgrade de plano validado.

## 5. Pagamentos

- [ ] Mercado Pago Public Key configurada.
- [ ] Mercado Pago Access Token configurado.
- [ ] Link de pagamento gerado.
- [ ] Retorno pós-pagamento documentado.
- [ ] Webhook planejado ou implementado.
- [ ] Ambiente sandbox separado de produção.

## 6. Segurança anti-abuso

- [ ] Limite de cadastro por IP ativo.
- [ ] Bloqueio de e-mails temporários validado.
- [ ] Auditoria de tentativas registrada.
- [ ] JWT_SECRET forte em produção.
- [ ] `.env` real fora do repositório.
- [ ] Rotas admin protegidas.

## 7. Painel administrativo

- [ ] Admin acessa `/admin`.
- [ ] Usuário comum não acessa admin.
- [ ] Visualização de usuários validada.
- [ ] Visualização de planos validada.
- [ ] Alteração de status/assinatura validada.
- [ ] Indicadores principais revisados.

## 8. Documentação

- [ ] README atualizado.
- [ ] `CASE_TECNICO.md` criado.
- [ ] `QUALITY_CHECKLIST.md` criado.
- [ ] Roadmap atualizado.
- [ ] Prints adicionados ao README.
- [ ] Fluxo comercial documentado.

## 9. Melhorias futuras

- [ ] Criar testes automatizados.
- [ ] Documentar API.
- [ ] Implementar webhooks completos.
- [ ] Melhorar segmentação de leads.
- [ ] Adicionar templates de abordagem.
- [ ] Criar onboarding guiado.
- [ ] Melhorar métricas de funil.

## Nota de maturidade esperada

Ao concluir este checklist, o projeto pode ser apresentado como SaaS comercial com CRM, pagamento, autenticação, regras de limite e painel administrativo.
