$root = Get-Location

$extensoes = @(
    "*.html",
    "*.css",
    "*.js"
)

$arquivos = foreach ($ext in $extensoes) {
    Get-ChildItem -Path $root -Filter $ext -Recurse -File
}

Write-Host ""
Write-Host "============================================"
Write-Host "   LUMOS CONNECT - CORRECAO UTF-8"
Write-Host "============================================"
Write-Host ""

foreach ($arquivo in $arquivos) {

    try {
        $bytes = [System.IO.File]::ReadAllBytes($arquivo.FullName)

        $texto = $null

        # UTF-8 com BOM
        if ($bytes.Length -ge 3 -and
            $bytes[0] -eq 0xEF -and
            $bytes[1] -eq 0xBB -and
            $bytes[2] -eq 0xBF) {

            $texto = [System.Text.Encoding]::UTF8.GetString($bytes, 3, $bytes.Length - 3)
        }
        else {
            # Tenta UTF-8 normal
            $utf8Strict = New-Object System.Text.UTF8Encoding($false, $true)

            try {
                $texto = $utf8Strict.GetString($bytes)
            }
            catch {
                # Se nao for UTF-8, tenta Windows-1252
                $encoding1252 = [System.Text.Encoding]::GetEncoding(1252)
                $texto = $encoding1252.GetString($bytes)
            }
        }

        # Remove BOM invisivel
        $texto = $texto.TrimStart([char]0xFEFF)

        # Salva novamente como UTF-8 sem BOM
        $utf8 = New-Object System.Text.UTF8Encoding($false)

        [System.IO.File]::WriteAllText(
            $arquivo.FullName,
            $texto,
            $utf8
        )

        Write-Host "[OK] $($arquivo.FullName)"
    }
    catch {
        Write-Host "[ERRO] $($arquivo.FullName)"
        Write-Host "       $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "============================================"
Write-Host "           CORRECAO CONCLUIDA"
Write-Host "============================================"
Write-Host ""
Write-Host "Arquivos HTML, CSS e JS foram salvos como UTF-8."
Write-Host ""
