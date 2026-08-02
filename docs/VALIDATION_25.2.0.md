# Validação 25.2.0

## Verificações executadas

- sintaxe dos módulos JavaScript;
- documentação obrigatória e comentários de intenção;
- arquitetura por camadas;
- contratos dos componentes JSX;
- presença das seções comerciais na landing estática;
- versão do artefato público e fallback;
- sincronização de planos por `GET /api/plans`;
- proteção contra cache de documentos HTML e respostas de planos.

## Observação sobre o build local

O ambiente de execução não conseguiu baixar dependências do registro npm interno. O pacote mantém uma landing estática completa da mesma release, e o Render está configurado com `STRICT_REACT_BUILD=true` para bloquear o deploy caso o bundle React não seja produzido em produção.
