/**
 * Script para interceptar TODAS as chamadas de API relacionadas a currículo
 * Foco em descobrir endpoints para: experiência, escolaridade, perfil profissional
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
require('dotenv').config();

async function interceptAllApiCalls() {
  console.log('🔍 Interceptando TODAS as chamadas de API...');
  console.log('═'.repeat(60));
  
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Array para armazenar todas as requisições
  const allRequests = [];
  
  await page.setRequestInterception(true);
  
  page.on('request', request => {
    const url = request.url();
    const method = request.method();
    
    // Capturar TODAS as requisições POST/PUT/PATCH para o Selecty
    if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && url.includes('selecty.app')) {
      const postData = request.postData();
      
      // Ignorar chamadas de broadcasting e recursos estáticos
      if (!url.includes('/broadcasting/') && !url.includes('.js') && !url.includes('.css')) {
        console.log('\n' + '─'.repeat(60));
        console.log(`📤 ${method} ${url}`);
        
        if (postData) {
          try {
            const jsonData = JSON.parse(postData);
            console.log('Body:', JSON.stringify(jsonData, null, 2).substring(0, 1000));
          } catch {
            console.log('Body (raw):', postData.substring(0, 500));
          }
        }
        
        allRequests.push({
          timestamp: new Date().toISOString(),
          method,
          url,
          postData: postData
        });
      }
    }
    
    request.continue();
  });
  
  // Capturar respostas também
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    
    if (url.includes('selecty.app') && !url.includes('.js') && !url.includes('.css') && !url.includes('/broadcasting/')) {
      if (status === 200 || status === 201) {
        try {
          const contentType = response.headers()['content-type'] || '';
          if (contentType.includes('json')) {
            const json = await response.json();
            console.log(`📥 Response ${status} for ${url.split('/').slice(-2).join('/')}`);
            console.log('   ', JSON.stringify(json).substring(0, 200));
          }
        } catch (e) {
          // Ignorar erros de parsing
        }
      }
    }
  });
  
  // Fazer login
  console.log('\n🌐 Fazendo login...');
  await page.goto(process.env.SELECTY_LOGIN_URL || 'https://selecty.app/login', { waitUntil: 'networkidle2' });
  
  await page.waitForSelector('input#login', { timeout: 30000 });
  await page.type('input#login', process.env.SELECTY_EMAIL, { delay: 30 });
  await page.type('input#password', process.env.SELECTY_PASSWORD, { delay: 30 });
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {}),
    page.click('button[type="submit"]')
  ]);
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log('✅ Login realizado.');
  
  console.log('\n' + '═'.repeat(60));
  console.log('📋 INSTRUÇÕES:');
  console.log('═'.repeat(60));
  console.log('1. Vá para a lista de Currículos');
  console.log('2. Abra um currículo existente (ex: TESTE API COMPLETO)');
  console.log('3. ADICIONE uma EXPERIÊNCIA PROFISSIONAL e salve');
  console.log('4. ADICIONE uma ESCOLARIDADE/FORMAÇÃO e salve');
  console.log('5. ADICIONE CARGO PRETENDIDO e salve');
  console.log('6. Quando terminar, pressione CTRL+C no terminal');
  console.log('═'.repeat(60));
  console.log('\n👀 Monitorando chamadas... (CTRL+C para encerrar)\n');
  
  // Salvar ao encerrar
  process.on('SIGINT', async () => {
    console.log('\n\n═'.repeat(60));
    console.log('📊 RESUMO DAS CHAMADAS CAPTURADAS:');
    console.log('═'.repeat(60));
    
    allRequests.forEach((req, i) => {
      console.log(`\n[${i + 1}] ${req.method} ${req.url}`);
    });
    
    // Salvar em arquivo detalhado
    fs.writeFileSync('./all-api-calls.json', JSON.stringify(allRequests, null, 2));
    console.log('\n💾 Todas as chamadas salvas em: ./all-api-calls.json');
    
    await browser.close();
    process.exit(0);
  });
  
  // Manter aberto
  await new Promise(() => {});
}

interceptAllApiCalls().catch(console.error);
