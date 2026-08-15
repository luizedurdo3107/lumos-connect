$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================"
Write-Host "      LUMOS CONNECT - CORRIGIR UTF-8"
Write-Host "============================================"
Write-Host ""

$arquivos = Get-ChildItem ".\pages" -Recurse -File |
    Where-Object {
        $_.Extension -in ".html", ".css", ".js"
    }

foreach ($arquivo in $arquivos) {

    try {

        $bytes = [System.IO.File]::ReadAllBytes(
            $arquivo.FullName
        )

        $texto = [System.Text.Encoding]::UTF8.GetString(
            $bytes
        )

        # Detecta sinais comuns de texto UTF-8 corrompido
        if (
            $texto -match "Ã|Â|â€|ðŸ"
        ) {

            Write-Host "[CORRIGINDO] $($arquivo.FullName)" `
                -ForegroundColor Yellow

            $corrigido = $texto

            $corrigido = $corrigido.Replace("Ã¡", "á")
            $corrigido = $corrigido.Replace("Ã©", "é")
            $corrigido = $corrigido.Replace("Ã­", "í")
            $corrigido = $corrigido.Replace("Ã³", "ó")
            $corrigido = $corrigido.Replace("Ãº", "ú")

            $corrigido = $corrigido.Replace("Ã£", "ã")
            $corrigido = $corrigido.Replace("Ãµ", "õ")
            $corrigido = $corrigido.Replace("Ã¢", "â")
            $corrigido = $corrigido.Replace("Ãª", "ê")
            $corrigido = $corrigido.Replace("Ã´", "ô")

            $corrigido = $corrigido.Replace("Ã§", "ç")

            $corrigido = $corrigido.Replace("Ã€", "À")
            $corrigido = $corrigido.Replace("Ã‰", "É")
            $corrigido = $corrigido.Replace("Ã“", "Ó")
            $corrigido = $corrigido.Replace("Ãš", "Ú")
            $corrigido = $corrigido.Replace("Ã‡", "Ç")

            $corrigido = $corrigido.Replace("NÃ£o", "Não")
            $corrigido = $corrigido.Replace("nÃ£o", "não")

            [System.IO.File]::WriteAllText(
                $arquivo.FullName,
                $corrigido,
                [System.Text.UTF8Encoding]::new($false)
            )

            Write-Host "[OK] Corrigido." `
                -ForegroundColor Green
        }
    }
    catch {

        Write-Host "[ERRO] $($arquivo.FullName)" `
            -ForegroundColor Red

        Write-Host $_.Exception.Message
    }
}

Write-Host ""
Write-Host "============================================"
Write-Host "              CONCLUÍDO"
Write-Host "============================================"
Write-Host ""

Write-Host "Todos os arquivos foram mantidos em UTF-8."
Write-Host ""