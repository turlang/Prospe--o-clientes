# Correção React Runtime V2

Esta atualização corrige três falhas encontradas durante a execução no Windows:

1. arquivo nativo `lightningcss.win32-x64-msvc.node` bloqueado por um processo Vite ainda aberto;
2. conflito entre Vite 7 e `@tailwindcss/vite@4.1.0`;
3. falha `spawnSync npm.cmd EINVAL` no verificador executado com Node.js 24.

## Versões compatíveis fixadas

- React: `19.1.1`
- React DOM: `19.1.1`
- Vite: `6.1.1`
- `@vitejs/plugin-react`: `4.3.4`
- Tailwind CSS e plugin Vite: `4.1.0`

## Aplicação

Extraia o conteúdo deste pacote sobre `D:\devburguer` e confirme a substituição.
Depois execute:

```powershell
cd D:\devburguer
Set-ExecutionPolicy -Scope Process Bypass
.\FIX-REACT-V2.ps1
npm run dev
```

O script agora interrompe a execução no primeiro erro e somente mostra sucesso quando instalação, diagnóstico e build terminarem corretamente.
