# Selecty Curriculum API - Documentação para IA

## 🎯 Visão Geral

Esta API permite que uma IA crie currículos automaticamente no Selecty, enviando dados dinâmicos do candidato enquanto respeita os valores fixos do formulário.

---

## 🚀 Quick Start

### 1. Iniciar o Servidor

```bash
node api-server.js
```

### 2. Consultar Opções de Campo

```bash
curl http://localhost:3001/api/curriculum/options/nivel
curl http://localhost:3001/api/curriculum/options/porte
curl http://localhost:3001/api/curriculum/options/area_interesse
```

### 3. Criar Currículo

```bash
curl -X POST http://localhost:3001/api/curriculum/create \
  -H "Content-Type: application/json" \
  -d '{"dados_pessoais":{"nome":"João Silva"},"contato":{"email":"joao@email.com","celular":"(11) 99999-8888"}}'
```

---

## 📊 Endpoints

| Método | Endpoint                         | Descrição                        |
| ------ | -------------------------------- | -------------------------------- |
| GET    | `/api/health`                    | Health check                     |
| GET    | `/api/curriculum/schema`         | Schema completo JSON             |
| GET    | `/api/curriculum/options/:field` | Valores permitidos para um campo |
| POST   | `/api/curriculum/create`         | Criar currículo                  |

---

## 📋 Campos e Valores Permitidos

### Nível Profissional (`nivel`)

```
Jovem Aprendiz, Estagiário, Operacional, Auxiliar, Assistente,
Técnico, Trainee, Especialista, Analista, Coordenador,
Supervisor, Gerência, Diretoria, Presidência/C-Level
```

### Porte da Empresa (`porte`)

```
Atividade autônoma, Empresa de grande porte, Empresa de médio porte,
Empresa de pequeno porte, Micro-empresa
```

### Gênero (`genero`)

```
F (Feminino), M (Masculino), u (Não informar)
```

### Estados (`estados`)

Todos os 27 estados brasileiros

### Áreas de Interesse e Segmentos

Consultar via API: `GET /api/curriculum/options/area_interesse`

---

## 📥 Exemplo de Request Completo

```json
{
  "dados_pessoais": {
    "nome": "Maria Silva Santos",
    "cpf": null,
    "data_nascimento": "15/03/1992",
    "genero": "F"
  },
  "contato": {
    "telefone_fixo": "(11) 3333-4444",
    "celular": "(11) 99999-8888",
    "email": "maria.silva@email.com"
  },
  "endereco": {
    "cep": "01310-100",
    "logradouro": "Av Paulista",
    "numero": "1000",
    "bairro": "Bela Vista",
    "estado": "Sao Paulo",
    "cidade": "Sao Paulo"
  },
  "perfil_profissional": {
    "cargo_pretendido": "Auxiliar",
    "salario_pretendido": 3500,
    "area_interesse": "Administra",
    "nivel": "Auxiliar"
  },
  "experiencias": [
    {
      "empresa": "Empresa ABC LTDA",
      "segmento": "Tecno",
      "porte": "medio",
      "cargo": "Auxiliar Administrativo",
      "ultimo_salario": 2500,
      "emprego_atual": true,
      "atividades": "Suporte administrativo e atendimento ao cliente"
    }
  ]
}
```

---

## 📤 Resposta de Sucesso

```json
{
  "success": true,
  "message": "Currículo criado com sucesso",
  "url": "https://selecty.app/curriculum/complete/8699",
  "logs": [...]
}
```

---

## ⚠️ Regras de Validação

| Campo      | Regra                                       |
| ---------- | ------------------------------------------- |
| `nome`     | Obrigatório, mín. 3 caracteres              |
| `cpf`      | 11 dígitos ou `null` (gera automaticamente) |
| `email`    | Obrigatório, formato válido                 |
| `celular`  | Obrigatório                                 |
| `salarios` | Número inteiro (sem decimais)               |
| `empresa`  | Obrigatório em experiências                 |

---

## 🔍 Dicas para IA

1. **Campos de busca**: Use texto parcial

   - `"Tecno"` encontra "Tecnologia e Informática"
   - `"Administra"` encontra "Administração de Empresas"

2. **CPF**: Envie `null` para gerar automaticamente

3. **Salários**: Sempre inteiros (ex: `3500`, não `3500.00`)

4. **Cargo não encontrado**: A automação cria "Novo Cargo" automaticamente

5. **Estados**: Usar nome completo sem acentos (ex: "Sao Paulo")

---

## 🔗 Integração n8n

Crie um node HTTP Request apontando para:

- **URL**: `http://localhost:3001/api/curriculum/create`
- **Method**: POST
- **Body Type**: JSON
- **JSON Body**: Dados do candidato conforme schema
