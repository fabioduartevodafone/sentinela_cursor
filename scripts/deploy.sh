#!/bin/bash

# Script de Deployment - Sistema Sentinela
# Versão: 1.0.0
# Autor: Sistema Sentinela Team

set -e  # Parar execução em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
PROJECT_NAME="sentinela"
DOCKER_IMAGE="sentinela-app"
BACKUP_DIR="/backups/sentinela"
LOG_FILE="/var/log/sentinela-deploy.log"

# Funções auxiliares
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Verificar pré-requisitos
check_prerequisites() {
    log "Verificando pré-requisitos..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado"
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose não está instalado"
    fi
    
    # Verificar arquivo .env
    if [ ! -f ".env" ]; then
        error "Arquivo .env não encontrado. Copie .env.production e configure as variáveis"
    fi
    
    # Verificar variáveis obrigatórias
    source .env
    if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
        error "Variáveis do Supabase não configuradas no .env"
    fi
    
    success "Pré-requisitos verificados"
}

# Backup antes do deployment
create_backup() {
    log "Criando backup antes do deployment..."
    
    # Criar diretório de backup
    mkdir -p "$BACKUP_DIR"
    
    # Timestamp para o backup
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    
    # Backup do banco de dados (se estiver rodando)
    if docker-compose ps postgres | grep -q "Up"; then
        log "Fazendo backup do banco de dados..."
        docker-compose exec -T postgres pg_dump -U sentinela_user sentinela_db > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
        success "Backup do banco criado: db_backup_$TIMESTAMP.sql"
    fi
    
    # Backup dos volumes
    if docker volume ls | grep -q "${PROJECT_NAME}_postgres_data"; then
        log "Fazendo backup dos volumes..."
        docker run --rm \
            -v ${PROJECT_NAME}_postgres_data:/data \
            -v $BACKUP_DIR:/backup \
            alpine tar czf /backup/postgres_data_$TIMESTAMP.tar.gz -C /data .
        success "Backup dos volumes criado: postgres_data_$TIMESTAMP.tar.gz"
    fi
}

# Build da aplicação
build_application() {
    log "Iniciando build da aplicação..."
    
    # Parar containers existentes
    log "Parando containers existentes..."
    docker-compose down || true
    
    # Limpar imagens antigas (opcional)
    if [ "$1" = "--clean" ]; then
        log "Limpando imagens antigas..."
        docker image prune -f
        docker system prune -f
    fi
    
    # Build da nova imagem
    log "Fazendo build da nova imagem..."
    docker-compose build --no-cache
    
    success "Build concluído"
}

# Deploy da aplicação
deploy_application() {
    log "Iniciando deployment..."
    
    # Iniciar serviços
    log "Iniciando serviços..."
    docker-compose up -d
    
    # Aguardar inicialização
    log "Aguardando inicialização dos serviços..."
    sleep 30
    
    # Verificar saúde dos containers
    check_health
    
    success "Deployment concluído"
}

# Verificar saúde da aplicação
check_health() {
    log "Verificando saúde da aplicação..."
    
    # Verificar containers
    if ! docker-compose ps | grep -q "Up"; then
        error "Alguns containers não estão rodando"
    fi
    
    # Verificar endpoint de health
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Tentativa $attempt/$max_attempts - Verificando endpoint de health..."
        
        if curl -f -s http://localhost/health > /dev/null; then
            success "Aplicação está saudável"
            return 0
        fi
        
        sleep 10
        ((attempt++))
    done
    
    error "Aplicação não respondeu ao health check após $max_attempts tentativas"
}

# Rollback em caso de falha
rollback() {
    warning "Iniciando rollback..."
    
    # Parar containers atuais
    docker-compose down
    
    # Restaurar backup mais recente
    local latest_backup=$(ls -t $BACKUP_DIR/db_backup_*.sql 2>/dev/null | head -n1)
    
    if [ -n "$latest_backup" ]; then
        log "Restaurando backup: $latest_backup"
        
        # Iniciar apenas o PostgreSQL
        docker-compose up -d postgres
        sleep 20
        
        # Restaurar banco
        docker-compose exec -T postgres psql -U sentinela_user sentinela_db < "$latest_backup"
        
        success "Rollback concluído"
    else
        warning "Nenhum backup encontrado para rollback"
    fi
}

