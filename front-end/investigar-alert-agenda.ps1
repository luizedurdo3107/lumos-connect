$ErrorActionPreference = "Stop"

$htmlPath = ".\pages\agenda\agenda.html"

Write-Host ""
Write-Host "============================================"
Write-Host "   LUMOS CONNECT - INVESTIGAR ALERT"
Write-Host "============================================"
Write-Host ""

if (-not (Test-Path $htmlPath)) {
    Write-Host "[ERRO] agenda.html nao encontrado." -ForegroundColor Red
    exit
}

$html = Get-Content $htmlPath -Raw

Write-Host "[1] SCRIPTS DA AGENDA"
Write-Host ""

$matches = [regex]::Matches(
    $html,
    '<script[^>]+src=["'']([^"'']+)["'']'
)

foreach ($match in $matches) {

    $src = $match.Groups[1].Value

    Write-Host "[JS] $src"
}

Write-Host ""
Write-Host "[2] VERIFICANDO ALERT NOS ARQUIVOS LOCAIS"
Write-Host ""

foreach ($match in $matches) {

    $src = $match.Groups[1].Value

    if ($src -match '^https?://') {
        continue
    }

    $src = $src -replace '\?.*$', ''
    $src = $src.TrimStart('/')
    $src = $src -replace '^front-end/', ''

    $path = ".\$src"

    if (Test-Path $path) {

        $result = Select-String `
            -Path $path `
            -Pattern "\balert\s*\("

        if ($result) {

            Write-Host ""
            Write-Host "[ATENCAO] ALERT ENCONTRADO:" -ForegroundColor Yellow
            Write-Host $path -ForegroundColor Yellow

            foreach ($line in $result) {

                Write-Host "Linha $($line.LineNumber): $($line.Line.Trim())"
            }

        }
        else {

            Write-Host "[OK] $path"
        }

    }
    else {

        Write-Host "[ERRO] Arquivo nao encontrado: $path" `
            -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "[3] AGENDA.JS"
Write-Host ""

$agendaJs = ".\pages\agenda\agenda.js"

if (Test-Path $agendaJs) {

    $result = Select-String `
        -Path $agendaJs `
        -Pattern "\balert\s*\("

    if ($result) {

        Write-Host "[ERRO] agenda.js possui alert()." `
            -ForegroundColor Red

    }
    else {

        Write-Host "[OK] agenda.js nao possui alert()." `
            -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "============================================"
Write-Host "              DIAGNOSTICO OK"
Write-Host "============================================"
Write-Host ""

Write-Host "Se todos os arquivos aparecerem como [OK],"
Write-Host "o alert provavelmente esta vindo de codigo"
Write-Host "executado dinamicamente pelo navegador."
Write-Host ""
