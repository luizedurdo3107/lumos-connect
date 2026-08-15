$API_URL = "http://localhost:3000"

Write-Host ""
Write-Host "============================================"
Write-Host "       LUMOS CONNECT - TESTE AGENDA"
Write-Host "============================================"
Write-Host ""

$email = Read-Host "E-mail"
$password = Read-Host "Senha" -AsSecureString

# Converter senha para texto
$passwordPlain = [System.Net.NetworkCredential]::new("", $password).Password

# ============================================
# 1 - LOGIN
# ============================================

Write-Host ""
Write-Host "[1/5] Fazendo login..."

$loginBody = @{
    email    = $email
    password = $passwordPlain
} | ConvertTo-Json

try {

    $login = Invoke-RestMethod `
        -Uri "$API_URL/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody

    if (-not $login.token) {
        throw "A API não retornou um token."
    }

    Write-Host "[OK] Login realizado com sucesso." -ForegroundColor Green

}
catch {

    Write-Host "[ERRO] Falha no login." -ForegroundColor Red

    Write-Host ""
    Write-Host "Detalhes da API:" -ForegroundColor Yellow

    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }
    else {
        Write-Host $_.Exception.Message
    }

    exit
}

$token = $login.token

$headers = @{
    Authorization = "Bearer $token"
}

# ============================================
# 2 - LISTAR AGENDA
# ============================================

Write-Host ""
Write-Host "[2/5] Buscando eventos da agenda..."

try {

    $events = Invoke-RestMethod `
        -Uri "$API_URL/agenda" `
        -Method Get `
        -Headers $headers

    Write-Host "[OK] Eventos encontrados: $($events.Count)" `
        -ForegroundColor Green

}
catch {

    Write-Host "[ERRO] Não foi possível buscar a agenda." `
        -ForegroundColor Red

    Write-Host $_.Exception.Message

    exit
}

# ============================================
# 3 - CRIAR EVENTO
# ============================================

Write-Host ""
Write-Host "[3/5] Criando evento de teste..."

$eventBody = @{
    title       = "Teste Agenda Lumos"
    description = "Evento criado automaticamente pelo teste."
    date        = (Get-Date).AddDays(1).ToUniversalTime().ToString("o")
    type        = "ESTUDO"
} | ConvertTo-Json

try {

    $newEvent = Invoke-RestMethod `
        -Uri "$API_URL/agenda" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $eventBody

    Write-Host "[OK] Evento criado." -ForegroundColor Green
    Write-Host "ID: $($newEvent.id)"

}
catch {

    Write-Host "[ERRO] Não foi possível criar o evento." `
        -ForegroundColor Red

    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }

    exit
}

# ============================================
# 4 - BUSCAR EVENTO
# ============================================

Write-Host ""
Write-Host "[4/5] Buscando evento criado..."

try {

    $event = Invoke-RestMethod `
        -Uri "$API_URL/agenda/$($newEvent.id)" `
        -Method Get `
        -Headers $headers

    Write-Host "[OK] Evento encontrado." `
        -ForegroundColor Green

    $event | ConvertTo-Json -Depth 10

}
catch {

    Write-Host "[ERRO] Não foi possível buscar o evento." `
        -ForegroundColor Red

    exit
}

# ============================================
# 5 - EXCLUIR EVENTO
# ============================================

Write-Host ""
Write-Host "[5/5] Excluindo evento de teste..."

try {

    $delete = Invoke-RestMethod `
        -Uri "$API_URL/agenda/$($newEvent.id)" `
        -Method Delete `
        -Headers $headers

    Write-Host "[OK] Evento excluído." `
        -ForegroundColor Green

}
catch {

    Write-Host "[ERRO] Não foi possível excluir o evento." `
        -ForegroundColor Red

    exit
}

# ============================================
# FINAL
# ============================================

Write-Host ""
Write-Host "============================================"
Write-Host "          TESTE FINALIZADO COM SUCESSO"
Write-Host "============================================"
Write-Host ""