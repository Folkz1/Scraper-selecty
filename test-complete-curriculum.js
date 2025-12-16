/**
 * Teste ULTRA COMPLETO de criação de currículo
 * Com CPF válido (calculado) e todos os campos possíveis
 */

const https = require('https');

// Gerar um CPF válido
function gerarCPFValido() {
  // Gerar 9 dígitos aleatórios
  const n = [];
  for (let i = 0; i < 9; i++) {
    n.push(Math.floor(Math.random() * 10));
  }
  
  // Calcular primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += n[i] * (10 - i);
  }
  let resto = soma % 11;
  n.push(resto < 2 ? 0 : 11 - resto);
  
  // Calcular segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += n[i] * (11 - i);
  }
  resto = soma % 11;
  n.push(resto < 2 ? 0 : 11 - resto);
  
  return n.join('');
}

const cpfValido = gerarCPFValido();
const timestamp = Date.now();

// Dados ULTRA completos para teste
const curriculumData = {
  // Dados Pessoais  
  nome: `Candidato Teste API ${timestamp}`,
  cpf: cpfValido,
  email: `candidato.teste.${timestamp}@gmail.com`,
  dataNascimento: "15/06/1990",
  genero: "M",
  
  // Contato
  celular: "(11) 99876-5432",
  telefoneFixo: "(11) 3456-7890",
  emailSecundario: `candidato.teste.secundario.${timestamp}@gmail.com`,
  
  // Endereço completo
  cep: "01310-100",
  rua: "Avenida Paulista",
  numero: "1578",
  bairro: "Bela Vista",
  estado: "São Paulo",
  cidade: "São Paulo",
  pais: "Brasil",
  
  // Referências
  referencias: "Disponível para início imediato. Referências profissionais disponíveis mediante solicitação."
};

console.log('='.repeat(70));
console.log('🧪 TESTE ULTRA COMPLETO DE CRIAÇÃO DE CURRÍCULO');
console.log('='.repeat(70));
console.log(`\n📋 CPF Válido Gerado: ${cpfValido}`);
console.log(`📋 Nome: ${curriculumData.nome}\n`);
console.log('Payload completo:');
console.log(JSON.stringify(curriculumData, null, 2));

const data = JSON.stringify(curriculumData);

const options = {
  hostname: 'scrapers-scraper-selecty.pjlnku.easypanel.host',
  port: 443,
  path: '/api/curriculum',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('\n⏳ Enviando para API... (pode demorar até 3 minutos)\n');
const startTime = Date.now();

const req = https.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log('='.repeat(70));
    console.log(`📊 RESPOSTA (${duration}s):`);
    console.log('='.repeat(70));
    console.log(`Status HTTP: ${res.statusCode}`);
    
    try {
      const json = JSON.parse(responseData);
      console.log(JSON.stringify(json, null, 2));
      
      if (json.success) {
        console.log('\n✅ SUCESSO! Currículo criado com sucesso!');
        console.log(`   Nome: ${json.curriculum?.nome}`);
        console.log(`   CPF: ${json.curriculum?.cpf}`);
      } else {
        console.log('\n❌ ERRO:', json.error || json.message);
      }
    } catch (e) {
      console.log('Resposta bruta:', responseData);
    }
    console.log('='.repeat(70));
  });
});

req.on('error', (e) => {
  console.error(`❌ Erro de conexão: ${e.message}`);
});

req.setTimeout(300000, () => {
  console.log('⏰ Timeout após 5 minutos');
  req.destroy();
});

req.write(data);
req.end();
