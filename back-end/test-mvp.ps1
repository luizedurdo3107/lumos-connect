$ErrorActionPreference = "Continue"

$base = "http://localhost:3000"
$front = Join-Path $PSScriptRoot "..\front-end"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "       LUMOS CONNECT - TESTE MVP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers
    )

    try {
        Invoke-RestMethod `
            -Uri $Url `
            -Method $Method `
            -Headers $Headers `
            -ErrorAction Stop | Out-Null

        Write-Host "[OK] $Method $Url" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "[ERRO] $Method $Url" -ForegroundColor Red
        Write-Host "      $($_.Exception.Message)" -ForegroundColor Yellow
        return $false
    }
}

# ========================================
# BACKEND
# ========================================

Write-Host "===== BACKEND =====" -ForegroundColor Cyan

try {
    Invoke-RestMethod `
        -Uri $base `
        -Method Get `
        -ErrorAction Stop | Out-Null

    Write-Host "[OK] API online" -ForegroundColor Green
}
catch {
    Write-Host "[ERRO] API offline" -ForegroundColor Red
    Write-Host "Inicie o backend antes de executar este teste." -ForegroundColor Yellow
    exit 1
}

# ========================================
# LOGIN
# ========================================

Write-Host ""
Write-Host "===== LOGIN =====" -ForegroundColor Cyan

$loginBody = @{
    email = "luiz@lumos.com"
    password = "lumos12345"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod `
        -Uri "$base/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop

    if (!$login.token) {
        throw "JWT não recebido."
    }

    Write-Host "[OK] Login funcionando" -ForegroundColor Green
    Write-Host "[OK] JWT recebido" -ForegroundColor Green

    $headers = @{
        Authorization = "Bearer $($login.token)"
    }
}
catch {
    Write-Host "[ERRO] Login falhou" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    exit 1
}

# ========================================
# ENDPOINTS
# ========================================

Write-Host ""
Write-Host "===== ENDPOINTS =====" -ForegroundColor Cyan

$endpoints = @(
    "/profile",
    "/activities",
    "/agenda",
    "/study-sessions",
    "/progress"
)

$backendErrors = 0

foreach ($endpoint in $endpoints) {
    if (!(Test-Endpoint -Method "Get" -Url "$base$endpoint" -Headers $headers)) {
        $backendErrors++
    }
}

# ========================================
# FRONTEND
# ========================================

Write-Host ""
Write-Host "===== FRONT-END =====" -ForegroundColor Cyan

$pages = @(
    "pages\login\login.html",
    "pages\cadastro\cadastro.html",
    "pages\inicio\inicio.html",
    "pages\atividades\atividades.html",
    "pages\agenda\agenda.html",
    "pages\progresso\progresso.html",
    "pages\configurações\configurações.html",
    "pages\forms\forms1\forms1.html",
    "pages\forms\forms2\forms2.html",
    "pages\forms\forms3\forms3.html",
    "pages\forms\forms4\forms4.html",
    "pages\forms\concluido\concluido.html"
)

$frontendErrors = 0

foreach ($page in $pages) {
    $path = Join-Path $front $page

    if (Test-Path $path) {
        Write-Host "[OK] $page" -ForegroundColor Green
    }
    else {
        Write-Host "[ERRO] $page" -ForegroundColor Red
        $frontendErrors++
    }
}

Write-Host ""
Write-Host "===== JAVASCRIPT =====" -ForegroundColor Cyan

$js = @(
    "js\api.js",
    "js\apiService.js",
    "js\auth.js",
    "js\authGuard.js",
    "js\main.js",
    "pages\login\login.js",
    "pages\cadastro\cadastro.js",
    "pages\inicio\inicio.js",
    "pages\atividades\atividades.js",
    "pages\agenda\agenda.js",
    "pages\progresso\progresso.js",
    "pages\configurações\configurações.js"
)

foreach ($file in $js) {
    $path = Join-Path $front $file

    if (Test-Path $path) {
        Write-Host "[OK] $file" -ForegroundColor Green
    }
    else {
        Write-Host "[ERRO] $file" -ForegroundColor Red
        $frontendErrors++
    }
}

# ========================================
# RESULTADO
# ========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "           RESULTADO DO MVP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($backendErrors -eq 0) {
    Write-Host "[OK] Backend: APROVADO" -ForegroundColor Green
}
else {
    Write-Host "[ERRO] Backend: $backendErrors falha(s)" -ForegroundColor Red
}

if ($frontendErrors -eq 0) {
    Write-Host "[OK] Front-end: APROVADO" -ForegroundColor Green
}
else {
    Write-Host "[ERRO] Front-end: $frontendErrors falha(s)" -ForegroundColor Red
}

Write-Host ""

if ($backendErrors -eq 0 -and $frontendErrors -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "       MVP LUMOS CONNECT OK!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "       MVP PRECISA DE CORRECOES" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit 1
}
