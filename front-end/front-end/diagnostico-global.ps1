$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================"
Write-Host "   LUMOS CONNECT - DIAGNOSTICO GLOBAL"
Write-Host "============================================"
Write-Host ""

$root = Get-Location

Write-Host "[1] Procurando alert() em TODOS os JavaScript..."
Write-Host ""

$arquivosJS = Get-ChildItem $root -Recurse -File -Filter "*.js"

$encontrados = @()

foreach ($arquivo in $arquivosJS) {

    $resultados = Select-String `
        -Path $arquivo.FullName `
        -Pattern "\balert\s*\(" `
        -ErrorAction SilentlyContinue

    if ($resultados) {

        foreach ($resultado in $resultados) {

            $encontrados += [PSCustomObject]@{
                Arquivo = $arquivo.FullName.Replace($root.Path, ".")
                Linha   = $resultado.LineNumber
                Codigo  = $resultado.Line.Trim()
            }

        }

    }

}

if ($encontrados.Count -eq 0) {

    Write-Host "[OK] Nenhum alert() encontrado no projeto."

} else {

    Write-Host "[ATENCAO] Foram encontrados alert():"
    Write-Host ""

    $encontrados | Format-Table -AutoSize

}

Write-Host ""
Write-Host "[2] JavaScript carregado pela Agenda"
Write-Host ""

$html = Join-Path $root "pages\agenda\agenda.html"

if (Test-Path $html) {

    Select-String `
        -Path $html `
        -Pattern '<script[^>]+src=' `
        -AllMatches |
        ForEach-Object {

            foreach ($match in $_.Matches) {

                Write-Host "[JS] $($match.Value)"

            }

        }

} else {

    Write-Host "[ERRO] agenda.html nao encontrado."

}

Write-Host ""
Write-Host "[3] Procurando caracteres corrompidos"
Write-Host ""

$extensoes = @("*.html", "*.js", "*.css")

$corrompidos = @()

foreach ($ext in $extensoes) {

    Get-ChildItem $root -Recurse -File -Filter $ext |
        ForEach-Object {

            $conteudo = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue

            if (
                $conteudo -match "Ã" -or
                $conteudo -match "Â" -or
                $conteudo -match "â€"
            ) {

                $corrompidos += $_.FullName.Replace($root.Path, ".")

            }

        }

}

if ($corrompidos.Count -eq 0) {

    Write-Host "[OK] Nenhum arquivo com sinais de codificacao corrompida."

} else {

    Write-Host "[ATENCAO] Possiveis arquivos corrompidos:"
    $corrompidos | ForEach-Object {
        Write-Host "[!] $_"
    }

}

Write-Host ""
Write-Host "============================================"
Write-Host "              DIAGNOSTICO FINAL"
Write-Host "============================================"
Write-Host ""