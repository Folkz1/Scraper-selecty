/**
 * Script simplificado para testar localmente a extração das 3 primeiras vagas
 */
const SelectyScraper = require('./selecty-scraper');
const { ErrorCodes } = require('./config');

async function testLocal() {
  console.log('🏁 Iniciando teste local limitado a 3 vagas...');
  
  // Sobrescrever variáveis de ambiente para teste local se necessário
  // Isso carrega do .env.local se estiver presente
  require('dotenv').config({ path: '.env.local' });
  
  // Se não carregar via dotenv acima (dependendo do ambiente), forçar manual:
  if (!process.env.SELECTY_EMAIL) {
    console.warn('⚠ Tentando carregar variáveis manualmente para teste...');
    const fs = require('fs');
    if (fs.existsSync('.env.local')) {
        const envConfig = require('dotenv').parse(fs.readFileSync('.env.local'));
        for (const k in envConfig) {
            process.env[k] = envConfig[k];
        }
    }
  }

  const scraper = new SelectyScraper();
  
  try {
    // Configurar para extrair apenas 3 vagas e mostrar o navegador
    if (scraper.config) {
        scraper.config.getConfig().scraper.headless = false; // Mostrar navegador
    }
    
    // Passar 3 como limite de vagas
    const result = await scraper.run(3);
    
    console.log('\n✅ TESTE CONCLUÍDO!');
    console.log(`Foram extraídas ${result.totalVacancies} vagas.`);
    
    // Mostrar resumo das vagas
    if (result.vacancies.length > 0) {
        console.log('\n--- Resumo das Vagas Extraídas ---');
        result.vacancies.forEach((v, i) => {
            console.log(`\n📦 Vaga ${i+1}: ${v.cargo}`);
            console.log(`   Status: ${v.statusVaga}`);
            console.log(`   Selecionador: ${v.selecionadorResponsavel}`);
            console.log(`   Link: ${v.link}`);
        });
    }

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    if (error.stack) console.error(error.stack);
  }
}

testLocal();
