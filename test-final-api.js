/**
 * Teste FINAL COMPLETO de criação de currículo via API REST
 * Gera CPF único com timestamp para evitar duplicatas
 */

require('dotenv').config();
const CurriculumApiClient = require('./scraper/curriculum/CurriculumApiClient');

// Gerar dados únicos
const timestamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '');

// Gerar CPF único baseado no timestamp (apenas para teste, não é um CPF válido)
// Para produção, devemos ter CPFs reais
const timestampNum = Date.now().toString().slice(-9);
const testCPF = `${timestampNum.slice(0,3)}.${timestampNum.slice(3,6)}.${timestampNum.slice(6,9)}-00`;

console.log('🔑 CPF Gerado:', testCPF);

// Dados de teste COMPLETOS com experiência e formação
const curriculumData = {
  // ─── DADOS PESSOAIS ───
  nome: `TESTE FINAL ${timestamp}`,
  cpf: testCPF,
  email: `teste.final.${timestamp}@email.com`,
  dataNascimento: '15/05/1990',
  genero: 'homem',
  
  // ─── CONTATO ───
  celular: '47999999999',
  telefoneFixo: '4733333333',
  
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
    salarioPretendido: '3500',
    areasInteresse: ['Administrativo', 'Vendas'],
    niveisInteresse: ['Operacional', 'Auxiliar']
  },
  
  // ─── EXPERIÊNCIAS PROFISSIONAIS ───
  experiencias: [
    {
      company_name: 'Supermercado Exemplo LTDA',
      occupation_id: '41211',
      name: 'Abastecedor',
      start: '01/03/2020',
      finish: '15/11/2023',
      current: 'no',
      description: 'Atendimento ao cliente, operação de caixa, fechamento de vendas.',
      period: '01/03/2020 à 15/11/2023',
      acting_area: 'Comércio Varejista',
      company_size: 'Empresa de médio porte',
      last_salary: 2200,
      tempo: 3,
      tempo_medida: 'years'
    }
  ],
  
  // ─── ESCOLARIDADE/FORMAÇÃO ───
  formacao: [
    {
      education_level_id: 2,
      education_level_name: 'Ensino Médio',
      institute: 'Colégio Estadual',
      course: 'Ensino Médio Regular',
      start: '02/2005',
      finish: '12/2007',
      status: 'complete',
      period: 'Manhã'
    }
  ],
  
  idiomas: [],
  referencias: 'Currículo criado via API automatizada.'
};

async function testFinal() {
  console.log('\n' + '═'.repeat(60));
  console.log('🧪 TESTE FINAL VIA API');
  console.log('═'.repeat(60));
  console.log(`   Nome: ${curriculumData.nome}`);
  console.log(`   CPF: ${curriculumData.cpf}`);
  console.log(`   Experiências: ${curriculumData.experiencias.length}`);
  console.log(`   Formação: ${curriculumData.formacao.length}`);
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
      console.log(`   Message: ${result.message}`);
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

testFinal().then(result => {
  process.exit(result.success ? 0 : 1);
});
