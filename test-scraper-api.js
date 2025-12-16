/**
 * Teste DIRETO da API do Scraper
 * Execute: node test-scraper-api.js
 */

const https = require('https');

const testData = {
  dados_pessoais: {
    nome: "Joao Teste Direto",
    data_nascimento: "15/03/1990",
    genero: "M"
  },
  contato: {
    celular: "(11) 99999-8888",
    email: "joao.teste.direto@email.com"
  },
  endereco: {
    cep: "01310-100",
    estado: "SP",
    cidade: "Sao Paulo",
    logradouro: "Av Paulista",
    numero: "1000",
    bairro: "Bela Vista"
  },
  perfil_educacional: [{
    formacao: "Ensino Medio",
    instituicao: "Escola Teste",
    data_inicio: "01/02/2005",
    data_conclusao: "15/12/2007",
    turno: "Manha",
    situacao: "c"
  }],
  perfil_profissional: {
    cargo_pretendido: "Auxiliar",
    salario_pretendido: 2500,
    area_interesse: "Administra",
    nivel: "Auxiliar"
  },
  experiencias: [{
    empresa: "Empresa Teste LTDA",
    segmento: "Tecno",
    porte: "medio",
    cargo: "Auxiliar Administrativo",
    ultimo_salario: 2000,
    emprego_atual: false,
    atividades: "Suporte administrativo"
  }]
};

console.log('='.repeat(60));
console.log('🧪 TESTE DIRETO DA API DO SCRAPER');
console.log('='.repeat(60));
console.log('\nURL: https://scrapers-scraper-selecty.pjlnku.easypanel.host/api/curriculum/create');
console.log('\n📋 Dados enviados:');
console.log(JSON.stringify(testData, null, 2));

const data = JSON.stringify(testData);

const options = {
  hostname: 'scrapers-scraper-selecty.pjlnku.easypanel.host',
  port: 443,
  path: '/api/curriculum/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('\n⏳ Enviando request para API do Scraper...\n');

const req = https.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('='.repeat(60));
    console.log('📊 RESPOSTA DA API:');
    console.log('='.repeat(60));
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    try {
      const json = JSON.parse(responseData);
      console.log('\nBody:');
      console.log(JSON.stringify(json, null, 2));
      
      if (json.success) {
        console.log('\n✅ SUCESSO!');
        console.log(`🔗 URL: ${json.url}`);
      } else {
        console.log('\n❌ ERRO:', json.error || json.message);
      }
    } catch (e) {
      console.log('\nResposta RAW:', responseData.substring(0, 500));
    }
    console.log('='.repeat(60));
  });
});

req.on('error', (e) => {
  console.error(`❌ Erro de conexão: ${e.message}`);
});

req.write(data);
req.end();
