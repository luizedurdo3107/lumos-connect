$ErrorActionPreference = "Stop"

$BASE_URL = "http://localhost:3000"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " TESTE AUTH - LUMOS CONNECT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$random = Get-Random -Minimum 1000 -Maximum 9999
$email = "teste$random@lumos.com"

# -----------------------------------------
# 1. CADASTRO
# -----------------------------------------
Write-Host "[1/4] Testando cadastro..." -ForegroundColor Yellow

$registerBody = @{
    name     = "Aluno Teste MVP"
    email    = $email
    password = "Teste12345"
} | ConvertTo-Json

$register = Invoke-RestMethod `
    -Uri "$BASE_URL/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $registerBody

if (-not $register) {
    throw "Cadastro não retornou dados."
}

Write-Host "OK - Cadastro criado: $email" -ForegroundColor Green

# -----------------------------------------
# 2. LOGIN
# -----------------------------------------
Write-Host "[2/4] Testando login..." -ForegroundColor Yellow

$loginBody = @{
    email    = $email
    password = "Teste12345"
} | ConvertTo-Json

$login = Invoke-RestMethod `
    -Uri "$BASE_URL/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

if (-not $login.token) {
    throw "Login não retornou token."
}

$token = $login.token

Write-Host "OK - JWT recebido" -ForegroundColor Green

$headers = @{
    Authorization = "Bearer $token"
}

# -----------------------------------------
# 3. /AUTH/ME
# -----------------------------------------
Write-Host "[3/4] Testando /auth/me..." -ForegroundColor Yellow

$me = Invoke-RestMethod `
    -Uri "$BASE_URL/auth/me" `
    -Method Get `
    -Headers $headers

if (-not $me) {
    throw "/auth/me não retornou usuário."
}

Write-Host "OK - Usuário autenticado: $($me.email)" -ForegroundColor Green

# -----------------------------------------
# 4. ACESSO SEM TOKEN
# -----------------------------------------
Write-Host "[4/4] Testando proteção sem token..." -ForegroundColor Yellow

try {
    Invoke-RestMethod `
        -Uri "$BASE_URL/auth/me" `
        -Method Get `
        -ErrorAction Stop

    throw "Endpoint aceitou acesso sem token."
}
catch {
    if ($_.Exception.Response.StatusCode.value__ -notin @(401,403)) {
        throw "Status inesperado no acesso sem token."
    }
}

Write-Host "OK - Endpoint protegido" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Green
Write-Host " AUTH: TODOS OS TESTES PASSARAM" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

$ErrorActionPreference = "Stop"

$BASE_URL = "http://localhost:3000"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " TESTE ATIVIDADES - LUMOS CONNECT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# LOGIN
$loginBody = @{
    email    = "luiz@lumos.com"
    password = "lumos12345"
} | ConvertTo-Json

$login = Invoke-RestMethod `
    -Uri "$BASE_URL/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

$token = $login.token

if (-not $token) {
    throw "Não foi possível obter token."
}

$headers = @{
    Authorization = "Bearer $token"
}

Write-Host "[1/4] Listando atividades..." -ForegroundColor Yellow

$activities = Invoke-RestMethod `
    -Uri "$BASE_URL/activities" `
    -Method Get `
    -Headers $headers

Write-Host "OK - GET /activities" -ForegroundColor Green

Write-Host "[2/4] Criando atividade..." -ForegroundColor Yellow

$body = @{
    title       = "Teste MVP"
    description = "Atividade criada automaticamente pelo teste"
    subject     = "Matemática"
    dueDate     = "2026-12-31T12:00:00.000Z"
} | ConvertTo-Json

try {
    $created = Invoke-RestMethod `
        -Uri "$BASE_URL/activities" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $body

    Write-Host "OK - Atividade criada: ID $($created.id)" -ForegroundColor Green
}
catch {
    Write-Host "POST /activities bloqueado ou indisponível para este usuário." -ForegroundColor DarkYellow
    Write-Host "Isso pode ser esperado caso somente ADMIN possa criar atividades." -ForegroundColor DarkYellow
}

Write-Host "[3/4] Testando acesso sem token..." -ForegroundColor Yellow

try {
    Invoke-RestMethod `
        -Uri "$BASE_URL/activities" `
        -Method Get `
        -ErrorAction Stop

    throw "GET /activities aceitou acesso sem token."
}
catch {
    if ($_.Exception.Response.StatusCode.value__ -notin @(401,403)) {
        throw "Status inesperado."
    }
}

Write-Host "OK - Proteção funcionando" -ForegroundColor Green

Write-Host "[4/4] Testando atividade inexistente..." -ForegroundColor Yellow

