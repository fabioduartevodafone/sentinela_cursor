# Guia de Deployment - Sistema Sentinela

## Pré-requisitos

### Ambiente de Produção
- **Docker**: versão 20.10+
- **Docker Compose**: versão 2.0+
- **Servidor**: Linux (Ubuntu 20.04+ recomendado)
- **RAM**: Mínimo 4GB, recomendado 8GB+
- **Storage**: Mínimo 20GB SSD
- **CPU**: 2 cores mínimo, 4+ recomendado
- **Rede**: Porta 80 e 443 abertas

### Domínio e SSL
- Domínio configurado apontando para o servidor
- Certificado SSL (Let's Encrypt recomendado)

## Configuração Inicial

### 1. Clone do Repositório
```bash
git clone https://github.com/your-org/sentinela.git
cd sentinela
```

### 2. Configuração de Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.production .env

# Editar com valores reais
nano .env
```

**Variáveis obrigatórias**:
```env
# Supabase (PRODUÇÃO)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Database
POSTGRES_PASSWORD=secure_password_here
DATABASE_URL=postgresql://sentinela_user:secure_password@postgres:5432/sentinela_db

# Security
JWT_SECRET=your-super-secure-jwt-secret-32-chars-min
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Redis
REDIS_PASSWORD=secure_redis_password
```

### 3. Configuração do Supabase

#### Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie novo projeto
3. Configure as tabelas necessárias:

```sql
-- Tabela de usuários
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  cpf VARCHAR(11),
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('citizen', 'agent', 'admin')),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de emergências
CREATE TABLE emergencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  type VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  location JSONB NOT NULL,
  severity VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  contact_phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Deployment com Docker

### 1. Build da Aplicação
```bash
# Build da imagem
docker-compose build

# Ou build específico
docker build -t sentinela-app .
```

### 2. Inicialização dos Serviços
```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f sentinela-app
```

### 3. Configuração do Nginx (Proxy Reverso)
```bash
# Instalar Nginx no host
sudo apt update
sudo apt install nginx

# Configurar virtual host
sudo nano /etc/nginx/sites-available/sentinela
```

**Configuração do Nginx**:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://localhost:80/health;
        access_log off;
    }
}
```

### 4. SSL com Let's Encrypt
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d your-domain.com

# Configurar renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoramento e Logs

### 1. Health Checks
```bash
# Verificar saúde da aplicação
curl -f http://your-domain.com/health

# Verificar containers
docker-compose ps
docker-compose logs sentinela-app
```

### 2. Monitoramento com Prometheus (Opcional)
```bash
# Iniciar serviços de monitoramento
docker-compose --profile monitoring up -d

# Acessar Grafana
# http://your-domain.com:3000
# Login: admin / password definida no .env
```

### 3. Backup Automático
```bash
# Criar script de backup
sudo nano /usr/local/bin/sentinela-backup.sh
```

**Script de backup**:
```bash
#!/bin/bash
BACKUP_DIR="/backups/sentinela"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Backup do banco de dados
docker-compose exec -T postgres pg_dump -U sentinela_user sentinela_db > $BACKUP_DIR/db_backup_$DATE.sql

# Backup dos volumes
docker run --rm -v sentinela_postgres_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/postgres_data_$DATE.tar.gz -C /data .

# Limpar backups antigos (manter 30 dias)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup concluído: $DATE"
```

```bash
# Tornar executável
sudo chmod +x /usr/local/bin/sentinela-backup.sh

# Configurar cron para backup diário
sudo crontab -e
# Adicionar: 0 2 * * * /usr/local/bin/sentinela-backup.sh
```

## Atualizações

### 1. Atualização da Aplicação
```bash
# Parar serviços
docker-compose down

# Atualizar código
git pull origin main

# Rebuild e restart
docker-compose build
docker-compose up -d

# Verificar saúde
curl -f http://your-domain.com/health
```

### 2. Rollback em Caso de Problemas
```bash
# Voltar para versão anterior
git checkout previous-stable-tag

# Rebuild
docker-compose build
docker-compose up -d
```

## Segurança

### 1. Firewall
```bash
# Configurar UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 5432  # PostgreSQL apenas interno
sudo ufw deny 6379  # Redis apenas interno
```

### 2. Fail2Ban
```bash
# Instalar Fail2Ban
sudo apt install fail2ban

# Configurar para Nginx
sudo nano /etc/fail2ban/jail.local
```

```ini
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
```

### 3. Atualizações de Segurança
```bash
# Configurar atualizações automáticas
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Troubleshooting

### Problemas Comuns

#### 1. Container não inicia
```bash
# Verificar logs
docker-compose logs sentinela-app

# Verificar configuração
docker-compose config

# Verificar recursos
docker system df
```

#### 2. Banco de dados não conecta
```bash
# Verificar status do PostgreSQL
docker-compose logs postgres

# Testar conexão
docker-compose exec postgres psql -U sentinela_user -d sentinela_db -c "SELECT 1;"
```

#### 3. Aplicação lenta
```bash
# Verificar recursos
docker stats

# Verificar logs de erro
docker-compose logs sentinela-app | grep ERROR

# Verificar conexões de rede
netstat -tulpn | grep :80
```

### Comandos Úteis

```bash
# Reiniciar apenas a aplicação
docker-compose restart sentinela-app

# Verificar uso de recursos
docker system df
docker stats

# Limpar recursos não utilizados
docker system prune -a

# Backup manual do banco
docker-compose exec postgres pg_dump -U sentinela_user sentinela_db > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U sentinela_user sentinela_db < backup.sql
```

## Contatos de Suporte

- **Emergências**: suporte-emergencia@sentinela.com
- **Técnico**: tech-support@sentinela.com
- **Documentação**: https://docs.sentinela.com
- **Status**: https://status.sentinela.com