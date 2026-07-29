$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

Set-Location $PSScriptRoot
$projectRoot = (Resolve-Path $PSScriptRoot).Path

function Assert-LastExitCode {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Step
  )

  if ($LASTEXITCODE -ne 0) {
    throw "$Step falhou com código de saída $LASTEXITCODE. A correção foi interrompida."
  }
}

function Stop-ProjectNodeProcesses {
  Write-Host "[1/5] Encerrando processos Node.js vinculados ao projeto..." -ForegroundColor Cyan

  $processes = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
    Where-Object {
      $_.CommandLine -and $_.CommandLine.Contains($projectRoot, [System.StringComparison]::OrdinalIgnoreCase)
    }

  foreach ($process in $processes) {
    Write-Host "  Encerrando PID $($process.ProcessId): $($process.CommandLine)" -ForegroundColor DarkYellow
    & taskkill.exe /PID $process.ProcessId /T /F | Out-Null
  }

  # Também encerra qualquer processo que ainda esteja ocupando as portas do projeto.
  foreach ($port in @(3333, 5173, 5174)) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

    foreach ($connection in $connections) {
      $processId = $connection.OwningProcess
      if ($processId -gt 0) {
        Write-Host "  Liberando porta $port (PID $processId)..." -ForegroundColor DarkYellow
        & taskkill.exe /PID $processId /T /F | Out-Null
      }
    }
  }

  Start-Sleep -Seconds 2
}

function Remove-PathWithRetry {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,

    [int]$Attempts = 6
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    return
  }

  for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
    try {
      Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction Stop
      Write-Host "  Removido: $Path" -ForegroundColor DarkGray
      return
    }
    catch {
      if ($attempt -eq $Attempts) {
        throw "Não foi possível remover '$Path'. Feche terminais do projeto, o navegador integrado e o VS Code; depois execute novamente. Erro: $($_.Exception.Message)"
      }

      Write-Host "  Arquivo ainda bloqueado; nova tentativa $attempt/$Attempts..." -ForegroundColor Yellow
      Start-Sleep -Seconds 2
    }
  }
}

Stop-ProjectNodeProcesses

Write-Host "[2/5] Removendo instalações incompletas e lockfile antigo..." -ForegroundColor Cyan
Remove-PathWithRetry -Path (Join-Path $projectRoot "node_modules")
Remove-PathWithRetry -Path (Join-Path $projectRoot "apps\web\node_modules")
Remove-PathWithRetry -Path (Join-Path $projectRoot "apps\api\node_modules")
Remove-PathWithRetry -Path (Join-Path $projectRoot "package-lock.json")

Write-Host "[3/5] Instalando a árvore compatível pela raiz do monorepo..." -ForegroundColor Cyan
& npm.cmd install
Assert-LastExitCode -Step "npm install"

Write-Host "[4/5] Verificando o runtime único do React..." -ForegroundColor Cyan
& npm.cmd run doctor:react
Assert-LastExitCode -Step "doctor:react"

Write-Host "[5/5] Validando o build do front-end..." -ForegroundColor Cyan
& npm.cmd run build
Assert-LastExitCode -Step "build"

Write-Host "" 
Write-Host "Correção concluída com sucesso." -ForegroundColor Green
Write-Host "Execute: npm run dev" -ForegroundColor Green
