# 📋 Documentação - API de Criação de Currículos

## 🌐 Endpoints Disponíveis

### 1. Health Check

```
GET https://scrapers-scraper-selecty.pjlnku.easypanel.host/api/health
```

### 2. Criar Currículo (Direto)

```
POST https://scrapers-scraper-selecty.pjlnku.easypanel.host/api/curriculum
```

### 3. Webhook n8n (Recomendado)

```
POST https://seu-n8n.com/webhook/curriculum-create
```

---

## 📦 Formato do Payload

### Formato Estruturado (Recomendado)

```json
{
  "dados_pessoais": {
    "nome": "João da Silva",
    "cpf": "12345678901",
    "data_nascimento": "15/03/1990",
    "genero": "M"
  },
  "contato": {
    "telefone_fixo": "(11) 3456-7890",
    "celular": "(11) 99999-8888",
    "email": "joao@email.com"
  },
  "endereco": {
    "cep": "01310-100",
    "logradouro": "Av Paulista",
    "numero": "1000",
    "complemento": "Sala 123",
    "bairro": "Bela Vista",
    "estado": "SP",
    "cidade": "Sao Paulo"
  },
  "perfil_educacional": [
    {
      "formacao": "Graduação",
      "instituicao": "Universidade de São Paulo",
      "data_inicio": "01/02/2013",
      "data_conclusao": "15/12/2016",
      "turno": "Noite",
      "situacao": "c"
    }
  ],
  "perfil_profissional": {
    "cargo_pretendido": "Analista",
    "salario_pretendido": 5500,
    "area_interesse": "Administra",
    "nivel": "Analista"
  },
  "experiencias": [
    {
      "empresa": "Tech Solutions Brasil LTDA",
      "segmento": "Tecno",
      "porte": "medio",
      "cargo": "Analista Administrativo",
      "ultimo_salario": 4500,
      "emprego_atual": true,
      "atividades": "Gestão de processos administrativos, controle de documentos."
    }
  ]
}
```

---

## 📝 Campos Detalhados

### 1. Dados Pessoais (OBRIGATÓRIO)

| Campo             | Tipo   | Obrigatório | Formato                        | Exemplo         |
| ----------------- | ------ | ----------- | ------------------------------ | --------------- |
| `nome`            | string | ✅ SIM      | Mínimo 3 caracteres            | "João da Silva" |
| `cpf`             | string | ✅ SIM      | 11 dígitos (sem pontos/traços) | "12345678901"   |
| `data_nascimento` | string | ❌ Não      | DD/MM/YYYY                     | "15/03/1990"    |
| `genero`          | string | ❌ Não      | "M", "F" ou "u"                | "M"             |

**Gênero:**

- `M` = Masculino
- `F` = Feminino
- `u` = Não informar

---

### 2. Contato (OBRIGATÓRIO)

| Campo           | Tipo   | Obrigatório | Formato         | Exemplo           |
| --------------- | ------ | ----------- | --------------- | ----------------- |
| `celular`       | string | ✅ SIM      | (XX) XXXXX-XXXX | "(11) 99999-8888" |
| `email`         | string | ✅ SIM      | Email válido    | "joao@email.com"  |
| `telefone_fixo` | string | ❌ Não      | (XX) XXXX-XXXX  | "(11) 3456-7890"  |

---

### 3. Endereço

| Campo         | Tipo   | Obrigatório | Formato               | Exemplo       |
| ------------- | ------ | ----------- | --------------------- | ------------- |
| `cep`         | string | ❌ Não      | XXXXX-XXX ou XXXXXXXX | "01310-100"   |
| `logradouro`  | string | ❌ Não      | Texto livre           | "Av Paulista" |
| `numero`      | string | ❌ Não      | Texto/número          | "1000"        |
| `complemento` | string | ❌ Não      | Texto livre           | "Sala 123"    |
| `bairro`      | string | ❌ Não      | Texto livre           | "Bela Vista"  |
| `estado`      | string | ❌ Não      | **SIGLA** (2 letras)  | "SP"          |
| `cidade`      | string | ❌ Não      | Nome da cidade        | "Sao Paulo"   |

⚠️ **IMPORTANTE: Estado deve ser a SIGLA (SP, RJ, MG, etc)**

**Estados válidos:**

```
AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO
```

---

### 4. Perfil Educacional (Array)

| Campo            | Tipo   | Obrigatório | Valores Aceitos                       |
| ---------------- | ------ | ----------- | ------------------------------------- |
| `formacao`       | string | ✅ SIM      | Ver lista abaixo                      |
| `instituicao`    | string | ❌ Não      | Texto livre                           |
| `data_inicio`    | string | ❌ Não      | DD/MM/YYYY                            |
| `data_conclusao` | string | ❌ Não      | DD/MM/YYYY                            |
| `turno`          | string | ❌ Não      | "Manhã", "Tarde", "Noite", "Integral" |
| `situacao`       | string | ❌ Não      | "c", "s", "p"                         |

**Formação (valores exatos):**

```
- Ensino Fundamental
- Ensino Médio
- Técnico/Profissionalizante
- Graduação
- Licenciatura
- Pós-Graduação
- Pós-Graduação - MBA
- Mestrado
- Doutorado
- Pós-Doutorado
- Não alfabetizado
```

**Situação:**

- `c` = Concluído
- `s` = Cursando
- `p` = Suspenso/Trancado

---

### 5. Perfil Profissional

