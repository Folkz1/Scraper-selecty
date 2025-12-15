/**
 * Teste SIMPLES de criação de currículo via API REST
 * Apenas campos obrigatórios mínimos
 */

require('dotenv').config();
const CurriculumApiClient = require('./scraper/curriculum/CurriculumApiClient');

// Gerar dados únicos
const timestamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '');

// CPF fornecido pelo usuário
const testCPF = '681.476.710-40';

// Dados de teste MÍNIMOS (sem experiência e formação)
const curriculumData = {
  // ─── DADOS PESSOAIS ───
  nome: `TESTE SIMPLES ${timestamp}`,
  cpf: testCPF,
  email: `teste.simples.${timestamp}@email.com`,
  dataNascimento: '15/05/1990',
  genero: 'homem',
  
  // ─── CONTATO ───
  celular: '47999999999',
  
  // ─── ENDEREÇO ───
  endereco: {
    cep: '89201-100',
    rua: 'Rua das Palmeiras',
    numero: '123',
    bairro: 'Centro',
    estado: 'SC',
    cidade: 'Joinville'
  },
  
  // ─── PERFIL PROFISSIONAL ───
  perfilProfissional: {
    cargoPretendido: 'Operador de Caixa',
    salarioPretendido: '2500',
    areasInteresse: ['Administrativo'],
    niveisInteresse: ['Operacional']
  },
  
  // Arrays vazios para experiência e formação
  experiencias: [],
  formacao: [],
  idiomas: []
};

async function testSimple() {
  console.log('═'.repeat(60));
  console.log('🧪 TESTE SIMPLES VIA API (SEM EXPERIÊNCIA/FORMAÇÃO)');
  console.log('═'.repeat(60));
  console.log('\n📋 Dados:');
  console.log(`   Nome: ${curriculumData.nome}`);
  console.log(`   CPF: ${curriculumData.cpf}`);
  console.log('═'.repeat(60));
  
  const config = {
    selecty: {
      email: process.env.SELECTY_EMAIL,
      password: process.env.SELECTY_PASSWORD
    }
  };
  
  const client = new CurriculumApiClient(config);
  
  try {
    const result = await client.createCurriculum(curriculumData);
    
    console.log('\n' + '═'.repeat(60));
    if (result.success) {
      console.log('✅ CURRÍCULO CRIADO COM SUCESSO!');
      console.log(`   Person ID: ${result.personId}`);
    } else {
      console.log('❌ FALHA NA CRIAÇÃO');
      console.log('   Erro:', JSON.stringify(result.error, null, 2));
    }
    console.log('═'.repeat(60));
    
    return result;
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    process.exit(1);
  }
}

testSimple().then(result => {
  process.exit(result.success ? 0 : 1);
});
