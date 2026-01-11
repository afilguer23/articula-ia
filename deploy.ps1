# 🚀 Script de Deploy Automático - ArticulaIA
# PowerShell Script para Windows

param(
    [string]$Message = "Update: Automatic commit"
)

Write-Host "🚀 ArticulaIA - Deploy Automático" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se há mudanças
Write-Host "📋 Verificando mudanças..." -ForegroundColor Yellow
$status = git status --porcelain

if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "✅ Nenhuma mudança detectada. Nada para fazer." -ForegroundColor Green
    exit 0
}

Write-Host "📝 Mudanças detectadas:" -ForegroundColor Green
git status --short

# 2. Adicionar todos os arquivos
Write-Host ""
Write-Host "➕ Adicionando arquivos..." -ForegroundColor Yellow
git add .

# 3. Fazer commit
Write-Host ""
Write-Host "💾 Criando commit..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "$Message [$timestamp]"
git commit -m $commitMessage

# 4. Verificar se remote existe
$remotes = git remote
if ($remotes -notcontains "origin") {
    Write-Host ""
    Write-Host "⚠️  Remote 'origin' não configurado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para configurar:" -ForegroundColor Yellow
    Write-Host "1. Crie um repositório em: https://github.com/new" -ForegroundColor Cyan
    Write-Host "2. Execute: git remote add origin https://github.com/SEU-USUARIO/articula-ia.git" -ForegroundColor Cyan
    Write-Host "3. Execute: git push -u origin main" -ForegroundColor Cyan
    exit 1
}

# 5. Fazer push
Write-Host ""
Write-Host "🌐 Enviando para GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host "🎉 Suas mudanças estão no GitHub!" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Erro no push. Verifique sua conexão e credenciais." -ForegroundColor Red
    exit 1
}
