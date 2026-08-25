# LeadHunter Pro — Minuta de Preenchimento do e-Software (INPI)

> **STATUS: MINUTA — NÃO PROTOCOLAR sem revisar todos os campos marcados `CONFIRMAR`.**
>
> Esta ficha organiza os dados técnicos e administrativos para reduzir erros no pedido de Registro de Programa de Computador. O formulário oficial vigente no dia do protocolo sempre prevalece.

## 1. Referência técnica do pedido

- Repositório: `turlang/Prospe--o-clientes`
- Baseline técnica: `bdc7f4f83eb0666e19a0930f328f596cc8b17307`
- Branch preservada: `ip-provenance-ready-2026-08-24`
- Tag planejada: `ip-provenance-2026-08-24`
- Gerador do pacote: `GENERATE_INPI_PACKAGE.ps1`
- Algoritmo de hash: `SHA-256`

## 2. Dados para copiar no e-Software

### Titular do direito

- Nome/razão social: **CONFIRMAR NOME LEGAL EXATO**
- Natureza: **CONFIRMAR — pessoa física ou pessoa jurídica**
- CPF/CNPJ: **CONFIRMAR**
- Endereço completo: **CONFIRMAR**
- Telefone: **CONFIRMAR**
- E-mail: **CONFIRMAR**

O nome/razão social usado no pedido deve corresponder ao cadastro e-INPI e à identidade do certificado ICP-Brasil utilizado no fluxo aplicável.

### Autor(es)

Autor atualmente indicado pela documentação interna:

- Evandro Ricardo — **CONFIRMAR nome completo legal, CPF e endereço**

Antes do protocolo:

- [ ] confirmar se existem coautores com contribuição autoral relevante na baseline;
- [ ] confirmar cessões/contratos se titular e autor não forem a mesma pessoa;
- [ ] não omitir autor relevante.

### Título do programa

**Sugestão:** `LeadHunter Pro`

- [ ] confirmar que este será o título usado no pedido;
- [ ] tratar eventual proteção do nome como marca em procedimento separado.

### Data de criação

**CONFIRMAR — dd/mm/aaaa**

Usar a data em que esta versão se tornou capaz de atender plenamente às funções para as quais foi concebida. Não deduzir automaticamente a data do Git.

### Data de publicação

**CONFIRMAR se aplicável — dd/mm/aaaa**

Usar somente uma data pública comprovável e pertinente ao pedido.

### Linguagens de programação

Sugestão baseada na baseline atual:

- `JAVA SCRIPT`
- `CSS`
- `HTML`
- `JSON`
- `NODEJS`

- [ ] conferir as linguagens efetivamente presentes na baseline;
- [ ] remover qualquer item não usado;
- [ ] acrescentar linguagem relevante que esteja efetivamente no código registrado.

### Campo de aplicação

Sugestão técnica:

- `AD05 — Administração Empresarial`
- `AD10 — Marketing`
- `SV03 — Comércio`
- `CO04 — Comunicação`

Não selecionar códigos apenas para ampliar artificialmente o escopo. Manter somente os campos que descrevem o uso real do software registrado.

### Tipo de programa

Sugestão técnica:

- `AP01 — Aplicativos`
- `AT03 — Automação Comercial`
- `GI01 — Gerenciador de Informações`
- `GI04 — Gerador de Relatórios`
- `IA01 — Inteligência Artificial`
- `IA03 — Sistemas de Processamento de Linguagem Natural`

Opcional, apenas se representar efetivamente a baseline:

- `AP02 — Planejamento`

- [ ] revisar todos os códigos contra a tabela oficial vigente;
- [ ] manter somente funções existentes na baseline.

### Algoritmo/função hash

`SHA-256`

### Resumo hash

**PENDENTE DE GERAÇÃO LOCAL**

Executar no clone local:

```powershell
.\GENERATE_INPI_PACKAGE.ps1
```

Copiar para o e-Software exatamente o valor exibido em:

```text
HASH PARA O E-SOFTWARE: <valor>
```