| Campo                | Tipo    | Obrigatório | Descrição                         |
| -------------------- | ------- | ----------- | --------------------------------- |
| `cargo_pretendido`   | string  | ❌ Não      | Texto de busca (ex: "Analista")   |
| `salario_pretendido` | integer | ❌ Não      | Valor em reais (ex: 5500)         |
| `area_interesse`     | string  | ❌ Não      | Texto de busca (ex: "Administra") |
| `nivel`              | string  | ❌ Não      | Ver lista abaixo                  |

**Níveis:** Jovem Aprendiz, Estagiário, Operacional, Auxiliar, Assistente, Técnico, Trainee, Especialista, Analista, Coordenador, Supervisor, Gerência, Diretoria, Presidência/C-Level

---

### 6. Experiências (Array)

| Campo            | Tipo    | Obrigatório | Descrição                                  |
| ---------------- | ------- | ----------- | ------------------------------------------ |
| `empresa`        | string  | ✅ SIM      | Nome da empresa                            |
| `segmento`       | string  | ❌ Não      | Texto de busca (ex: "Tecno")               |
| `porte`          | string  | ❌ Não      | "pequeno", "medio", "grande"               |
| `cargo`          | string  | ❌ Não      | Texto de busca ou novo cargo               |
| `ultimo_salario` | integer | ❌ Não      | Valor em reais                             |
| `emprego_atual`  | boolean | ❌ Não      | true/false                                 |
| `atividades`     | string  | ❌ Não      | Descrição das atividades (máx. 2000 chars) |

---

## 🚀 Exemplos de Uso

### cURL - Payload Completo

```bash
curl -X POST https://scrapers-scraper-selecty.pjlnku.easypanel.host/api/curriculum \
  -H "Content-Type: application/json" \
  -H "Authorization: scraper-secret-key-2024" \
  -d '{
    "dados_pessoais": {
      "nome": "Maria Santos",
      "cpf": "98765432100",
      "data_nascimento": "20/05/1985",
      "genero": "F"
    },
    "contato": {
      "celular": "(11) 98765-4321",
      "email": "maria@email.com"
    },
    "endereco": {
      "cep": "04567-000",
      "estado": "SP",
      "cidade": "Sao Paulo",
      "logradouro": "Rua das Flores",
      "numero": "100",
      "bairro": "Jardim Paulista"
    },
    "perfil_educacional": [
      {
        "formacao": "Pós-Graduação",
        "instituicao": "FGV",
        "situacao": "c"
      }
    ],
    "perfil_profissional": {
      "cargo_pretendido": "Gerente",
      "salario_pretendido": 12000,
      "nivel": "Gerência"
    }
  }'
```

### cURL - Payload Mínimo

```bash
curl -X POST https://scrapers-scraper-selecty.pjlnku.easypanel.host/api/curriculum \
  -H "Content-Type: application/json" \
  -H "Authorization: scraper-secret-key-2024" \
  -d '{
    "dados_pessoais": {
      "nome": "Teste Minimo",
      "cpf": "12345678901"
    },
    "contato": {
      "celular": "(11) 99999-9999",
      "email": "teste@email.com"
    }
  }'
```

---

## ✅ Resposta de Sucesso

```json
{
  "success": true,
  "timestamp": "2024-12-16T18:30:00.000Z",
  "executionTime": "45s",
  "message": "Currículo criado com sucesso",
  "url": "https://selecty.app/curriculum/edit/12345",
  "curriculum": {
    "nome": "João da Silva",
    "cpf": "123*****01",
    "email": "joao@email.com"
  }
}
```

## ❌ Resposta de Erro

```json
{
  "success": false,
  "timestamp": "2024-12-16T18:30:00.000Z",
  "error": "Missing required fields: cpf",
  "curriculum": null
}
```

---

## ⚠️ Erros Comuns

| Erro                                      | Causa                           | Solução                                  |
| ----------------------------------------- | ------------------------------- | ---------------------------------------- |
| `Missing required fields: nome`           | Nome não enviado                | Incluir campo `nome` no `dados_pessoais` |
| `Missing required fields: cpf`            | CPF não enviado                 | Incluir campo `cpf` com 11 dígitos       |
| `Missing required fields: email`          | Email não enviado               | Incluir campo `email` no `contato`       |
| `Invalid CPF format`                      | CPF com formato errado          | Enviar apenas 11 dígitos: "12345678901"  |
| `Invalid email format`                    | Email inválido                  | Verificar formato do email               |
| `Curriculum creation already in progress` | Já tem uma criação em andamento | Aguardar terminar ou usar fila           |

---

## 🔒 Autenticação

A API requer header de autenticação:

```
Authorization: scraper-secret-key-2024
```

---

## 📊 Timeout

- **Tempo máximo de execução:** 5 minutos (300000ms)
- O processo é automatizado e pode demorar ~60 segundos em média

---

## 🔄 Workflow n8n

O workflow `curriculum-automation-webhook.json` faz:

1. **Webhook Trigger** - Recebe o POST
2. **Transform Data** - Converte formato se necessário
3. **Execute Scraper** - Chama a API
4. **Check Result** - Verifica sucesso
5. **Response** - Retorna resultado

---

## 📞 Suporte

Em caso de problemas, verifique:

1. ✅ Todos os campos obrigatórios estão presentes
2. ✅ CPF tem 11 dígitos numéricos
3. ✅ Estado está em formato SIGLA (SP, RJ, etc)
4. ✅ Header de autenticação está correto
5. ✅ Formação usa valores exatos do dropdown
