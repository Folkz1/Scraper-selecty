/**
 * Script de Teste da API de Currículo
 * Execute: node test-api.js
 */

const http = require('http');

// Dados COMPLETOS para teste - todos os campos obrigatórios preenchidos
const candidatoCompleto = {
  dados_pessoais: {
    nome: "João Carlos Silva Santos",
    cpf: null, // Será gerado automaticamente
    data_nascimento: "25/08/1990",
    genero: "M"
  },
  contato: {
    telefone_fixo: "(11) 3333-4444",
    celular: "(11) 99876-5432",
    email: "joao.carlos.teste@email.com"
  },
  endereco: {
    cep: "01310-100",
    logradouro: "Av Paulista",
    numero: "1500",
    complemento: "Sala 101",
    bairro: "Bela Vista",
    estado: "SP", // Usar SIGLA (SP, RJ, MG, etc)
    cidade: "Sao Paulo"
  },
  perfil_educacional: [
    {
      formacao: "Ensino Médio",
      instituicao: "Escola Estadual 31 de Janeiro",
      data_inicio: "01/02/2005",
      data_conclusao: "15/12/2007",
      turno: "Manhã",
      situacao: "c" // c=Concluído, s=Cursando, p=Suspenso
    }
  ],
  perfil_profissional: {
    cargo_pretendido: "Auxiliar Administrativo",
    salario_pretendido: 2500,
    area_interesse: "Administra",
    nivel: "Auxiliar"
  },
  experiencias: [
    {
      empresa: "Empresa Teste LTDA",
      segmento: "Tecnologia",
      porte: "medio",
      cargo: "Auxiliar Administrativo",
      ultimo_salario: 2000,
      emprego_atual: false,
      atividades: "Suporte administrativo, controle de documentos, atendimento ao cliente"
    }
  ]
};

console.log('='.repeat(60));
console.log('🧪 TESTE DA API DE CURRÍCULO SELECTY');
console.log('='.repeat(60));
console.log('\n📋 Enviando dados completos:\n');
console.log(JSON.stringify(candidatoCompleto, null, 2));

const data = JSON.stringify(candidatoCompleto);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/curriculum/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('\n⏳ Enviando request para API...\n');

const req = http.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('='.repeat(60));
    console.log('📊 RESPOSTA DA API:');
    console.log('='.repeat(60));
    console.log(`Status: ${res.statusCode}`);
    
    try {
      const json = JSON.parse(responseData);
      console.log(JSON.stringify(json, null, 2));
      
      if (json.success) {
        console.log('\n✅ SUCESSO! Currículo criado.');
        console.log(`🔗 URL: ${json.url}`);
      } else {
        console.log('\n❌ FALHOU');
        console.log(`❗ Erro: ${json.error}`);
      }
    } catch (e) {
      console.log('Resposta:', responseData);
    }
    console.log('='.repeat(60));
  });
});

req.on('error', (e) => {
  console.error(`❌ Erro de conexão: ${e.message}`);
  console.log('\n💡 Certifique-se de que o servidor está rodando:');
  console.log('   node api-server.js');
});

req.write(data);
req.end();