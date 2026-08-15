$ErrorActionPreference = "Stop"

$agendaPath = ".\pages\agenda"
$htmlPath = ".\pages\agenda\agenda.html"
$jsPath = ".\pages\agenda\agenda.js"

Write-Host ""
Write-Host "============================================"
Write-Host "   LUMOS CONNECT - CORRECAO COMPLETA AGENDA"
Write-Host "============================================"
Write-Host ""

# ============================================
# 1. VERIFICAR ARQUIVOS
# ============================================

if (-not (Test-Path $htmlPath)) {
    Write-Host "[ERRO] agenda.html nao encontrado." -ForegroundColor Red
    exit
}

if (-not (Test-Path $jsPath)) {
    Write-Host "[ERRO] agenda.js nao encontrado." -ForegroundColor Red
    exit
}

Write-Host "[OK] agenda.html encontrado."
Write-Host "[OK] agenda.js encontrado."
Write-Host ""

# ============================================
# 2. BACKUP
# ============================================

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

$backupJs = ".\pages\agenda\agenda.before-complete-$timestamp.js"
$backupHtml = ".\pages\agenda\agenda.before-complete-$timestamp.html"

Copy-Item $jsPath $backupJs
Copy-Item $htmlPath $backupHtml

Write-Host "[OK] Backup JS criado:"
Write-Host "     $backupJs"

Write-Host "[OK] Backup HTML criado:"
Write-Host "     $backupHtml"
Write-Host ""

# ============================================
# 3. LER AGENDA.JS COMO UTF-8
# ============================================

$utf8 = New-Object System.Text.UTF8Encoding($false)

$js = [System.IO.File]::ReadAllText(
    (Resolve-Path $jsPath),
    $utf8
)

# ============================================
# 4. REMOVER ALERTS DO AGENDA.JS
# ============================================

$alertPattern = '(?s)\balert\s*\(\s*(.*?)\s*\)\s*;?'

$alertMatches = [regex]::Matches(
    $js,
    $alertPattern
)

$alertCount = $alertMatches.Count

if ($alertCount -gt 0) {

    Write-Host "[INFO] Encontrados $alertCount alert() no agenda.js."

    $js = [regex]::Replace(
        $js,
        $alertPattern,
        'mostrarToast($1, "error");'
    )

    Write-Host "[OK] alert() substituidos."
}
else {

    Write-Host "[OK] agenda.js ja nao possui alert()."
}

Write-Host ""

# ============================================
# 5. GARANTIR SISTEMA DE TOAST
# ============================================

if ($js -notmatch 'function\s+mostrarToast\s*\(') {

    $toastFunction = @'

/* ========================================
   LUMOS CONNECT - TOAST
======================================== */

function mostrarToast(mensagem, tipo = "info") {

    let container =
        document.getElementById("lumos-toast-container");

    if (!container) {

        container =
            document.createElement("div");

        container.id =
            "lumos-toast-container";

        container.style.position =
            "fixed";

        container.style.top =
            "24px";

        container.style.right =
            "24px";

        container.style.zIndex =
            "99999";

        container.style.display =
            "flex";

        container.style.flexDirection =
            "column";

        container.style.gap =
            "10px";

        document.body.appendChild(container);
    }

    const toast =
        document.createElement("div");

    toast.textContent =
        mensagem || "Ocorreu um erro.";

    toast.style.padding =
        "14px 18px";

    toast.style.borderRadius =
        "12px";

    toast.style.background =
        tipo === "error"
            ? "#C75C5C"
            : "#4E6F5A";

    toast.style.color =
        "#FFFFFF";

    toast.style.fontSize =
        "14px";

    toast.style.fontFamily =
        "inherit";

    toast.style.boxShadow =
        "0 8px 24px rgba(0,0,0,.15)";

    toast.style.maxWidth =
        "360px";

    toast.style.opacity =
        "0";

    toast.style.transform =
        "translateY(-10px)";

    toast.style.transition =
        "all .25s ease";

    container.appendChild(toast);

    requestAnimationFrame(() => {

        toast.style.opacity =
            "1";

        toast.style.transform =
            "translateY(0)";
    });

    setTimeout(() => {

        toast.style.opacity =
            "0";

        toast.style.transform =
            "translateY(-10px)";

        setTimeout(() => {

            toast.remove();

        }, 250);

    }, 3500);
}

'@

    $js =
        $toastFunction + $js

    Write-Host "[OK] Sistema de Toast adicionado."
}
else {

    Write-Host "[OK] Sistema de Toast ja existe."
}

