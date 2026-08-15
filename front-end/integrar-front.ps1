$ErrorActionPreference = "Continue"

$API = "http://localhost:3000"

Write-Host ""
Write-Host "============================================================"
Write-Host "       LUMOS CONNECT - INTEGRACAO FRONT-END"
Write-Host "============================================================"
Write-Host ""

$ok = 0
$erro = 0
$avisos = 0

function Testar-Arquivo {
    param(
        [string]$Caminho
    )

    if (Test-Path $Caminho) {
        Write-Host "[OK]   $Caminho" -ForegroundColor Green
        $script:ok++
    }
    else {
        Write-Host "[ERRO] $Caminho não encontrado" -ForegroundColor Red
        $script:erro++
    }
}

function Testar-API {
    param(
        [string]$Nome,
        [string]$Endpoint
    )

    try {
        $response = Invoke-RestMethod `
            -Uri "$API$Endpoint" `
            -Method Get `
            -TimeoutSec 5

        Write-Host "[OK]   API $Nome -> $Endpoint" -ForegroundColor Green
        $script:ok++
    }
    catch {
        Write-Host "[ERRO] API $Nome -> $Endpoint" -ForegroundColor Red
        $script:erro++
    }
}

Write-Host "1. VERIFICANDO ESTRUTURA"
Write-Host ""

Testar-Arquivo ".\js\api.js"
Testar-Arquivo ".\js\auth.js"
Testar-Arquivo ".\js\authGuard.js"
Testar-Arquivo ".\js\main.js"

Write-Host ""
Write-Host "2. VERIFICANDO PAGINAS"
Write-Host ""

$paginas = @(
    ".\pages\login",
    ".\pages\cadastro",
    ".\pages\inicio",
    ".\pages\atividades",
    ".\pages\agenda",
    ".\pages\progresso",
    ".\pages\configurações",
    ".\pages\forms"
)

foreach ($pagina in $paginas) {

    if (Test-Path $pagina) {
        Write-Host "[OK]   $pagina" -ForegroundColor Green
        $ok++
    }
    else {
        Write-Host "[ERRO] $pagina não encontrada" -ForegroundColor Red
        $erro++
    }
}

Write-Host ""
Write-Host "3. TESTANDO CONEXAO COM O BACK-END"
Write-Host ""

Testar-API "API principal" "/"

Write-Host ""
Write-Host "4. VERIFICANDO ARQUIVOS HTML"
Write-Host ""

$htmls = Get-ChildItem `
    -Path ".\pages" `
    -Filter "*.html" `
    -Recurse `
    -ErrorAction SilentlyContinue

if ($htmls.Count -eq 0) {

    Write-Host "[AVISO] Nenhum HTML encontrado diretamente nas páginas." `
        -ForegroundColor Yellow

    $avisos++
}
else {

    foreach ($html in $htmls) {

        Write-Host "[OK]   $($html.FullName)" `
            -ForegroundColor Green

        $ok++

        $conteudo = Get-Content $html.FullName -Raw

        if ($conteudo -match "api\.js") {

            Write-Host "       [OK] api.js encontrado"
            $ok++
        }
        else {

            Write-Host "       [AVISO] api.js não está incluído"
            $avisos++
        }

        if ($conteudo -match "auth\.js") {

            Write-Host "       [OK] auth.js encontrado"
            $ok++
        }
        else {

            Write-Host "       [AVISO] auth.js não está incluído"
            $avisos++
        }
    }
}

Write-Host ""
Write-Host "5. PROCURANDO CHAMADAS PARA API"
Write-Host ""

$arquivosJS = Get-ChildItem `
    -Path "." `
    -Filter "*.js" `
    -Recurse `
    -ErrorAction SilentlyContinue

$fetchEncontrados = 0

foreach ($arquivo in $arquivosJS) {

    $conteudo = Get-Content $arquivo.FullName -Raw

    if (
        $conteudo -match "fetch\(" -or
        $conteudo -match "apiRequest" -or
        $conteudo -match "api\."
    ) {

        Write-Host "[OK]   Integração encontrada: $($arquivo.FullName)" `
            -ForegroundColor Green

        $fetchEncontrados++
    }
}

if ($fetchEncontrados -eq 0) {

    Write-Host "[AVISO] Nenhuma chamada de API encontrada." `
        -ForegroundColor Yellow

    $avisos++
}

Write-Host ""
Write-Host "============================================================"
Write-Host "                     RESULTADO"
Write-Host "============================================================"
Write-Host ""

Write-Host "Verificações OK:     $ok" -ForegroundColor Green
Write-Host "Erros:               $erro" -ForegroundColor Red
Write-Host "Avisos:              $avisos" -ForegroundColor Yellow

Write-Host ""

if ($erro -eq 0) {

    Write-Host "ESTRUTURA DO FRONT: OK" -ForegroundColor Green
    Write-Host ""
    Write-Host "O próximo passo é integrar as páginas com a API."
}
else {

    Write-Host "AINDA EXISTEM PROBLEMAS NA ESTRUTURA." `
        -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================================"