# Limpeza de recursos antigos
cleanup() {
    log "Limpando recursos antigos..."
    
    # Remover imagens não utilizadas
    docker image prune -f
    
    # Remover volumes órfãos
    docker volume prune -f
    
    # Limpar backups antigos (manter 30 dias)
    find $BACKUP_DIR -name "*.sql" -mtime +30 -delete 2>/dev/null || true
    find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete 2>/dev/null || true
    
    success "Limpeza concluída"
}

# Mostrar logs da aplicação
show_logs() {
    log "Mostrando logs da aplicação..."
    docker-compose logs -f --tail=100 sentinela-app
}

# Mostrar status dos serviços
show_status() {
    log "Status dos serviços:"
    docker-compose ps
    
    log "Uso de recursos:"
    docker stats --no-stream
    
    log "Verificando endpoint de health:"
    curl -s http://localhost/health | jq . || echo "Endpoint não disponível"
}

# Menu de ajuda
show_help() {
    echo "Script de Deployment - Sistema Sentinela"
    echo ""
    echo "Uso: $0 [COMANDO] [OPÇÕES]"
    echo ""
    echo "Comandos:"
    echo "  deploy          Executa deployment completo (padrão)"
    echo "  build           Apenas faz build da aplicação"
    echo "  start           Inicia os serviços"
    echo "  stop            Para os serviços"
    echo "  restart         Reinicia os serviços"
    echo "  status          Mostra status dos serviços"
    echo "  logs            Mostra logs da aplicação"
    echo "  health          Verifica saúde da aplicação"
    echo "  backup          Cria backup manual"
    echo "  rollback        Executa rollback para backup anterior"
    echo "  cleanup         Limpa recursos antigos"
    echo "  help            Mostra esta ajuda"
    echo ""
    echo "Opções:"
    echo "  --clean         Limpa imagens antigas antes do build"
    echo "  --no-backup     Pula criação de backup"
    echo ""
    echo "Exemplos:"
    echo "  $0 deploy --clean"
    echo "  $0 build --no-backup"
    echo "  $0 status"
}

# Função principal
main() {
    local command=${1:-deploy}
    local options=${2:-}
    
    # Criar diretório de log
    mkdir -p "$(dirname "$LOG_FILE")"
    
    case $command in
        "deploy")
            log "=== Iniciando Deployment Completo ==="
            check_prerequisites
            
            if [ "$options" != "--no-backup" ]; then
                create_backup
            fi
            
            build_application "$options"
            deploy_application
            cleanup
            
            success "=== Deployment Concluído com Sucesso ==="
            ;;
            
        "build")
            check_prerequisites
            build_application "$options"
            ;;
            
        "start")
            log "Iniciando serviços..."
            docker-compose up -d
            check_health
            ;;
            
        "stop")
            log "Parando serviços..."
            docker-compose down
            success "Serviços parados"
            ;;
            
        "restart")
            log "Reiniciando serviços..."
            docker-compose restart
            check_health
            ;;
            
        "status")
            show_status
            ;;
            
        "logs")
            show_logs
            ;;
            
        "health")
            check_health
            ;;
            
        "backup")
            create_backup
            ;;
            
        "rollback")
            rollback
            ;;
            
        "cleanup")
            cleanup
            ;;
            
        "help"|"-h"|"--help")
            show_help
            ;;
            
        *)
            error "Comando desconhecido: $command. Use '$0 help' para ver os comandos disponíveis."
            ;;
    esac
}

# Trap para capturar erros e fazer rollback automático
trap 'if [ $? -ne 0 ]; then error "Deployment falhou. Execute rollback se necessário."; fi' EXIT

# Executar função principal
main "$@"