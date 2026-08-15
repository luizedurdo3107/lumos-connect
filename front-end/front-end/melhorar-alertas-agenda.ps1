$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================"
Write-Host "   LUMOS CONNECT - MELHORAR ALERTAS AGENDA"
Write-Host "============================================"
Write-Host ""

$agenda = ".\pages\agenda\agenda.js"

if (!(Test-Path $agenda)) {
    Write-Host "[ERRO] agenda.js não encontrado." -ForegroundColor Red
    exit
}

# Backup
$backup = ".\pages\agenda\agenda.pre-toast.js"

if (!(Test-Path $backup)) {
    Copy-Item $agenda $backup
    Write-Host "[OK] Backup criado: agenda.pre-toast.js"
} else {
    Write-Host "[OK] Backup já existe."
}

$content = Get-Content $agenda -Raw

# ------------------------------------------------
# 1. Criar sistema de toast
# ------------------------------------------------

$toastCode = @'

/* ========================================
   SISTEMA DE TOAST
======================================== */

function mostrarToast(mensagem, tipo = "success") {

    let container =
        document.getElementById("lumosToastContainer");

    if (!container) {

        container =
            document.createElement("div");

        container.id =
            "lumosToastContainer";

        container.style.position = "fixed";
        container.style.top = "24px";
        container.style.right = "24px";
        container.style.zIndex = "99999";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "12px";
        container.style.pointerEvents = "none";

        document.body.appendChild(container);
    }

    const toast =
        document.createElement("div");

    toast.className =
        `lumos-toast ${tipo}`;

    const icon =
        tipo === "error"
            ? "alert-circle"
            : tipo === "warning"
                ? "triangle-alert"
                : "check-circle";

    toast.innerHTML = `
        <i data-lucide="${icon}"></i>

        <span>
            ${mensagem}
        </span>
    `;

    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.gap = "10px";
    toast.style.minWidth = "280px";
    toast.style.maxWidth = "380px";
    toast.style.padding = "14px 18px";
    toast.style.borderRadius = "12px";
    toast.style.background = "#ffffff";
    toast.style.border = "1px solid #D3D9CC";
    toast.style.boxShadow =
        "0 8px 30px rgba(0,0,0,.12)";
    toast.style.color = "#2B3B36";
    toast.style.fontSize = "14px";
    toast.style.fontWeight = "500";
    toast.style.pointerEvents = "auto";
    toast.style.animation =
        "lumosToastIn .25s ease";

    if (tipo === "error") {
        toast.style.borderLeft =
            "4px solid #C75C5C";
    }

    if (tipo === "warning") {
        toast.style.borderLeft =
            "4px solid #D6A84F";
    }

    if (tipo === "success") {
        toast.style.borderLeft =
            "4px solid #4E6F5A";
    }

    container.appendChild(toast);

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    setTimeout(() => {

        toast.style.opacity = "0";
        toast.style.transform =
            "translateX(20px)";
        toast.style.transition =
            "all .25s ease";

        setTimeout(() => {
            toast.remove();
        }, 250);

    }, 3500);
}


/* ========================================
   ANIMAÇÃO DO TOAST
======================================== */

if (!document.getElementById("lumosToastStyle")) {

    const style =
        document.createElement("style");

    style.id =
        "lumosToastStyle";

    style.textContent = `

        @keyframes lumosToastIn {

            from {
                opacity: 0;
                transform: translateX(20px);
            }

            to {
                opacity: 1;
                transform: translateX(0);
            }

        }

    `;

    document.head.appendChild(style);
}

'@

# Inserir antes da primeira inicialização
if ($content -notmatch "function mostrarToast") {

    $content =
        $toastCode + "`r`n" + $content

    Write-Host "[OK] Sistema de Toast adicionado."
}

# ------------------------------------------------
# 2. Substituir alert por mostrarToast
# ------------------------------------------------

$alertCount =
    ([regex]::Matches($content, "alert\(")).Count

$content =
    $content -replace "\balert\(", "mostrarToast("

Write-Host "[OK] Alertas substituídos: $alertCount"

# ------------------------------------------------
# 3. Salvar
# ------------------------------------------------

Set-Content `
    -Path $agenda `
    -Value $content `
    -Encoding UTF8

Write-Host ""
Write-Host "[OK] agenda.js atualizado." -ForegroundColor Green

Write-Host ""
Write-Host "============================================"
Write-Host "              CONCLUÍDO"
Write-Host "============================================"
Write-Host ""

Write-Host "Agora teste:"
Write-Host "1. Criar evento"
Write-Host "2. Editar evento"
Write-Host "3. Excluir evento"
Write-Host "4. Provocar um erro"
Write-Host "5. Recarregar a página"

Write-Host ""