Write-Host ""

# ============================================
# 6. SALVAR AGENDA.JS EM UTF-8 SEM BOM
# ============================================

[System.IO.File]::WriteAllText(
    (Resolve-Path $jsPath),
    $js,
    $utf8
)

Write-Host "[OK] agenda.js salvo em UTF-8."
Write-Host ""

# ============================================
# 7. ATUALIZAR CACHE DO HTML
# ============================================

$html = [System.IO.File]::ReadAllText(
    (Resolve-Path $htmlPath),
    $utf8
)

$htmlAntes = $html

$html = [regex]::Replace(
    $html,
    'pages/agenda/agenda\.js(?:\?v=[^"''\s>]*)?',
    'pages/agenda/agenda.js?v=20260815-final'
)

$html = [regex]::Replace(
    $html,
    '(/front-end/pages/agenda/agenda\.js)(?:\?v=[^"''\s>]*)?',
    '$1?v=20260815-final'
)

if ($html -eq $htmlAntes) {

    Write-Host "[ATENCAO] Nao foi possivel localizar automaticamente a referencia do agenda.js."
    Write-Host "Verifique o <script> manualmente." -ForegroundColor Yellow

}
else {

    [System.IO.File]::WriteAllText(
        (Resolve-Path $htmlPath),
        $html,
        $utf8
    )

    Write-Host "[OK] Cache do agenda.js atualizado."
}

Write-Host ""

# ============================================
# 8. VERIFICAR ALERT NO ARQUIVO REAL
# ============================================

$jsFinal =
    [System.IO.File]::ReadAllText(
        (Resolve-Path $jsPath),
        $utf8
    )

$alertsRestantes =
    [regex]::Matches(
        $jsFinal,
        '\balert\s*\('
    )

if ($alertsRestantes.Count -eq 0) {

    Write-Host "[OK] Nenhum alert() no agenda.js atual." -ForegroundColor Green

}
else {

    Write-Host "[ERRO] Ainda existem $($alertsRestantes.Count) alert() no agenda.js." -ForegroundColor Red

}

Write-Host ""

# ============================================
# 9. MOSTRAR SCRIPTS DA AGENDA
# ============================================

Write-Host "[SCRIPTS] Arquivos JS referenciados pelo agenda.html:"
Write-Host ""

$scriptMatches =
    [regex]::Matches(
        $html,
        '<script[^>]+src=["'']([^"'']+)["'']'
    )

foreach ($match in $scriptMatches) {

    Write-Host "[JS] $($match.Groups[1].Value)"
}

Write-Host ""

# ============================================
# 10. PROCURAR ALERT APENAS NOS ARQUIVOS USADOS
# ============================================

Write-Host "[ALERT] Verificando arquivos locais usados pela Agenda:"
Write-Host ""

foreach ($match in $scriptMatches) {

    $src =
        $match.Groups[1].Value

    if ($src -match '^https?://') {

        continue
    }

    $srcLimpo =
        $src -replace '\?.*$', ''

    $srcLimpo =
        $srcLimpo.TrimStart('/')

    $srcLimpo =
        $srcLimpo -replace '^front-end/', ''

    $arquivo =
        Join-Path "." $srcLimpo

    if (Test-Path $arquivo) {

        $conteudo =
            [System.IO.File]::ReadAllText(
                (Resolve-Path $arquivo),
                $utf8
            )

        if ($conteudo -match '\balert\s*\(') {

            Write-Host "[ATENCAO] alert() encontrado:" -ForegroundColor Yellow
            Write-Host "         $arquivo"

        }
        else {

            Write-Host "[OK] $arquivo"
        }
    }
}

Write-Host ""

# ============================================
# FINAL
# ============================================

Write-Host "============================================"
Write-Host "              CONCLUIDO"
Write-Host "============================================"
Write-Host ""

Write-Host "Agora:"
Write-Host "1. Feche TODAS as abas da Agenda."
Write-Host "2. Feche o navegador se possivel."
Write-Host "3. Abra novamente."
Write-Host "4. Pressione Ctrl + F5."
Write-Host "5. Crie um evento."
Write-Host "6. Edite um evento."
Write-Host "7. Exclua um evento."
Write-Host ""

Write-Host "IMPORTANTE:"
Write-Host "Nao digite HTML diretamente no PowerShell."
Write-Host "Exemplo errado: <div class=`"modal-overlay`">"
Write-Host ""

Write-Host "Backup:"
Write-Host "$backupJs"
Write-Host "$backupHtml"
Write-Host ""