try {
    Invoke-RestMethod `
        -Uri "$BASE_URL/activities/999999" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop

    Write-Host "Endpoint retornou dados para ID inexistente." -ForegroundColor DarkYellow
}
catch {
    Write-Host "OK - ID inexistente tratado." -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host " ATIVIDADES: TESTES FINALIZADOS" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

$ErrorActionPreference = "Stop"

$BASE_URL = "http://localhost:3000"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " TESTE AGENDA - LUMOS CONNECT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$loginBody = @{
    email    = "luiz@lumos.com"
    password = "lumos12345"
} | ConvertTo-Json

$login = Invoke-RestMethod `
    -Uri "$BASE_URL/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

$headers = @{
    Authorization = "Bearer $($login.token)"
}

Write-Host "[1/4] Listando agenda..." -ForegroundColor Yellow

$agenda = Invoke-RestMethod `
    -Uri "$BASE_URL/agenda" `
    -Method Get `
    -Headers $headers

Write-Host "OK - GET /agenda" -ForegroundColor Green

Write-Host "[2/4] Criando evento..." -ForegroundColor Yellow

$body = @{
    title       = "Teste automatizado"
    description = "Evento criado pelo teste do MVP"
    date        = "2026-12-31T15:00:00.000Z"
    type        = "ESTUDO"
} | ConvertTo-Json

$created = Invoke-RestMethod `
    -Uri "$BASE_URL/agenda" `
    -Method Post `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $body

if (-not $created.id) {
    throw "Evento não foi criado."
}

$id = $created.id

Write-Host "OK - Evento criado: ID $id" -ForegroundColor Green

Write-Host "[3/4] Atualizando evento..." -ForegroundColor Yellow

$updateBody = @{
    title = "Teste automatizado atualizado"
} | ConvertTo-Json

$updated = Invoke-RestMethod `
    -Uri "$BASE_URL/agenda/$id" `
    -Method Put `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $updateBody

Write-Host "OK - Evento atualizado" -ForegroundColor Green

Write-Host "[4/4] Excluindo evento..." -ForegroundColor Yellow

Invoke-RestMethod `
    -Uri "$BASE_URL/agenda/$id" `
    -Method Delete `
    -Headers $headers | Out-Null

Write-Host "OK - Evento excluído" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Green
Write-Host " AGENDA: TODOS OS TESTES PASSARAM" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

$ErrorActionPreference = "Stop"

$BASE_URL = "http://localhost:3000"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " TESTE SESSÕES DE ESTUDO" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$loginBody = @{
    email    = "luiz@lumos.com"
    password = "lumos12345"
} | ConvertTo-Json

$login = Invoke-RestMethod `
    -Uri "$BASE_URL/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

$headers = @{
    Authorization = "Bearer $($login.token)"
}

Write-Host "[1/4] Listando sessões..." -ForegroundColor Yellow

$sessions = Invoke-RestMethod `
    -Uri "$BASE_URL/study-sessions" `
    -Method Get `
    -Headers $headers

Write-Host "OK - GET /study-sessions" -ForegroundColor Green

Write-Host "[2/4] Criando sessão..." -ForegroundColor Yellow

$body = @{
    subject  = "Teste MVP"
    duration = 45
} | ConvertTo-Json

$created = Invoke-RestMethod `
    -Uri "$BASE_URL/study-sessions" `
    -Method Post `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $body

if (-not $created.id) {
    throw "Sessão não foi criada."
}

$id = $created.id

Write-Host "OK - Sessão criada: ID $id" -ForegroundColor Green

Write-Host "[3/4] Atualizando sessão..." -ForegroundColor Yellow

$updateBody = @{
    subject  = "Teste MVP Atualizado"
    duration = 60
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "$BASE_URL/study-sessions/$id" `
    -Method Put `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $updateBody | Out-Null

Write-Host "OK - Sessão atualizada" -ForegroundColor Green

Write-Host "[4/4] Excluindo sessão..." -ForegroundColor Yellow

Invoke-RestMethod `
    -Uri "$BASE_URL/study-sessions/$id" `
    -Method Delete `
    -Headers $headers | Out-Null

Write-Host "OK - Sessão excluída" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Green
Write-Host " SESSÕES: TODOS OS TESTES PASSARAM" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

$ErrorActionPreference = "Stop"

$BASE_URL = "http://localhost:3000"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " TESTE DE SEGURANÇA - LUMOS CONNECT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$endpoints = @(
    "/auth/me",
    "/activities",
    "/agenda",
    "/study-sessions",
    "/progress",
    "/profile"
)

foreach ($endpoint in $endpoints) {

    Write-Host "Testando $endpoint ..." -ForegroundColor Yellow

    try {

        Invoke-RestMethod `
            -Uri "$BASE_URL$endpoint" `
            -Method Get `
            -ErrorAction Stop

        Write-Host "FALHA - $endpoint aceitou acesso sem token!" -ForegroundColor Red
    }
    catch {

        $status = $_.Exception.Response.StatusCode.value__

        if ($status -eq 401 -or $status -eq 403) {
            Write-Host "OK - bloqueado ($status)" -ForegroundColor Green
        }
        else {
            Write-Host "ATENÇÃO - retornou status $status" -ForegroundColor DarkYellow
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host " SEGURANÇA: TESTE FINALIZADO" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green