# Correção do runtime React

## Sintoma

A interface apresentava:

```text
Cannot read properties of null (reading 'useRef')
```

O primeiro Hook executado pela árvore era o `useRef` interno do
`BrowserRouter`. O erro ocorre quando o componente e o renderizador resolvem
cópias diferentes do React.

## Correções aplicadas

- React e React DOM fixados em `19.1.1`.
- `overrides` adicionados na raiz para impedir versões divergentes.
- `resolve.dedupe` configurado no Vite.
- Vite e plugin React fixados em versões compatíveis.
- script de limpeza de `node_modules` da raiz e dos workspaces.
- verificador `npm run doctor:react`.

## Instalação no Windows

Execute somente na raiz `D:\devburguer`:

```powershell
Ctrl + C
npm run clean:install
npm run doctor:react
npm run build
npm run dev
```

Não execute `npm install` dentro de `apps/web` ou `apps/api`.

Também é possível executar a correção automatizada:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\FIX-REACT.ps1
npm run dev
```
