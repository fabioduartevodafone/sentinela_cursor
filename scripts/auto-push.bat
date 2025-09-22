@echo off
REM Script de automação para commit e push
REM Uso: auto-push.bat "mensagem do commit"

if "%~1"=="" (
    echo ❌ Erro: Mensagem de commit é obrigatória!
    echo Uso: auto-push.bat "mensagem do commit"
    exit /b 1
)

set "COMMIT_MESSAGE=%~1"

REM Verificar se estamos em um repositório Git
if not exist ".git" (
    echo ❌ Erro: Não é um repositório Git!
    exit /b 1
)

echo 🚀 Iniciando processo de commit e push...

REM Verificar status do repositório
echo 📋 Verificando status do repositório...
git status --porcelain > temp_status.txt
for /f %%i in ("temp_status.txt") do set size=%%~zi
del temp_status.txt

if %size% equ 0 (
    echo ⚠️  Nenhuma alteração detectada para commit.
    echo 📊 Status atual:
    git status
    exit /b 0
)

REM Mostrar arquivos que serão adicionados
echo 📁 Arquivos que serão commitados:
git status --short

REM Adicionar todos os arquivos
echo ➕ Adicionando arquivos...
git add .

REM Fazer commit
echo 💾 Fazendo commit...
git commit -m "%COMMIT_MESSAGE%"

if errorlevel 1 (
    echo ❌ Erro no commit!
    exit /b 1
)

REM Fazer push
echo 🌐 Enviando para repositório remoto...
git push origin main

if errorlevel 1 (
    echo ❌ Erro no push!
    exit /b 1
) else (
    echo ✅ Push realizado com sucesso!
    echo 📊 Status final:
    git status
)

echo 🎉 Processo concluído com sucesso!