# Reinicialização Administrativa do Banco — versão 23.9.0

## 1. Objetivo

A ferramenta permite reiniciar os dados operacionais do LeadHunter Pro sem remover as contas responsáveis pela administração da plataforma. Ela foi criada para cenários de homologação, reconstrução de ambiente, remoção integral de pesquisas de teste e preparação de uma instalação limpa.

## 2. Dados removidos

No MongoDB são removidos leads, pesquisas, tarefas, consumo, pagamentos, controles de teste gratuito, recuperações de senha, conversas do copiloto, auditoria anterior e usuários cuja função não seja `admin`.

No modo JSON local são removidos leads, tarefas, consumo, conversas do copiloto e usuários não administradores.

Configurações de planos, código-fonte, variáveis de ambiente e contas administrativas não fazem parte da limpeza.

## 3. Controles de segurança

A execução requer simultaneamente:

1. sessão autenticada com função `admin`;
2. senha atual da conta administradora;
3. frase exata `REINICIAR LEADHUNTER`;
4. confirmação final exibida pelo navegador.

O serviço bloqueia execuções concorrentes e recusa a limpeza quando nenhuma conta administrativa puder ser preservada.

## 4. Ordem operacional

Os dados de negócio são removidos antes dos usuários comuns. Essa ordem reduz o risco de perda de acesso administrativo quando ocorrer uma falha intermediária. A operação é idempotente: após uma interrupção, o administrador pode executar a limpeza novamente.

O MongoDB pode não oferecer transações em instalações sem replica set. Por isso, o serviço utiliza exclusões ordenadas e verificações de preservação dos administradores.

## 5. Auditoria

A auditoria anterior é removida junto com os demais dados. Após a conclusão, o sistema grava um novo evento `ADMIN_DATABASE_RESET_COMPLETED` contendo somente o resumo da operação. A senha e a frase digitadas não são armazenadas.

## 6. Procedimento

1. Acesse `/admin`.
2. Abra **Manutenção**.
3. Confira a prévia de registros.
4. Informe sua senha atual.
5. Digite `REINICIAR LEADHUNTER`.
6. Pressione **Reinicializar banco** e confirme o aviso final.
7. Confira o recibo na seção de auditoria.

## 7. Recomendação de produção

Antes da limpeza, faça um backup externo do MongoDB. A ferramenta não cria backup automático e a exclusão é irreversível.
