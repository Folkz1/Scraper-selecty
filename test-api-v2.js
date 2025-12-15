/**
 * Teste do CurriculumApiClientV2
 * Cria um currículo completo usando o novo cliente melhorado
 */

require('dotenv').config();
const CurriculumApiClientV2 = require('./scraper/curriculum/CurriculumApiClientV2');

// Gerar dados únicos
const timestamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '');

// Gerar CPF válido (algoritmo correto)
function generateValidCPF() {
  const random = () => Math.floor(Math.random() * 9);
  const n = Array(9).fill(0).map(() => random());
  
  // Calcular primeiro dígito verificador
  let d1 = n.reduce((sum, num, i) => sum + num * (10 - i), 0) % 11;
  d1 = d1 < 2 ? 0 : 11 - d1;
  n.push(d1);
  
  // Calcular segundo dígito verificador
  let d2 = n.reduce((sum, num, i) => sum + num * (11 - i), 0) % 11;
  d2 = d2 < 2 ? 0 : 11 - d2;
  n.push(d2);
  
  return `${n.slice(0,3).join('')}.${n.slice(3,6).join('')}.${n.slice(6,9).join('')}-${n.slice(9).join('')}`;
}

const testCPF = generateValidCPF();
console.log(`📋 CPF gerado: ${testCPF}`);

// Dados do currículo COMPLETO para teste
const curriculumData = {
  // ─── DADOS PESSOAIS ───
  nome: `TESTE API V2 ${timestamp}`,
  cpf: testCPF,
  email: `teste.v2.${timestamp}@email.com`,
  dataNascimento: '15/05/1990',
  genero: 'homem',
  estadoCivil: 's', // solteiro
  
  // ─── CONTATO ───
  telefoneFixo: '4733333333',
  celular: '47999999999',
  emailSecundario: '',
  
  // ─── ENDEREÇO ───
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
    areasInteresse: ['Administração de Empresas', 'Comércio Varejista'],
    niveisInteresse: ['Operacional', 'Auxiliar']
  },
  
  // ─── EXPERIÊNCIAS ───
  experiencias: [
    {
      empresa: 'Supermercado Exemplo LTDA',
      cargo: 'Operador de Caixa',
      dataInicio: '01/03/2020',
      dataFim: '15/11/2023',
      atual: false,
      descricao: 'Atendimento ao cliente, operação de caixa, fechamento de vendas.',
      area: 'Comércio Varejista',
      porte: 'Empresa de médio porte',
      salario: 2200
    }
  ],
  
  // ─── FORMAÇÃO ───
  formacao: [
    {
      nivelId: 2,
      nivel: 'Ensino Médio',
      instituicao: 'Colégio Estadual',
      curso: 'Ensino Médio Regular',
      dataInicio: '02/2005',
      dataFim: '12/2007',
      status: 'complete',
      turno: 'Manhã'
    }
  ],
  
  // ─── OBSERVAÇÕES ───
  observacoes: 'Currículo criado via API V2 automatizada - ' + new Date().toISOString()
};

async function testApiV2Creation() {
  console.log('═'.repeat(60));
  console.log('🧪 TESTE - CurriculumApiClientV2');
  console.log('═'.repeat(60));
  console.log(`\n📋 Dados do currículo:`);
  console.log(`   Nome: ${curriculumData.nome}`);
  console.log(`   CPF: ${curriculumData.cpf}`);
  console.log(`   E-mail: ${curriculumData.email}`);
  console.log(`   Telefone: ${curriculumData.celular}`);
  console.log(`   Endereço: ${curriculumData.endereco.rua}, ${curriculumData.endereco.numero} - ${curriculumData.endereco.cidade}/${curriculumData.endereco.estado}`);
  console.log(`   Pretensão Salarial: R$ ${curriculumData.perfilProfissional.salarioPretendido}`);
  console.log('═'.repeat(60));
  
  const config = {
    email: process.env.SELECTY_EMAIL,
    password: process.env.SELECTY_PASSWORD
  };
  
  if (!config.email || !config.password) {
    console.error('❌ Credenciais não encontradas no .env');
    process.exit(1);
  }
  
  const client = new CurriculumApiClientV2(config);
  
  try {
    // Inicializar e autenticar
    await client.init();
    await client.authenticate();
    
    // Criar currículo
    const result = await client.createCurriculum(curriculumData);
    
    console.log('\n' + '═'.repeat(60));
    if (result.success) {
      console.log('✅ CURRÍCULO CRIADO COM SUCESSO!');
      console.log(`   Person ID: ${result.personId}`);
      console.log(`   Método: ${result.method || 'api'}`);
      console.log(`   URL: https://selecty.app/curriculum/complete/${result.personId}`);
    } else {
      console.log('❌ FALHA NA CRIAÇÃO');
      console.log('   Erro:', JSON.stringify(result.error, null, 2));
    }
    console.log('═'.repeat(60));
    
    // Manter browser aberto por 10s para verificação visual
    console.log('\n⏳ Mantendo browser aberto por 10s para verificação...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    await client.close();
    return result;
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error.stack);
    await client.close();
    process.exit(1);
  }
}

testApiV2Creation().then(result => {
  process.exit(result?.success ? 0 : 1);
});
