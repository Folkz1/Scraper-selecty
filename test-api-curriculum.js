/**
 * Teste de criação de currículo via API REST
 * Inclui todos os campos essenciais: Nome, Telefone, Endereço, 
 * Pretensão Salarial, Experiências e Escolaridade
 */

require('dotenv').config();
const CurriculumApiClient = require('./scraper/curriculum/CurriculumApiClient');

// Gerar dados únicos
const timestamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '');

// CPF válido para teste (gerado por algoritmo válido)
const testCPF = '529.982.247-25';

// Dados de teste COMPLETOS
const curriculumData = {
  // ─── DADOS PESSOAIS ───
  nome: `TESTE API COMPLETO ${timestamp}`,
  cpf: testCPF,
  email: `teste.api.${timestamp}@email.com`,
  dataNascimento: '15/05/1990',
  genero: 'homem',
  
  // ─── CONTATO ───
  telefoneFixo: '(47) 3333-3333',
  celular: '(47) 99999-9999',
  emailSecundario: 'secundario@email.com',
  
  // ─── ENDEREÇO COMPLETO ───
  endereco: {
    cep: '89201-100',
    rua: 'Rua das Palmeiras',
    numero: '123',
    complemento: 'Apto 301',
    bairro: 'Centro',
    estado: 'SC',
    cidade: 'Joinville'
  },
  
  // ─── PERFIL PROFISSIONAL ───
  perfilProfissional: {
    cargoPretendido: 'Operador de Caixa',
    salarioPretendido: '3500',
    areasInteresse: ['Administrativo', 'Vendas', 'Atendimento'],
    niveisInteresse: ['Operacional', 'Auxiliar']
  },
  
  // ─── EXPERIÊNCIAS PROFISSIONAIS ───
  experiencias: [
    {
      company_name: 'Supermercado Exemplo LTDA',
      occupation_id: '',  // Será preenchido pelo sistema se vazio
      name: 'Operador de Caixa',
      start: '01/03/2020',
      finish: '15/11/2023',
      current: 'no',
      description: 'Atendimento ao cliente, operação de caixa, fechamento de vendas, conferência de valores e sangrias.',
      period: '01/03/2020 à 15/11/2023',
      acting_area: 'Comércio Varejista',
      company_size: 'Empresa de médio porte',
      last_salary: 2200,
      tempo: 3,
      tempo_medida: 'years'
    },
    {
      company_name: 'Loja de Roupas Fashion',
      occupation_id: '',
      name: 'Vendedor',
      start: '10/01/2018',
      finish: '28/02/2020',
      current: 'no',
      description: 'Vendas no varejo, atendimento ao cliente, organização de vitrine e controle de estoque.',
      period: '10/01/2018 à 28/02/2020',
      acting_area: 'Comércio Varejista',
      company_size: 'Empresa de pequeno porte',
      last_salary: 1800,
      tempo: 2,
      tempo_medida: 'years'
    }
  ],
  
  // ─── ESCOLARIDADE / FORMAÇÃO ───
  formacao: [
    {
      education_level_id: 6, // Ensino Médio
      education_level_name: 'Ensino Médio',
      institute: 'Colégio Estadual do Paraná',
      course: 'Ensino Médio Regular',
      start: '02/2005',
      finish: '12/2007',
      status: 'complete', // complete, incomplete, in_progress
      period: 'Manhã'
    },
    {
      education_level_id: 8, // Curso Técnico
      education_level_name: 'Curso Técnico',
      institute: 'SENAC',
      course: 'Técnico em Administração',
      start: '03/2008',
      finish: '11/2009',
      status: 'complete',
      period: 'Noite'
    }
  ],
  
  // ─── IDIOMAS ───
  idiomas: [
    {
      language_id: 1,
      language_name: 'Inglês',
      reading: 'Intermediário',
      writing: 'Básico',
      speaking: 'Básico',
      comprehension: 'Intermediário'
    }
  ],
  
  // ─── OBSERVAÇÕES ───
  referencias: 'Candidato proativo e com boa experiência em atendimento ao público. Criado via API automatizada.'
};

async function testApiCreation() {
  console.log('═'.repeat(60));
  console.log('🧪 TESTE DE CRIAÇÃO VIA API - COMPLETO');
  console.log('═'.repeat(60));
  console.log('\n📋 Dados do currículo:');
  console.log(`   Nome: ${curriculumData.nome}`);
  console.log(`   CPF: ${curriculumData.cpf}`);
  console.log(`   E-mail: ${curriculumData.email}`);
  console.log(`   Telefone: ${curriculumData.celular}`);
  console.log(`   Endereço: ${curriculumData.endereco.rua}, ${curriculumData.endereco.numero} - ${curriculumData.endereco.cidade}/${curriculumData.endereco.estado}`);
  console.log(`   Pretensão Salarial: R$ ${curriculumData.perfilProfissional.salarioPretendido}`);
  console.log(`   Experiências: ${curriculumData.experiencias.length} empresa(s)`);
  console.log(`   Formação: ${curriculumData.formacao.length} curso(s)`);
  console.log('═'.repeat(60));
  
  const config = {
    selecty: {
      email: process.env.SELECTY_EMAIL,
      password: process.env.SELECTY_PASSWORD
    }
  };
  
  const client = new CurriculumApiClient(config);
  
  try {
    // Criar currículo via API
    const result = await client.createCurriculum(curriculumData);
    
    console.log('\n' + '═'.repeat(60));
    if (result.success) {
      console.log('✅ CURRÍCULO CRIADO COM SUCESSO!');
      console.log(`   Person ID: ${result.personId}`);
      console.log(`   URL: https://selecty.app/curriculum/complete/${result.personId}`);
    } else {
      console.log('❌ FALHA NA CRIAÇÃO');
      console.log('   Erro:', JSON.stringify(result.error, null, 2));
    }
    console.log('═'.repeat(60));
    
    return result;
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testApiCreation().then(result => {
  process.exit(result.success ? 0 : 1);
});
