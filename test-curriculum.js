/**
 * Script de teste para criação de currículo
 * Testa o novo endpoint POST /api/curriculum
 */

require('dotenv').config();

const SelectyScraper = require('./scraper/selecty-scraper');
const CurriculumCreator = require('./scraper/curriculum/CurriculumCreator');
const SelectyAuthenticator = require('./scraper/auth/SelectyAuthenticator');

// Gerar nome único com timestamp para garantir que é um cadastro novo
const timestamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '');
// CPF de teste válido (diferente do usado no replay manual)
const testCPF = '987.654.321-00';

// Dados de teste para o currículo
const curriculumTestData = {
  // Dados pessoais (obrigatórios) - COM TIMESTAMP PARA IDENTIFICAR CRIAÇÃO NOVA
  nome: `TESTE SCRAPER ${timestamp}`,
  cpf: testCPF,
  email: `teste.${timestamp}@email.com`,
  
  // Dados pessoais (opcionais)
  dataNascimento: '15/05/1990',
  genero: 'homem',
  
  // Contato (opcionais)
  celular: '47999999999',
  telefoneFixo: '4733333333',
  emailSecundario: 'joao.secundario@email.com',
  
  // Endereço (opcionais)
  cep: '89201100',
  rua: 'Rua das Palmeiras',
  numero: '123',
  bairro: 'Centro',
  estado: 'SC',
  cidade: 'Joinville',
  
  // Perfil Profissional
  perfilProfissional: {
    cargoPretendido: 'Operador de Caixa',
    salarioPretendido: '2500',
    areasInteresse: ['Administrativo', 'Vendas'],
    niveisInteresse: ['Operacional']
  },
  
  // Perfil Educacional
  perfilEducacional: {
    formacaoAcademica: 'Ensino Médio',
    instituicao: 'Colégio Estadual',
    curso: 'Ensino Médio Regular',
    dataInicio: '01/02/2005',
    dataConclusao: '15/12/2007',
    turno: 'Manhã',
    statusFormacao: 'concluido'
  },
  
  // Tipo de currículo (completo ou express)
  tipo: 'completo',
  
  // Referências (opcional)
  referencias: 'Referência de teste - João trabalhou conosco por 2 anos.'
};

async function runTest() {
  console.log('═'.repeat(50));
  console.log('🧪 TESTE DE CRIAÇÃO DE CURRÍCULO');
  console.log('═'.repeat(50));
  console.log('\n📋 Dados do currículo de teste:');
  console.log(`   Nome: ${curriculumTestData.nome}`);
  console.log(`   CPF: ${curriculumTestData.cpf}`);
  console.log(`   E-mail: ${curriculumTestData.email}`);
  console.log('═'.repeat(50));
  
  const scraper = new SelectyScraper();
  
  try {
    // Inicializar
    console.log('\n🚀 Inicializando scraper...');
    await scraper.initialize();
    
    const configData = scraper.config.getConfig();
    
    // Autenticar
    console.log('\n🔐 Autenticando...');
    const authenticator = new SelectyAuthenticator(scraper.config);
    await authenticator.login(scraper.page, configData.selecty);
    await authenticator.validateLogin(scraper.page);
    console.log('✓ Autenticação bem-sucedida');
    
    // Criar currículo
    console.log('\n📝 Criando currículo...');
    const creator = new CurriculumCreator(scraper.config);
    const result = await creator.createCurriculum(scraper.page, curriculumTestData);
    
    // Cleanup
    await scraper.cleanup();
    
    console.log('\n' + '═'.repeat(50));
    if (result.success) {
      console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
    } else {
      console.log('❌ TESTE FALHOU!');
    }
    console.log('═'.repeat(50));
    console.log(`\n📊 Resultado: ${result.message}`);
    
    process.exit(result.success ? 0 : 1);
    
  } catch (error) {
    await scraper.cleanup();
    console.error('\n' + '═'.repeat(50));
    console.error('❌ ERRO NO TESTE:', error.message);
    console.error('═'.repeat(50));
    console.error(error.stack);
    process.exit(1);
  }
}

runTest();
