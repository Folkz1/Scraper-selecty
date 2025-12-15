/**
 * Script para executar o mapeamento completo do formulário de currículo
 * Roda o FormDebugger e gera o arquivo form-mapping.json
 */

require('dotenv').config();
const FormDebugger = require('./scraper/debug/FormDebugger');
const path = require('path');

async function runFormMapping() {
  console.log('═'.repeat(60));
  console.log('🔍 FORM DEBUGGER - MAPEAMENTO COMPLETO');
  console.log('═'.repeat(60));
  
  const debugger_ = new FormDebugger({
    outputDir: path.join(__dirname, 'debug-output')
  });
  
  try {
    // Inicializar (headless: false para ver o que está acontecendo)
    await debugger_.init(false);
    
    // Login
    await debugger_.login(
      process.env.SELECTY_EMAIL,
      process.env.SELECTY_PASSWORD,
      process.env.SELECTY_LOGIN_URL || 'https://selecty.app/login'
    );
    
    // Screenshot pós-login
    await debugger_.screenshot('01-pos-login');
    
    // Navegar para formulário de currículo
    await debugger_.navigateToCurriculumForm();
    await debugger_.screenshot('02-form-inicial');
    
    // Expandir todas as seções
    await debugger_.expandAllSections();
    await debugger_.screenshot('03-secoes-expandidas');
    
    // Mapear campos do formulário
    await debugger_.mapFormFields();
    
    // Mapear opções dos Select2s
    await debugger_.mapSelect2Options();
    await debugger_.screenshot('04-select2-mapeados');
    
    // Gerar relatório
    const report = await debugger_.generateReport('form-mapping.json');
    
    console.log('\n' + '═'.repeat(60));
    console.log('📊 ESTATÍSTICAS DO MAPEAMENTO:');
    console.log('═'.repeat(60));
    console.log(`   Total de campos: ${report.statistics.totalFields}`);
    console.log(`   Inputs: ${report.statistics.inputFields}`);
    console.log(`   Selects: ${report.statistics.selectFields}`);
    console.log(`   Select2s: ${report.statistics.select2Fields}`);
    console.log(`   Textareas: ${report.statistics.textareaFields}`);
    console.log(`   Radio Groups: ${report.statistics.radioGroups}`);
    console.log('═'.repeat(60));
    
    // Copiar para pasta do scraper/curriculum
    const fs = require('fs');
    const destPath = path.join(__dirname, 'scraper', 'curriculum', 'form-mapping.json');
    fs.copyFileSync(
      path.join(__dirname, 'debug-output', 'form-mapping.json'),
      destPath
    );
    console.log(`\n✅ Mapeamento copiado para: ${destPath}`);
    
    // Manter browser aberto por 5 segundos para visualização
    console.log('\n⏳ Fechando em 5 segundos...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  } finally {
    await debugger_.close();
  }
}

runFormMapping();
