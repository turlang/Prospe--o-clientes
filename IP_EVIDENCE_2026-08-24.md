# LeadHunter Pro — Evidência de Autoria e Integridade

**Titular declarado:** Evandro Ricardo  
**Data da baseline:** 24 de agosto de 2026 (America/Sao_Paulo)  
**Repositório:** `turlang/Prospe--o-clientes`  
**Branch de preservação:** `ip-baseline-2026-08-24`  
**Commit protegido:** `da33ad773a4151ca94969d4781e7a179f0f51418`

## Finalidade

Este documento registra uma referência técnica verificável do LeadHunter Pro para fins de autoria, rastreabilidade, integridade de versão, diligência de propriedade intelectual e eventual preparação para registro formal de software.

O commit acima identifica o estado exato do repositório preservado na branch `ip-baseline-2026-08-24`. Alterações futuras no `main` não alteram essa referência histórica enquanto a branch e o commit forem preservados.

## Escopo declarado

A evidência cobre, na medida em que sejam criações originais do projeto, código-fonte, arquitetura, lógica comercial, modelos de dados, CRM, fluxos de prospecção, automações, integrações, agentes e prompts próprios, interfaces, documentação e demais materiais originais existentes no commit registrado.

Dependências, bibliotecas, marcas, APIs, fontes, imagens e demais componentes de terceiros permanecem sujeitos às respectivas licenças e direitos.

## Documentos jurídicos relacionados

- `LICENSE.md`
- `COPYRIGHT.md`

## Geração de pacote e SHA-256

Para produzir um pacote externo correspondente exatamente à baseline:

```powershell
git fetch origin
git archive --format=zip --output leadhunter-ip-baseline-2026-08-24.zip da33ad773a4151ca94969d4781e7a179f0f51418
Get-FileHash .\leadhunter-ip-baseline-2026-08-24.zip -Algorithm SHA256
```

O valor SHA-256 resultante deve ser guardado juntamente com o ZIP e com uma cópia deste manifesto. O ZIP não precisa ser versionado no repositório.

## Preparação para eventual registro no INPI

Antes de um pedido formal, recomenda-se preservar:

1. o commit e a branch de baseline;
2. o ZIP gerado a partir do commit registrado;
3. o hash SHA-256 do ZIP;
4. identificação completa do titular e dos autores, quando aplicável;
5. documentação de cessões de direitos de colaboradores, caso existam;
6. lista de componentes de terceiros e respectivas licenças;
7. descrição funcional e técnica da versão registrada;
8. comprovantes e documentos exigidos pelo procedimento oficial vigente no momento do protocolo.

## Limites desta evidência

Este manifesto é uma evidência técnica versionada no GitHub. Ele não substitui registro oficial, contrato de cessão, parecer jurídico ou outros documentos exigidos por autoridade competente.
