# Validação 25.3.0

## Verificações automatizadas

- sintaxe dos módulos JavaScript;
- documentação obrigatória e comentários de intenção;
- arquitetura por camadas;
- contratos e imports dos componentes JSX;
- versão e estrutura do artefato público;
- presença dos cinco painéis e controles de navegação;
- sincronização de planos por `GET /api/plans`;
- ausência de scroll do documento em desktop e mobile;
- troca de painéis e seletores por clique;
- preservação do hash, histórico e atributos de acessibilidade;
- integridade dos testes existentes de backend e painel.

## Validação de viewport

A contingência estática foi executada em navegador automatizado com:

- desktop: `1440 × 900`, documento final `1440 × 900`;
- mobile: `390 × 844`, documento final `390 × 844`;
- painel de planos: `1440 × 900`, sem overflow do documento.

Também foram validadas a troca para Ferramentas, a seleção de ferramenta e a renderização dos três planos.

## Resultado

- 151 testes aprovados;
- 128 arquivos JavaScript com sintaxe válida;
- 150 módulos documentados;
- 22 componentes JSX verificados.

## Observação sobre o bundle React

A release contém o código React atualizado e uma contingência estática completa. O Render executará o build do Vite durante o deploy. A validação de release bloqueia artefatos antigos ou incompletos.
