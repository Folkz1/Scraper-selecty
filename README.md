# Selecty Scraper Automation

Scraper automatizado para o portal de vagas Selecty com API REST para integração com n8n e outras ferramentas de automação.

## 🚀 Funcionalidades

- **Scraper Automatizado**: Extrai vagas do portal Selecty com autenticação automática
- **API REST**: Endpoints para execução via HTTP com autenticação por token
- **Rate Limiting**: Proteção contra uso excessivo (10 requests/hora por IP)
- **Docker Ready**: Containerização completa para deploy fácil
- **Status da Vaga**: Extrai o status de cada vaga (ex: "Vaga em processo seletivo")
- **Formatação Completa**: Dados estruturados e texto formatado para planilhas
- **Cache de Resultados**: Armazena último resultado para consulta rápida
- **Health Check**: Monitoramento de saúde da aplicação

## 📊 Dados Extraídos

Para cada vaga, o scraper extrai:

- Cargo
- Empresa
- Status da vaga
- Salário
- Jornada de trabalho
- Tipo de contrato
- Benefícios
- Descrição das atividades
- Experiências e qualificações necessárias
- Escolaridade
- Nível de atuação
- Área de atuação
- Localização
- Observações

## 🛠 Instalação Local

### Pré-requisitos

- Node.js 18+
- Docker (opcional)

### Configuração

1. Clone o repositório:
```bash
git clone https://github.com/Folkz1/Scraper-selecty.git
cd Scraper-selecty
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

4. Execute localmente:
```bash
npm start
```

A API estará disponível em `http://localhost:3000`

## 🐳 Deploy com Docker

### Build e execução local

```bash
# Build da imagem
docker build -t selecty-scraper .

# Executar container
docker run -d \
  --name selecty-scraper \
  -p 3000:3000 \
  --env-file .env \
  selecty-scraper
```

### Docker Compose

```bash
docker-compose up -d
```

## ☁️ Deploy no EasyPanel

1. **Conectar repositório GitHub**:
   - Acesse seu EasyPanel
   - Crie nova aplicação
   - Conecte ao repositório GitHub

2. **Configurar variáveis de ambiente**:
   ```
   SELECTY_EMAIL=seu_email@exemplo.com
   SELECTY_PASSWORD=sua_senha
   SELECTY_LOGIN_URL=https://selecty.app/login
   SELECTY_VACANCY_URL=https://selecty.app/vacancy/lists/index
   SCRAPER_TIMEOUT=30000
   SCRAPER_HEADLESS=true
   PORT=3000
   API_KEY=sua_chave_api_segura
   NODE_ENV=production
   ```

3. **Deploy automático**:
   - EasyPanel detectará o Dockerfile
   - Build e deploy serão automáticos
   - A aplicação ficará disponível na URL fornecida

## 📡 API Endpoints

### Autenticação

Todas as rotas requerem autenticação via Bearer token:

```bash
Authorization: Bearer YOUR_API_KEY
```

### Endpoints Disponíveis

#### `POST /api/scrape`
Executa o scraper e retorna todas as vagas extraídas.

**Resposta de sucesso:**
```json
{
  "success": true,
  "timestamp": "2025-11-13T20:28:08.934Z",
  "executionTime": "45s",
  "totalVacancies": 39,
  "extractedVacancies": 25,
  "successRate": "64%",
  "statusDistribution": {
    "Vaga em processo seletivo": 24,
    "Status não informado": 1
  },
  "vacancies": [
    {
      "cargo": "Marceneiro",
      "empresa": "H7 DESIGN DE INTERIORES",
      "statusVaga": "Vaga em processo seletivo",
      "salario": "R$ 3.800,00",
      "formattedText": "━━━━━━━━━RESUMO DA VAGA━━━━━━━━━\n..."
    }
  ]
}
```

#### `GET /api/scrape/status`
Retorna o status atual do scraper.

```json
{
  "success": true,
  "isRunning": false,
  "lastExecution": "2025-11-13T20:28:08.934Z",
  "hasCache": true,
  "lastSuccess": true
}
```

#### `GET /api/scrape/last`
Retorna o último resultado em cache.

#### `GET /api/health`
Health check da aplicação.

```json
{
  "status": "OK",
  "timestamp": "2025-11-13T20:28:08.934Z",
  "service": "Selecty Scraper API"
}
```

## 🔄 Integração com n8n

### Configuração do Workflow

1. **Cron Trigger**: Configure para executar nos horários desejados
2. **HTTP Request**: 
   - Method: POST
   - URL: `https://sua-app.easypanel.app/api/scrape`
   - Headers: `Authorization: Bearer YOUR_API_KEY`
   - Timeout: 15 minutos

3. **Processamento**: Use o campo `formattedText` de cada vaga para inserir no Google Sheets

### Exemplo de uso no n8n

```javascript
// No node de processamento, acesse os dados assim:
const vacancies = $json.vacancies;
const formattedData = vacancies.map(v => v.formattedText).join('\n\n');
```

## 🔧 Configuração de Variáveis

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `SELECTY_EMAIL` | Email de login no Selecty | `usuario@empresa.com` |
| `SELECTY_PASSWORD` | Senha do Selecty | `MinhaSenh@123` |
| `SELECTY_LOGIN_URL` | URL de login | `https://selecty.app/login` |
| `SELECTY_VACANCY_URL` | URL da lista de vagas | `https://selecty.app/vacancy/lists/index` |
| `SCRAPER_TIMEOUT` | Timeout em ms | `30000` |
| `SCRAPER_HEADLESS` | Modo headless | `true` |
| `PORT` | Porta da API | `3000` |
| `API_KEY` | Chave de autenticação | `chave-super-segura-123` |
| `NODE_ENV` | Ambiente | `production` |

## 🚨 Rate Limiting

- **Limite**: 10 requests por hora por IP
- **Window**: 1 hora
- **Headers**: Retorna informações de rate limit nos headers da resposta

## 🔍 Monitoramento

### Logs

A aplicação gera logs detalhados durante a execução:

```bash
# Ver logs do container
docker logs selecty-scraper -f
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Status do Scraper

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     http://localhost:3000/api/scrape/status
```

## 🛡️ Segurança

- **Autenticação obrigatória** em todos os endpoints do scraper
- **Rate limiting** para prevenir abuso
- **Variáveis de ambiente** para credenciais sensíveis
- **CORS configurado** para requisições cross-origin
- **Headers de segurança** incluídos nas respostas

## 🐛 Troubleshooting

### Erro de autenticação no Selecty
- Verifique se as credenciais estão corretas no `.env`
- Confirme se a conta não está bloqueada

### Timeout durante extração
- Aumente o `SCRAPER_TIMEOUT` para conexões lentas
- Verifique se o site está acessível

### Erro 401 na API
- Confirme se o `API_KEY` está correto
- Verifique se o header `Authorization` está sendo enviado

### Container não inicia
- Verifique se todas as variáveis de ambiente estão definidas
- Confirme se a porta 3000 não está em uso

## 📝 Changelog

### v1.0.0
- ✅ Scraper completo funcional
- ✅ API REST com autenticação
- ✅ Extração de status das vagas
- ✅ Docker e docker-compose
- ✅ Rate limiting
- ✅ Health checks
- ✅ Documentação completa

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação da API
- Verifique os logs da aplicação