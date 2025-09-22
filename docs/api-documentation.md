# API Documentation - Sistema Sentinela

## Visão Geral

O Sistema Sentinela é uma plataforma de comunicação de emergências e segurança pública que oferece endpoints para integração com sistemas externos.

### Informações Básicas

- **Base URL**: `https://your-domain.com/api`
- **Versão**: `v1`
- **Formato**: JSON
- **Autenticação**: JWT Bearer Token
- **Rate Limit**: 1000 requests/hour por IP

## Autenticação

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "userType": "citizen|agent|admin"
}
```

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Nome do Usuário",
      "userType": "citizen",
      "isApproved": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

### Registro
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Nome Completo",
  "email": "user@example.com",
  "password": "password123",
  "phone": "+5511999999999",
  "cpf": "12345678901",
  "userType": "citizen"
}
```

## Endpoints de Emergência

### Criar Ocorrência de Emergência
```http
POST /api/emergencies
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "fire|medical|security|accident|other",
  "description": "Descrição detalhada da emergência",
  "location": {
    "latitude": -23.5505,
    "longitude": -46.6333,
    "address": "Endereço completo"
  },
  "severity": "low|medium|high|critical",
  "contactPhone": "+5511999999999"
}
```

**Resposta de Sucesso (201)**:
```json
{
  "success": true,
  "data": {
    "id": "emergency-uuid",
    "protocolNumber": "EMG-2024-001234",
    "status": "pending",
    "estimatedResponse": "15 minutes",
    "assignedAgents": []
  }
}
```

### Listar Emergências
```http
GET /api/emergencies?status=pending&type=fire&limit=20&offset=0
Authorization: Bearer {token}
```

### Atualizar Status da Emergência (Agentes/Admin)
```http
PATCH /api/emergencies/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in_progress|resolved|cancelled",
  "notes": "Observações sobre a atualização",
  "agentId": "agent-uuid"
}
```

## Endpoints de Usuários

### Perfil do Usuário
```http
GET /api/users/profile
Authorization: Bearer {token}
```

### Atualizar Perfil
```http
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Novo Nome",
  "phone": "+5511888888888",
  "address": "Novo endereço"
}
```

## Endpoints de Localização

### Buscar Endereço por CEP
```http
GET /api/location/cep/{cep}
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "cep": "01310-100",
    "street": "Avenida Paulista",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP",
    "coordinates": {
      "latitude": -23.5505,
      "longitude": -46.6333
    }
  }
}
```

### Geocoding Reverso
```http
GET /api/location/reverse?lat=-23.5505&lng=-46.6333
```

## Endpoints de Notificações

### Listar Notificações
```http
GET /api/notifications?unread=true&limit=50
Authorization: Bearer {token}
```

### Marcar como Lida
```http
PATCH /api/notifications/{id}/read
Authorization: Bearer {token}
```

## Endpoints de Relatórios (Admin)

### Estatísticas Gerais
```http
GET /api/reports/stats?period=7d&type=emergencies
Authorization: Bearer {token}
```

### Relatório de Emergências
```http
GET /api/reports/emergencies?startDate=2024-01-01&endDate=2024-01-31&format=json
Authorization: Bearer {token}
```

## Health Check

### Status da Aplicação
```http
GET /health
```

**Resposta**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "service": "Sentinela Emergency System",
  "uptime": "72h 15m 30s",
  "environment": "production"
}
```

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida |
| 401 | Não autorizado |
| 403 | Acesso negado |
| 404 | Recurso não encontrado |
| 429 | Rate limit excedido |
| 500 | Erro interno do servidor |

## Estrutura de Erro Padrão

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos fornecidos",
    "details": {
      "field": "email",
      "reason": "Formato de email inválido"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Rate Limiting

- **Limite**: 1000 requests por hora por IP
- **Headers de resposta**:
  - `X-RateLimit-Limit`: Limite total
  - `X-RateLimit-Remaining`: Requests restantes
  - `X-RateLimit-Reset`: Timestamp do reset

## Webhooks (Opcional)

### Configurar Webhook
```http
POST /api/webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://your-system.com/webhook",
  "events": ["emergency.created", "emergency.updated"],
  "secret": "webhook-secret-key"
}
```

### Eventos Disponíveis
- `emergency.created`: Nova emergência criada
- `emergency.updated`: Status da emergência atualizado
- `user.registered`: Novo usuário registrado
- `user.approved`: Usuário aprovado

## Exemplos de Integração

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://your-domain.com/api',
  headers: {
    'Authorization': 'Bearer your-jwt-token',
    'Content-Type': 'application/json'
  }
});

// Criar emergência
const createEmergency = async (emergencyData) => {
  try {
    const response = await api.post('/emergencies', emergencyData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar emergência:', error.response.data);
  }
};
```

### Python
```python
import requests

class SentinelaAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def create_emergency(self, emergency_data):
        response = requests.post(
            f'{self.base_url}/emergencies',
            json=emergency_data,
            headers=self.headers
        )
        return response.json()
```

## Suporte

Para suporte técnico ou dúvidas sobre a API:
- **Email**: api-support@sentinela.com
- **Documentação**: https://docs.sentinela.com
- **Status**: https://status.sentinela.com