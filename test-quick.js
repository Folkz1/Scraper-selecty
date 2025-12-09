/**
 * Script de teste rápido para o Selecty Scraper
 * Executa extração limitada para teste (3 vagas por padrão)
 */

require('dotenv').config();

const SelectyScraper = require('./scraper/selecty-scraper');

const MAX_VAGAS_TESTE = 3; // Limite para testes rápidos

async function runTest() {
  console.log('═'.repeat(50));
  console.log('🧪 TESTE RÁPIDO DO SELECTY SCRAPER');
  console.log(`📊 Limite de vagas: ${MAX_VAGAS_TESTE}`);
  console.log('═'.repeat(50));
  
  const scraper = new SelectyScraper();
  
  try {
    // Executar com limite de vagas
    const result = await scraper.run(MAX_VAGAS_TESTE);
    
    console.log('\n' + '═'.repeat(50));
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('═'.repeat(50));
    
    console.log(`\n📊 Resumo:`);
    console.log(`   - Vagas extraídas: ${result.totalVacancies}`);
    console.log(`   - Tempo de execução: ${result.executionTime}`);
    
    console.log('\n📋 Dados extraídos:');
    result.vacancies.forEach((vaga, index) => {
      console.log(`\n--- Vaga ${index + 1} ---`);
      console.log(`   Cargo: ${vaga.cargo}`);
      console.log(`   Empresa: ${vaga.empresa}`);
      console.log(`   Status: ${vaga.statusVaga}`);
      console.log(`   Selecionador Responsável: ${vaga.selecionadorResponsavel || 'Não encontrado'}`);
      console.log(`   Salário: ${vaga.salario}`);
      console.log(`   Local: ${vaga.local}`);
    });
    
    // Salvar resultado em JSON para análise
    const fs = require('fs');
    const outputFile = './test-result.json';
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`\n💾 Resultado salvo em: ${outputFile}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n' + '═'.repeat(50));
    console.error('❌ ERRO NO TESTE:', error.message);
    console.error('═'.repeat(50));
    console.error(error.stack);
    process.exit(1);
  }
}

runTest();
