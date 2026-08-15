$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================"
Write-Host "   LUMOS CONNECT - CORRIGIR CACHE AGENDA"
Write-Host "============================================"
Write-Host ""

$html = ".\pages\agenda\agenda.html"
$js = ".\pages\agenda\agenda.js"

if (!(Test-Path $html)) {
    Write-Host "[ERRO] agenda.html não encontrado." -ForegroundColor Red
    exit
}

if (!(Test-Path $js)) {
    Write-Host "[ERRO] agenda.js não encontrado." -ForegroundColor Red
    exit
}

# Backup do HTML
$backup = ".\pages\agenda\agenda.before-cache.js"

if (!(Test-Path $backup)) {
    Copy-Item $html ".\pages\agenda\agenda.before-cache.html"
    Write-Host "[OK] Backup do HTML criado."
}

$content = Get-Content $html -Raw

# Remove referência antiga do agenda.js
$content = $content -replace `
    '<script\s+src="/front-end/pages/agenda/agenda\.js[^>]*></script>',
    ''

# Adiciona versão com cache-busting
$content = $content -replace `
    '</body>',
    '<script src="/front-end/pages/agenda/agenda.js?v=20260815"></script>`r`n</body>'

Set-Content `
    -Path $html `
    -Value $content `
    -Encoding UTF8

Write-Host "[OK] agenda.js agora será carregado com versão nova."

# Verifica alerts no JS atual
$jsContent = Get-Content $js -Raw

$alerts = (
    [regex]::Matches(
        $jsContent,
        "\balert\s*\("
    )
).Count

if ($alerts -eq 0) {
    Write-Host "[OK] agenda.js atual não possui alert()." `
        -ForegroundColor Green
} else {
    Write-Host "[ERRO] agenda.js ainda possui $alerts alert(s)." `
        -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================"
Write-Host "              CONCLUÍDO"
Write-Host "============================================"
Write-Host ""

Write-Host "Agora faça:"
Write-Host "1. Feche a aba da Agenda."
Write-Host "2. Abra novamente."
Write-Host "3. Pressione Ctrl + F5."
Write-Host "4. Crie um evento."
Write-Host "5. Edite um evento."
Write-Host "6. Exclua um evento."
Write-Host ""
