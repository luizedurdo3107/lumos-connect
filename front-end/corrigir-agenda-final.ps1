Write-Host ""
Write-Host "============================================"
Write-Host "   LUMOS CONNECT - CORRECAO FINAL AGENDA"
Write-Host "============================================"
Write-Host ""

$agendaPath = ".\pages\agenda\agenda.js"
$htmlPath = ".\pages\agenda\agenda.html"

# ============================================
# VALIDAR ARQUIVOS
# ============================================

if (!(Test-Path $agendaPath)) {
    Write-Host "[ERRO] agenda.js nao encontrado." -ForegroundColor Red
    exit
}

if (!(Test-Path $htmlPath)) {
    Write-Host "[ERRO] agenda.html nao encontrado." -ForegroundColor Red
    exit
}

# ============================================
# BACKUPS
# ============================================

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

Copy-Item `
    $agendaPath `
    ".\pages\agenda\agenda.final-backup-$timestamp.js"

Copy-Item `
    $htmlPath `
    ".\pages\agenda\agenda.final-backup-$timestamp.html"

Write-Host "[OK] Backups criados."

# ============================================
# LER AGENDA.JS COMO UTF-8
# ============================================

$content = Get-Content `
    $agendaPath `
    -Raw `
    -Encoding UTF8

# ============================================
# REMOVER QUALQUER ALERT
# ============================================

$content = [regex]::Replace(
    $content,
    '(?s)\s*alert\s*\([^;]*\);?',
    ''
)

# ============================================
# GARANTIR TOAST
# ============================================

if ($content -notmatch "function mostrarToast") {

$toastFunction = @'

/* ========================================
   TOAST
======================================== */

function mostrarToast(mensagem, tipo = "success") {

    let container =
        document.getElementById("toastContainer");

    if (!container) {

        container =
            document.createElement("div");

        container.id =
            "toastContainer";

        container.className =
            "toast-container";

        document.body.appendChild(container);
    }

    const toast =
        document.createElement("div");

    toast.className =
        `toast toast-${tipo}`;

    toast.textContent =
        mensagem;

    container.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("show");

    }, 10);

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 3000);
}

'@

    $content =
        $toastFunction + "`r`n" + $content
}

# ============================================
# SALVAR COMO UTF-8
# ============================================

Set-Content `
    $agendaPath `
    $content `
    -Encoding UTF8

Write-Host "[OK] agenda.js salvo em UTF-8."

# ============================================
# CORRIGIR HTML
# ============================================

$html =
    Get-Content `
        $htmlPath `
        -Raw `
        -Encoding UTF8

# Remover versões antigas do script
$html =
    [regex]::Replace(
        $html,
        '<script\s+src="/front-end/pages/agenda/agenda\.js[^>]*></script>',
        ''
    )

# Adicionar versão nova
$scriptTag =
    '<script src="/front-end/pages/agenda/agenda.js?v=20260815"></script>'

$html =
    $html.Replace(
        '</body>',
        "$scriptTag`r`n`r`n</body>"
    )

# Garantir charset UTF-8
if ($html -notmatch '<meta\s+charset="UTF-8"') {

    $html =
        $html.Replace(
            '<head>',
            '<head>`r`n    <meta charset="UTF-8">'
        )
}

Set-Content `
    $htmlPath `
    $html `
    -Encoding UTF8

Write-Host "[OK] agenda.html atualizado."

# ============================================
# VERIFICAR ALERTS
# ============================================

$remainingAlerts =
    Select-String `
        -Path $agendaPath `
        -Pattern '\balert\s*\('

if ($remainingAlerts) {

    Write-Host ""
    Write-Host "[ERRO] Ainda existe alert() no agenda.js!" `
        -ForegroundColor Red

    $remainingAlerts

} else {

    Write-Host "[OK] Nenhum alert() encontrado no agenda.js." `
        -ForegroundColor Green
}

# ============================================
# VERIFICAR CARREGAMENTO
# ============================================

Write-Host ""
Write-Host "============================================"
Write-Host "              CONCLUIDO"
Write-Host "============================================"
Write-Host ""

Write-Host "Agora:"
Write-Host "1. Feche a pagina da Agenda."
Write-Host "2. Abra novamente."
Write-Host "3. Pressione Ctrl + F5."
Write-Host "4. Crie um evento."
Write-Host "5. Edite um evento."
Write-Host "6. Exclua um evento."
Write-Host ""

Write-Host "IMPORTANTE:"
Write-Host "Os arquivos agenda.backup*.js nao sao carregados."
Write-Host "O navegador deve carregar somente:"
Write-Host "agenda.js?v=20260815"
Write-Host ""