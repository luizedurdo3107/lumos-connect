# ============================================================
# LUMOS CONNECT - TESTE FINAL DO BACK-END
# ============================================================

$BaseUrl = "http://localhost:3000"

# ------------------------------------------------------------
# CREDENCIAIS ADMIN
# ------------------------------------------------------------

$AdminEmail = "luiz@lumos.com"
$AdminPassword = "lumos12345"

# ------------------------------------------------------------
# CONTADORES
# ------------------------------------------------------------

$passed = 0
$failed = 0

function Test-Endpoint {
    param (
        [string]$Name,
        [scriptblock]$Action
    )

    try {
        $result = & $Action

        Write-Host "[OK]   $Name" -ForegroundColor Green
        $script:passed++

        return $result
    }
    catch {
        Write-Host "[ERRO] $Name" -ForegroundColor Red

        if ($_.ErrorDetails.Message) {
            Write-Host "       $($_.ErrorDetails.Message)" -ForegroundColor Yellow
        }
        else {
            Write-Host "       $($_.Exception.Message)" -ForegroundColor Yellow
        }

        $script:failed++
        return $null
    }
}

function Test-ExpectedError {
    param (
        [string]$Name,
        [scriptblock]$Action
    )

    try {
        & $Action

        Write-Host "[ERRO] $Name - deveria ter retornado erro" -ForegroundColor Red
        $script:failed++
    }
    catch {
        Write-Host "[OK]   $Name" -ForegroundColor Green
        $script:passed++
    }
}

Write-Host ""
Write-Host "============================================================"
Write-Host "          LUMOS CONNECT - TESTE FINAL DO BACK-END"
Write-Host "============================================================"
Write-Host ""

# ============================================================
# 1. API
# ============================================================

Test-Endpoint "GET /" {
    Invoke-RestMethod `
        -Uri "$BaseUrl/" `
        -Method Get
}

# ============================================================
# 2. LOGIN ADMIN
# ============================================================

Write-Host ""
Write-Host "AUTENTICACAO" -ForegroundColor Cyan

$loginBody = @{
    email = $AdminEmail
    password = $AdminPassword
} | ConvertTo-Json

$login = Test-Endpoint "POST /auth/login" {
    Invoke-RestMethod `
        -Uri "$BaseUrl/auth/login" `
        -Method Post `
        -Headers @{
            "Content-Type" = "application/json"
        } `
        -Body $loginBody
}

if (-not $login -or -not $login.token) {
    Write-Host ""
    Write-Host "Nao foi possivel continuar sem token." -ForegroundColor Red
    exit
}

$token = $login.token

$headers = @{
    Authorization = "Bearer $token"
}

# ============================================================
# 3. PERFIL
# ============================================================

Write-Host ""
Write-Host "PERFIL" -ForegroundColor Cyan

$profile = Test-Endpoint "GET /profile" {
    Invoke-RestMethod `
        -Uri "$BaseUrl/profile" `
        -Method Get `
        -Headers $headers
}

# ============================================================
# 4. USUARIOS
# ============================================================

Write-Host ""
Write-Host "USUARIOS" -ForegroundColor Cyan

Test-Endpoint "GET /users" {
    Invoke-RestMethod `
        -Uri "$BaseUrl/users" `
        -Method Get `
        -Headers $headers
}

# ============================================================
# 5. ATIVIDADES
# ============================================================

Write-Host ""
Write-Host "ATIVIDADES" -ForegroundColor Cyan

$activities = Test-Endpoint "GET /activities" {
    Invoke-RestMethod `
        -Uri "$BaseUrl/activities" `
        -Method Get `
        -Headers $headers
}

$activityId = 11

Test-Endpoint "GET /activities/$activityId" {
    Invoke-RestMethod `
        -Uri "$BaseUrl/activities/$activityId" `
        -Method Get `
        -Headers $headers
}

# ============================================================
# 6. CONTEUDOS
# ============================================================

Write-Host ""
Write-Host "CONTEUDOS DAS ATIVIDADES" -ForegroundColor Cyan

