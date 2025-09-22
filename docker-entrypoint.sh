#!/bin/sh
set -e

# Função para logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Iniciando Sentinela Emergency System..."

# Verificar se os arquivos necessários existem
if [ ! -f "/usr/share/nginx/html/index.html" ]; then
    log "ERRO: Arquivos da aplicação não encontrados!"
    exit 1
fi

# Configurar permissões
chown -R nginx:nginx /usr/share/nginx/html
chmod -R 755 /usr/share/nginx/html

# Verificar configuração do nginx
nginx -t

log "Configuração validada. Iniciando nginx..."

# Executar comando passado como argumento
exec "$@"