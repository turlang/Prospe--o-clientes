# Validação 27.0.0

## Gates obrigatórios

```bash
npm run quality
```

## Cobertura funcional

- normalização de múltiplos pipelines;
- validação de campos obrigatórios por etapa;
- cálculo de contrato e recorrência;
- filtros avançados;
- previsão e progresso de metas;
- relatório por período;
- importação e deduplicação CSV;
- exportação de campos personalizados;
- seleção de leads para reativação;
- presença dos controles do CRM 360 no frontend;
- sintaxe, arquitetura, documentação, estilos e regressões anteriores.

## Smoke test recomendado

1. abrir o CRM;
2. criar um segundo pipeline;
3. adicionar um campo personalizado;
4. definir metas;
5. importar um CSV de teste;
6. abrir um lead e registrar serviço, contrato e recorrência;
7. mover para Proposta e Fechado validando os campos obrigatórios;
8. alternar entre Kanban e Lista;
9. salvar e aplicar um filtro;
10. conferir previsão, metas e reativação.
