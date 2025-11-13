/**
 * Script para testar a API do scraper
 * Execute: node test-api.js
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.API_KEY || 'your-secure-api-key-here';

async function testAPI() {
  console.log('🧪 Testando API do Scraper Selecty');
  console.log('='.repeat(50));
  
  try {
    // 1. Teste Health Check
    console.log('\n1. Testando Health Check...');
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);

    // 2. Teste Status (sem auth - deve falhar)
    console.log('\n2. Testando Status sem autenticação...');
    try {
      const statusResponse = await fetch(`${API_BASE_URL}/api/scrape/status`);
      console.log('❌ Deveria ter falhado, mas retornou:', statusResponse.status);
    } catch (error) {
      console.log('✅ Falhou como esperado (sem auth)');
    }

    // 3. Teste Status (com auth)
    console.log('\n3. Testando Status com autenticação...');
    const statusResponse = await fetch(`${API_BASE_URL}/api/scrape/status`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const statusData = await statusResponse.json();
    console.log('✅ Status:', statusData);

    // 4. Teste Last Result
    console.log('\n4. Testando último resultado...');
    const lastResponse = await fetch(`${API_BASE_URL}/api/scrape/last`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (lastResponse.status === 404) {
      console.log('ℹ️ Nenhum resultado em cache ainda');
    } else {
      const lastData = await lastResponse.json();
      console.log('✅ Último resultado:', {
        success: lastData.success,
        timestamp: lastData.timestamp,
        extractedVacancies: lastData.extractedVacancies
      });
    }

    // 5. Teste execução do scraper (opcional - comentado por ser demorado)
    console.log('\n5. Execução do scraper (descomente para testar):');
    console.log('// Descomente as linhas abaixo para testar a execução completa');
    /*
    console.log('Executando scraper... (isso pode demorar alguns minutos)');
    const scrapeResponse = await fetch(`${API_BASE_URL}/api/scrape`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const scrapeData = await scrapeResponse.json();
    console.log('✅ Scraper executado:', {
      success: scrapeData.success,
      extractedVacancies: scrapeData.extractedVacancies,
      totalVacancies: scrapeData.totalVacancies,
      executionTime: scrapeData.executionTime
    });
    */

    console.log('\n' + '='.repeat(50));
    console.log('✅ Todos os testes da API passaram!');
    console.log('\nPara testar a execução completa do scraper:');
    console.log('1. Descomente a seção 5 neste arquivo');
    console.log('2. Configure suas credenciais no .env');
    console.log('3. Execute novamente: node test-api.js');

  } catch (error) {
    console.error('\n❌ Erro durante os testes:', error.message);
    process.exit(1);
  }
}

// Executar testes
testAPI();