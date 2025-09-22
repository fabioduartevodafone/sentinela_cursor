#!/usr/bin/env pwsh
# Script de automação para commit e push
# Uso: .\auto-push.ps1 "mensagem do commit"

param(
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage
)

# Cores para output
$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Write-ColorOutput {
    param($Color, $Message)
    Write-Host "$Color$Message$Reset"
}

# Verificar se estamos em um repositório Git
if (-not (Test-Path ".git")) {
    Write-ColorOutput $Red "Erro: Nao e um repositorio Git!"
    exit 1
}

Write-ColorOutput $Blue "Iniciando processo de commit e push..."

# Verificar status do repositório
Write-ColorOutput $Yellow "Verificando status do repositório..."
$status = git status --porcelain
if (-not $status) {
    Write-ColorOutput $Yellow "Nenhuma alteracao detectada para commit."
    Write-ColorOutput $Blue "Status atual:"
    git status
    exit 0
}

# Mostrar arquivos que serão adicionados
Write-ColorOutput $Blue "Arquivos que serao commitados:"
git status --short

# Adicionar todos os arquivos
Write-ColorOutput $Yellow "Adicionando arquivos..."
git add .

# Fazer commit
Write-ColorOutput $Yellow "Fazendo commit..."
git commit -m "$CommitMessage"

if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput $Red "Erro no commit!"
    exit 1
}

# Fazer push
Write-ColorOutput $Yellow "Enviando para repositorio remoto..."
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput $Green "Push realizado com sucesso!"
    Write-ColorOutput $Blue "Status final:"
    git status
} else {
    Write-ColorOutput $Red "Erro no push!"
    exit 1
}

Write-ColorOutput $Green "Processo concluido com sucesso!"