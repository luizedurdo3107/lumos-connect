Write-Host ""
Write-Host "============================================"
Write-Host "   LUMOS CONNECT - DIAGNOSTICO AGENDA"
Write-Host "============================================"
Write-Host ""

Write-Host "[1] Arquivos JS carregados pelo agenda.html"
Write-Host ""

$html = Get-Content `
    ".\pages\agenda\agenda.html" `
    -Raw `
    -Encoding UTF8

[regex]::Matches(
    $html,
    '<script[^>]+src="([^"]+)"'
) | ForEach-Object {

    Write-Host "[JS] $($_.Groups[1].Value)"
}

Write-Host ""
Write-Host "[2] alert() no agenda.js atual"
Write-Host ""

$alerts = Select-String `
    -Path ".\pages\agenda\agenda.js" `
    -Pattern "\balert\s*\("

if ($alerts) {
    $alerts
} else {
    Write-Host "[OK] Nenhum alert no agenda.js"
}

Write-Host ""
Write-Host "[3] alert() em TODOS os JS da pagina"
Write-Host ""

$jsFiles = Get-ChildItem `
    ".\pages\agenda" `
    -Filter "*.js" `
    -File

foreach ($file in $jsFiles) {

    $found =
        Select-String `
            -Path $file.FullName `
            -Pattern "\balert\s*\("

    if ($found) {

        Write-Host ""
        Write-Host ">>> $($file.Name)" `
            -ForegroundColor Yellow

        $found | ForEach-Object {
            Write-Host "Linha $($_.LineNumber): $($_.Line.Trim())"
        }
    }
}

Write-Host ""
Write-Host "[4] Verificando referencias aos backups no HTML"
Write-Host ""

$backupRefs =
    $html |
    Select-String `
        -Pattern "backup|before-crud|pre-api|pre-toast"

if ($backupRefs) {

    Write-Host "[ATENCAO] HTML possui referencia a backup:" `
        -ForegroundColor Red

    $backupRefs

} else {

    Write-Host "[OK] Nenhum backup referenciado pelo HTML." `
        -ForegroundColor Green
}

Write-Host ""
Write-Host "[5] Verificando agenda.html"
Write-Host ""

Write-Host "Arquivo:"
Write-Host (Resolve-Path ".\pages\agenda\agenda.html")

Write-Host ""
Write-Host "============================================"
Write-Host "              DIAGNOSTICO OK"
Write-Host "============================================"
Write-Host ""