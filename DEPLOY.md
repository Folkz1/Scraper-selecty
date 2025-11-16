# 🚀 Guia de Deploy - Selecty Scraper

## 📋 Pré-requisitos

- [ ] Conta no GitHub
- [ ] Conta no EasyPanel
- [ ] Credenciais do Selecty
- [ ] Conta no n8n (ou instância própria)
- [ ] Google Sheets configurado

## 🔧 Passo 1: Preparação do Repositório

### 1.1 Push para GitHub

```bash
# Inicializar git (se ainda não foi feito)
git init

# Adicionar remote do seu repositório
git remote add origin https://github.com/Folkz1/Scraper-selecty.git

# Adicionar todos os arquivos
git add .

# Commit inicial
git commit -m "feat: scraper completo com API REST e Docker"

# Push para main
git push -u origin main
```

### 1.2 Verificar arquivos essenciais

Confirme que estes arquivos estão no repositório:
- [ ] `Dockerfile`
- [ ] `docker-compose.yml`
- [ ] `package.json`
- [ ] `api/server.js`
- [ ] `.env.example`
- [ ] `README.md`

## ☁️ Passo 2: Deploy no EasyPanel

### 2.1 Criar nova aplicação

1. Acesse seu EasyPanel
2. Clique em "Create App"
3. Selecione "GitHub Repository"
4. Conecte ao repositório `Folkz1/Scraper-selecty`
5. Branch: `main`

### 2.2 Configurar variáveis de ambiente

No EasyPanel, adicione estas variáveis:

```env
SELECTY_EMAIL=seu_email@selecty.com
SELECTY_PASSWORD=sua_senha_selecty
SELECTY_LOGIN_URL=https://selecty.app/login
SELECTY_VACANCY_URL=https://selecty.app/vacancy/lists/index
SCRAPER_TIMEOUT=30000
SCRAPER_HEADLESS=true
PORT=3000
API_KEY=gere_uma_chave_super_segura_aqui
NODE_ENV=production
```

### 2.3 Configurações de deploy

- **Build Command**: Automático (detecta Dockerfile)
- **Port**: 3000
- **Health Check**: `/api/health`
- **Restart Policy**: Always

### 2.4 Deploy

1. Clique em "Deploy"
2. Aguarde o build completar
3. Anote a URL da aplicação (ex: `https://scraper-selecty-abc123.easypanel.app`)

## 🧪 Passo 3: Testar a API

### 3.1 Teste local (opcional)

```bash
# Testar API localmente
npm run test-api
```

### 3.2 Teste no EasyPanel

```bash
# Health check
curl https://sua-app.easypanel.app/api/health

# Status (com autenticação)
curl -H "Authorization: Bearer SUA_API_KEY" \
     https://sua-app.easypanel.app/api/scrape/status

# Executar scraper (teste completo)
curl -X POST \
     -H "Authorization: Bearer SUA_API_KEY" \
     -H "Content-Type: application/json" \
     https://sua-app.easypanel.app/api/scrape
```

## 🔄 Passo 4: Configurar n8n

### 4.1 Importar workflow

1. Abra seu n8n
2. Clique em "Import from File"
3. Selecione o arquivo `n8n-workflow.json`

### 4.2 Configurar credenciais

#### HTTP Request Node:
- **URL**: `https://sua-app.easypanel.app/api/scrape`
- **Method**: POST
- **Authentication**: Header Auth
- **Header Name**: Authorization
- **Header Value**: `Bearer 1234`

#### Google Sheets Node:
1. Crie credencial do Google Sheets
2. Configure o ID da planilha
3. Nome da aba: "Vagas Selecty"

#### Slack Node (opcional):
1. Configure webhook do Slack
2. Ou use credencial do Slack

### 4.3 Configurar horários

No Cron Trigger:
- **Expression**: `30 7,11,17 * * *`
- **Timezone**: America/Sao_Paulo

Isso executará às:
- 07:30
- 11:30  
- 17:00

### 4.4 Testar workflow

1. Clique em "Test Workflow"
2. Execute manualmente
3. Verifique se os dados aparecem no Google Sheets

## 📊 Passo 5: Configurar Google Sheets

### 5.1 Criar planilha

1. Crie nova planilha no Google Sheets
2. Nome da aba: "Vagas Selecty"
3. Cabeçalho na A1: "Vagas do Portal Selecty"

### 5.2 Compartilhar com n8n

1. Clique em "Compartilhar"
2. Adicione o email da service account do n8n
3. Permissão: Editor

### 5.3 Copiar ID da planilha

Da URL: `https://docs.google.com/spreadsheets/d/ID_DA_PLANILHA/edit`
Copie o `ID_DA_PLANILHA` e use no n8n.

## 🔍 Passo 6: Monitoramento

### 6.1 Logs do EasyPanel

- Acesse a aba "Logs" no EasyPanel
- Monitore execuções e erros

### 6.2 Logs do n8n

- Veja histórico de execuções
- Configure alertas para falhas

### 6.3 Health checks

Configure monitoramento externo:
- UptimeRobot
- Pingdom
- StatusCake

URL para monitorar: `https://sua-app.easypanel.app/api/health`

## 🚨 Troubleshooting

### Erro de build no EasyPanel

```bash
# Verificar se Dockerfile está correto
docker build -t test .
```

### Erro 401 na API

- Verificar se API_KEY está configurada
- Confirmar header Authorization no n8n

### Timeout no scraper

- Aumentar SCRAPER_TIMEOUT para 60000
- Verificar se credenciais do Selecty estão corretas

### Erro no Google Sheets

- Verificar permissões da service account
- Confirmar ID da planilha no n8n

## 📈 Otimizações

### Performance

- Configure cache no EasyPanel
- Use CDN se necessário
- Monitore uso de recursos

### Segurança

- Rotacione API_KEY periodicamente
- Configure HTTPS only
- Monitore logs de acesso

### Backup

- Configure backup automático do Google Sheets
- Mantenha logs por 30 dias
- Documente configurações

## ✅ Checklist Final

- [ ] Aplicação deployada no EasyPanel
- [ ] API respondendo corretamente
- [ ] n8n workflow configurado
- [ ] Google Sheets recebendo dados
- [ ] Horários de execução configurados
- [ ] Monitoramento ativo
- [ ] Documentação atualizada

## 🎉 Pronto!

Seu scraper está agora:
- ✅ Rodando na nuvem 24/7
- ✅ Executando automaticamente 3x por dia
- ✅ Salvando dados no Google Sheets
- ✅ Monitorado e com alertas
- ✅ Escalável e mantível

Para suporte, consulte:
- Logs do EasyPanel
- Documentação da API no README.md
- Issues no GitHub