/**
 * Teste de Criação de Currículo via Automação V2
 * Execute: node test-automation.js
 */

const CurriculumAutomation = require('./CurriculumAutomation');

// Dados de exemplo - Este é o formato que a IA deve enviar
const candidatoTeste = {
  dados_pessoais: {
    nome: "Maria Silva Santos",
    cpf: null, // Se null, será gerado automaticamente
    data_nascimento: "15/03/1992",
    genero: "F" // F=Mulher, M=Homem, u=Não informar
  },
  
  contato: {
    telefone_fixo: "(11) 3333-4444",
    celular: "(11) 99999-8888",
    email: "maria.silva@email.com"
  },
  
  endereco: {
    cep: "01310-100",
    estado: "SP", // USAR SIGLA: SP, RJ, MG, etc
    cidade: "Sao Paulo",
    logradouro: "Av Paulista",
    numero: "1000",
    bairro: "Bela Vista"
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
    cargo_pretendido: "Auxiliar", // Busca AJAX
    salario_pretendido: 3500, // Só inteiro!
    area_interesse: "Administra", // Busca parcial
    nivel: "Auxiliar" // Jovem Aprendiz, Estagiário, Operacional, Auxiliar, Assistente, etc
  },
  
  experiencias: [
    {
      empresa: "Empresa ABC LTDA",
      segmento: "Tecno", // Busca parcial: "Tecnologia e Informática"
      porte: "medio", // Busca: "Empresa de médio porte"
      cargo: "Especialista em Automação IA", // CARGO FICTÍCIO para testar Novo Cargo
      ultimo_salario: 2500, // Só inteiro!
      emprego_atual: true,
      atividades: "Suporte administrativo e atendimento ao cliente"
    }
  ]
};

async function runTest() {
  console.log('='.repeat(60));
  console.log('🚀 TESTE DE AUTOMAÇÃO DE CURRÍCULO V3');
  console.log('='.repeat(60));
  
  console.log('\n📋 Dados do candidato:');
  console.log(JSON.stringify(candidatoTeste, null, 2));
  
  const automation = new CurriculumAutomation({ headless: true });
  
  console.log('\n⏳ Iniciando automação...\n');
  
  const result = await automation.createCurriculum(candidatoTeste);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTADO:');
  console.log('='.repeat(60));
  
  if (result.success) {
    console.log('✅ SUCESSO! Currículo criado.');
    console.log(`🔗 URL: ${result.url}`);
  } else {
    console.log('❌ FALHOU');
    console.log(`❗ Erro: ${result.error || 'Verifique os logs'}`);
  }
  
  console.log('\n📝 Screenshot salvo em curriculum-created.png ou curriculum-error.png');
  console.log('='.repeat(60));
}

runTest().catch(console.error);