Test-Endpoint "GET /activities/$activityId/content" {
    Invoke-RestMethod `
        -Uri "$BaseUrl/activities/$activityId/content" `
        -Method Get `
        -Headers $headers
}

# ============================================================
# 7. PROGRESSO DA ATIVIDADE
# ============================================================

Write-Host ""
Write-Host "PROGRESSO DA ATIVIDADE" -ForegroundColor Cyan

Test-Endpoint "GET /activities/$activityId/progress" {
    Invoke-RestMethod `
        -Uri "$BaseUrl/activities/$activityId/progress" `
        -Method Get `
        -Headers $headers
}

# ============================================================
# 8. AGENDA
# ============================================================

Write-Host ""
Write-Host "AGENDA" -ForegroundColor Cyan

Test-Endpoint "GET /agenda" {
    Invoke-RestMethod `
        -Uri "$BaseUrl/agenda" `
        -Method Get `
        -Headers $headers
}

# ============================================================
# 9. SESSOES DE ESTUDO
# ============================================================

Write-Host ""
Write-Host "SESSOES DE ESTUDO" -ForegroundColor Cyan

Test-Endpoint "GET /study-sessions" {
    Invoke-RestMethod `
        -Uri "$BaseUrl/study-sessions" `
        -Method Get `
        -Headers $headers
}

# ============================================================
# 10. PROGRESSO POR MATERIA
# ============================================================

Write-Host ""
Write-Host "PROGRESSO POR MATERIA" -ForegroundColor Cyan

Test-Endpoint "GET /progress" {
    Invoke-RestMethod `
        -Uri "$BaseUrl/progress" `
        -Method Get `
        -Headers $headers
}

# ============================================================
# 11. DASHBOARD
# ============================================================

Write-Host ""
Write-Host "DASHBOARD" -ForegroundColor Cyan

Test-Endpoint "GET /dashboard" {
    Invoke-RestMethod `
        -Uri "$BaseUrl/dashboard" `
        -Method Get `
        -Headers $headers
}

# ============================================================
# 12. TESTES DE VALIDACAO
# ============================================================

Write-Host ""
Write-Host "VALIDACOES" -ForegroundColor Cyan

Test-ExpectedError "Atividade inexistente" {
    Invoke-RestMethod `
        -Uri "$BaseUrl/activities/999999" `
        -Method Get `
        -Headers $headers
}

Test-ExpectedError "Conteudo de atividade inexistente" {
    Invoke-RestMethod `
        -Uri "$BaseUrl/activities/999999/content" `
        -Method Get `
        -Headers $headers
}

Test-ExpectedError "Progresso de atividade inexistente" {
    Invoke-RestMethod `
        -Uri "$BaseUrl/activities/999999/progress" `
        -Method Get `
        -Headers $headers
}

Test-ExpectedError "Rota inexistente" {
    Invoke-RestMethod `
        -Uri "$BaseUrl/rota-que-nao-existe" `
        -Method Get `
        -Headers $headers
}

# ============================================================
# 13. TESTE DE AUTENTICACAO
# ============================================================

Write-Host ""
Write-Host "SEGURANCA" -ForegroundColor Cyan

Test-ExpectedError "Endpoint protegido sem token" {
    Invoke-RestMethod `
        -Uri "$BaseUrl/profile" `
        -Method Get
}

Test-ExpectedError "Token invalido" {
    Invoke-RestMethod `
        -Uri "$BaseUrl/profile" `
        -Method Get `
        -Headers @{
            Authorization = "Bearer token-invalido"
        }
}

# ============================================================
# RESULTADO FINAL
# ============================================================

Write-Host ""
Write-Host "============================================================"
Write-Host "                     RESULTADO FINAL"
Write-Host "============================================================"
Write-Host ""

Write-Host "Testes aprovados: $passed" -ForegroundColor Green
Write-Host "Testes com erro:   $failed" -ForegroundColor Red

Write-Host ""

if ($failed -eq 0) {
    Write-Host "============================================================"
    Write-Host "       BACK-END: TODOS OS TESTES PASSARAM!"
    Write-Host "============================================================"
    Write-Host ""
    Write-Host "A API esta pronta para a etapa de integracao com o front-end." -ForegroundColor Green
}
else {
    Write-Host "============================================================"
    Write-Host "       BACK-END: AINDA EXISTEM ERROS"
    Write-Host "============================================================"
    Write-Host ""
    Write-Host "Corrija os endpoints indicados acima antes de finalizar." -ForegroundColor Yellow
}

Write-Host ""