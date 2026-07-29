# Release 25.3.0 — Landing em tela única

## Objetivo

Eliminar a rolagem da landing e transformar a navegação em uma experiência de produto: o usuário escolhe uma categoria e o conteúdo correspondente ocupa a área central da viewport.

## Mudanças principais

- estrutura fixa em `100dvh` com `overflow: hidden` no documento;
- cinco painéis alternáveis: Início, Como funciona, Ferramentas, Para quem é e Planos;
- navegação por abas no desktop e barra inferior fixa no mobile;
- controles anterior/próximo para exploração sequencial;
- URL com hash semântico e suporte ao histórico do navegador;
- seletores internos para demonstrar etapas, ferramentas, públicos e planos;
- painel de planos continua consumindo a configuração publicada pelo Admin;
- versão React e contingência estática mantêm comportamento equivalente;
- suporte a teclado, foco visível, safe area e redução de movimento.

## Compatibilidade

Não houve alteração nos contratos públicos do backend, autenticação, recuperação de senha, CRM ou painel administrativo.

## Deploy

O Render continua executando o build React. Caso o bundle não seja produzido, a contingência estática da mesma versão é servida; a validação impede o uso de artefatos anteriores.