Depois de gerar:

- [ ] não alterar o ZIP correspondente;
- [ ] guardar ZIP, `.sha256`, lista de arquivos e metadados fora do GitHub;
- [ ] manter cópia redundante.

### Descrição do material que originou o hash

Texto sugerido:

> Arquivo ZIP gerado de forma determinística a partir do commit `bdc7f4f83eb0666e19a0930f328f596cc8b17307` do repositório LeadHunter Pro, contendo os arquivos rastreados pelo Git nessa baseline e destinado à identificação técnica do programa de computador registrado.

Adaptar caso o campo oficial imponha limite de caracteres.

### Derivação autorizada

**CONFIRMAR**

- Se o LeadHunter Pro não for obra derivada de outro programa protegido, selecionar a opção correspondente.
- Se houver código derivado/incorporado cuja autorização precise ser declarada, reunir a documentação e informar corretamente.

Dependências npm, APIs, serviços de IA, Google Places, Resend, Mercado Pago e provedores de mensageria devem continuar identificados como componentes de terceiros.

### Declaração de Veracidade — DV

**PENDENTE**

- [ ] gerar GRU código 730;
- [ ] baixar a DV original gerada pelo INPI;
- [ ] não imprimir/recriar o PDF;
- [ ] assinar o PDF original com assinatura digital qualificada ICP-Brasil em padrão aceito pelo e-Software;
- [ ] validar a assinatura antes do upload.

### Procuração

- Sem procurador: `NÃO SE APLICA`, após confirmação.
- Com procurador: **CONFIRMAR** e anexar documento válido.

### Substabelecimento

`NÃO SE APLICA`, salvo se houver procurador/substabelecimento.

## 3. Checklist imediatamente antes de protocolar

- [ ] cadastro e-INPI atualizado antes da GRU;
- [ ] titular PF/PJ definido;
- [ ] nome/razão social alinhado ao certificado ICP-Brasil;
- [ ] autor(es), CPF(s) e endereço(s) confirmados;
- [ ] cadeia de titularidade/cessões confirmada;
- [ ] data de criação confirmada;
- [ ] título confirmado;
- [ ] linguagens revisadas contra a baseline;
- [ ] campo de aplicação revisado;
- [ ] tipo de programa revisado;
- [ ] `INPI_THIRD_PARTY_INVENTORY.md` revisado;
- [ ] confirmar ausência de leads reais, dados pessoais, dumps, backups, caches ou segredos no pacote;
- [ ] pacote e SHA-256 gerados e guardados;
- [ ] GRU 730 emitida e paga;
- [ ] DV original assinada e validada;
- [ ] procuração/substabelecimento anexados somente se aplicáveis;
- [ ] hash copiado sem alteração;
- [ ] formulário revisado antes de enviar.

## 4. Após o envio

- [ ] salvar número do pedido/processo;
- [ ] salvar recibo/protocolo;
- [ ] arquivar DV, GRU, comprovante e pacote hash juntos;
- [ ] cadastrar o processo em `Meus Pedidos`;
- [ ] acompanhar a RPI;
- [ ] baixar e arquivar o certificado quando disponibilizado;
- [ ] registrar internamente o número do processo e o hash utilizado.

## 5. Documentos relacionados

- `INPI_REGISTRATION_DOSSIER.md`
- `INPI_THIRD_PARTY_INVENTORY.md`
- `GENERATE_INPI_PACKAGE.ps1`
- `IP_EVIDENCE_2026-08-24.md`
- `COPYRIGHT.md`
- `LICENSE.md`

## 6. Fontes oficiais para reconferência

- Guia básico: `https://www.gov.br/inpi/pt-br/servicos/programas-de-computador/guia-basico`
- Manuais: `https://www.gov.br/inpi/pt-br/servicos/programas-de-computador/programa-de-computador-manual-completo`
- Página de serviços: `https://www.gov.br/inpi/pt-br/servicos/programas-de-computador`

**Nunca protocolar apenas com base nesta minuta sem conferir o formulário oficial vigente.**