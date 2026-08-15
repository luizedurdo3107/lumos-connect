$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================"
Write-Host "   LUMOS CONNECT - ALERT AGENDA"
Write-Host "============================================"
Write-Host ""

$arquivo = ".\pages\agenda\agenda.js"

Write-Host "[1] Verificando agenda.js..."
Write-Host ""

$conteudo = Get-Content $arquivo -Raw

if ($conteudo -match "\balert\s*\(") {
    Write-Host "[ERRO] agenda.js possui alert()."
} else {
    Write-Host "[OK] agenda.js nao possui alert()."
}

Write-Host ""
Write-Host "[2] Procurando alert() somente nos arquivos realmente usados pela Agenda..."
Write-Host ""

$html = Get-Content ".\pages\agenda\agenda.html" -Raw

$matches = [regex]::Matches(
    $html,
    '<script[^>]+src=["'']([^"'']+)["'']'
)

foreach ($match in $matches) {

    $src = $match.Groups[1].Value

    if ($src -match "^https?://") {
        Write-Host "[IGNORADO] $src"
        continue
    }

    $local = $src -replace "^/front-end/", ""

    $caminho = Join-Path "." $local

    if (Test-Path $caminho) {

        Write-Host ""
        Write-Host ">>> $caminho"

        $resultado = Select-String `
            -Path $caminho `
            -Pattern "\balert\s*\(" `
            -ErrorAction SilentlyContinue

        if ($resultado) {

            foreach ($linha in $resultado) {

                Write-Host "[ALERT] Linha $($linha.LineNumber): $($linha.Line.Trim())"

            }

        } else {

            Write-Host "[OK] Nenhum alert()."

        }

    } else {

        Write-Host "[ERRO] Arquivo nao encontrado: $caminho"

    }

}

Write-Host ""
Write-Host "============================================"
Write-Host "              CONCLUIDO"
Write-Host "============================================"
Write-Host ""