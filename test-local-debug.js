/**
 * ============================================================
 * TESTE LOCAL DEBUG ULTRA COMPLETO - CORRIGIDO
 * USANDO CurriculumAutomation.js (versão testada ontem)
 * ============================================================
 */

require('dotenv').config();
const CurriculumAutomation = require('./CurriculumAutomation');

const timestamp = Date.now();

// ============================================================
// DADOS CORRIGIDOS - USANDO VALORES EXATOS DO DROPDOWN
// ============================================================
const candidatoCompleto = {
  dados_pessoais: {
    nome: `Candidato Teste Completo ${timestamp}`,
    cpf: "03061524010", // CPF FORNECIDO PELO USUÁRIO
    data_nascimento: "15/03/1990",
    genero: "M"
  },
  
  contato: {
    telefone_fixo: "(11) 3456-7890",
    celular: "(11) 99876-5432",
    email: `candidato.completo.${timestamp}@gmail.com`
  },
  
  endereco: {
    cep: "01310-100",
    estado: "SP",
    cidade: "Sao Paulo",
    logradouro: "Av Paulista",
    numero: "1578",
    bairro: "Bela Vista"
  },
  
  // CORRIGIDO: Usar os valores EXATOS do dropdown
  // Ensino Fundamental, Ensino Médio, Técnico/Profissionalizante, Graduação, Licenciatura, Pós-Graduação
  perfil_educacional: [
    {
      formacao: "Graduação",  // CORRIGIDO! Era "Superior Completo"
      instituicao: "Universidade de São Paulo",
      data_inicio: "01/02/2013",
      data_conclusao: "15/12/2016",
      turno: "Noite",
      situacao: "c"
    }
  ],
  
  perfil_profissional: {
    cargo_pretendido: "Analista",
    salario_pretendido: 5500,
    area_interesse: "Administra",
    nivel: "Analista"
  },
  
  experiencias: [
    {
      empresa: "Tech Solutions Brasil LTDA",
      segmento: "Tecno",
      porte: "medio",
      cargo: "Analista Administrativo",
      ultimo_salario: 4500,
      emprego_atual: true,
      atividades: "Gestão de processos administrativos, controle de documentos, elaboração de relatórios gerenciais, suporte à diretoria."
    }
  ]
};

async function runTest() {
  console.log('='.repeat(80));
  console.log('🧪 TESTE LOCAL DEBUG - CORRIGIDO');
  console.log('='.repeat(80));
  
  console.log('\n📋 Dados do candidato (CORRIGIDOS):');
  console.log(`   CPF: ${candidatoCompleto.dados_pessoais.cpf}`);
  console.log(`   Formação: ${candidatoCompleto.perfil_educacional[0].formacao}`);
  console.log(JSON.stringify(candidatoCompleto, null, 2));
  
  // headless: false para ver o navegador
  const automation = new CurriculumAutomation({ headless: false });
  
  console.log('\n⏳ Iniciando automação com navegador VISÍVEL...\n');
  
  try {
    const result = await automation.createCurriculum(candidatoCompleto);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESULTADO:');
    console.log('='.repeat(80));
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n🎉 ✅ SUCESSO! Currículo criado.');
      console.log(`🔗 URL: ${result.url}`);
    } else {
      console.log('\n❌ FALHOU');
      console.log(`❗ Erro: ${result.error || 'Verifique os logs'}`);
    }
    
  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error.message);
    console.error('Stack:', error.stack);
  }
  
  console.log('='.repeat(80));
}

console.log('\n🚀 Iniciando teste CORRIGIDO...\n');
runTest().catch(console.error);
