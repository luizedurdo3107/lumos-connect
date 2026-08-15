$baseUrl = "http://localhost:3000"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     LUMOS CONNECT - TESTE DA API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0

function Test-Endpoint {
    param (
        [string]$Name,
        [scriptblock]$Test
    )

    try {
        & $Test | Out-Null

        Write-Host "[OK]   $Name" -ForegroundColor Green
        $script:passed++
    }
    catch {
        Write-Host "[ERRO] $Name" -ForegroundColor Red

        if ($_.ErrorDetails.Message) {
            Write-Host "       $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        }

        $script:failed++
    }
}

# ========================================
# LOGIN
# ========================================

Write-Host "TESTANDO AUTENTICAÇÃO..." -ForegroundColor Yellow

$loginBody = @{
    email = "luiz@lumos.com"
    password = "lumos12345"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod `
        -Uri "$baseUrl/auth/login" `
        -Method Post `
        -Headers @{
            "Content-Type" = "application/json"
        } `
        -Body $loginBody

    $token = $login.token

    Write-Host "[OK]   Login" -ForegroundColor Green
    $passed++
}
catch {
    Write-Host "[ERRO] Login" -ForegroundColor Red
    Write-Host $_.ErrorDetails.Message -ForegroundColor DarkRed
    $failed++

    Write-Host ""
    Write-Host "Não foi possível continuar sem token." -ForegroundColor Red
    exit
}

$headers = @{
    Authorization = "Bearer $token"
}

Write-Host ""

# ========================================
# PERFIL
# ========================================

Write-Host "TESTANDO PERFIL..." -ForegroundColor Yellow

Test-Endpoint "GET /profile" {
    Invoke-RestMethod `
        -Uri "$baseUrl/profile" `
        -Method Get `
        -Headers $headers
}

# ========================================
# ATIVIDADES
# ========================================

Write-Host ""
Write-Host "TESTANDO ATIVIDADES..." -ForegroundColor Yellow

Test-Endpoint "GET /activities" {
    Invoke-RestMethod `
        -Uri "$baseUrl/activities" `
        -Method Get `
        -Headers $headers
}

# ========================================
# CONTEÚDOS
# ========================================

Write-Host ""
Write-Host "TESTANDO CONTEÚDOS..." -ForegroundColor Yellow

Test-Endpoint "GET /activities/11/content" {
    Invoke-RestMethod `
        -Uri "$baseUrl/activities/11/content" `
        -Method Get `
        -Headers $headers
}

# ========================================
# PROGRESSO DA ATIVIDADE
# ========================================

Write-Host ""
Write-Host "TESTANDO PROGRESSO..." -ForegroundColor Yellow

Test-Endpoint "GET /activities/11/progress" {
    Invoke-RestMethod `
        -Uri "$baseUrl/activities/11/progress" `
        -Method Get `
        -Headers $headers
}

# ========================================
# AGENDA
# ========================================

Write-Host ""
Write-Host "TESTANDO AGENDA..." -ForegroundColor Yellow

Test-Endpoint "GET /agenda" {
    Invoke-RestMethod `
        -Uri "$baseUrl/agenda" `
        -Method Get `
        -Headers $headers
}

# ========================================
# SESSÕES DE ESTUDO
# ========================================

Write-Host ""
Write-Host "TESTANDO SESSÕES DE ESTUDO..." -ForegroundColor Yellow

Test-Endpoint "GET /study-sessions" {
    Invoke-RestMethod `
        -Uri "$baseUrl/study-sessions" `
        -Method Get `
        -Headers $headers
}

# ========================================
# PROGRESSO POR MATÉRIA
# ========================================

Write-Host ""
Write-Host "TESTANDO PROGRESSO POR MATÉRIA..." -ForegroundColor Yellow

Test-Endpoint "GET /progress" {
    Invoke-RestMethod `
        -Uri "$baseUrl/progress" `
        -Method Get `
        -Headers $headers
}

# ========================================
# DASHBOARD
# ========================================

Write-Host ""
Write-Host "TESTANDO DASHBOARD..." -ForegroundColor Yellow

Test-Endpoint "GET /dashboard" {
    Invoke-RestMethod `
        -Uri "$baseUrl/dashboard" `
        -Method Get `
        -Headers $headers
}

# ========================================
# RESULTADO
# ========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "             RESULTADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Testes aprovados: $passed" -ForegroundColor Green
Write-Host "Testes com erro:   $failed" -ForegroundColor Red

Write-Host ""

if ($failed -eq 0) {
    Write-Host "BACK-END: TODOS OS TESTES PASSARAM!" -ForegroundColor Green
}
else {
    Write-Host "BACK-END: EXISTEM TESTES PARA CORRIGIR." -ForegroundColor Yellow
}

Write-Host ""