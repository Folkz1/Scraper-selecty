/**
 * Script para interceptar e salvar a chamada POST /curriculum/save
 * Foco específico em capturar o payload JSON completo
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
require('dotenv').config();

async function captureApiPayload() {
  console.log('🔍 Capturando payload da API de criação de currículo...');
  console.log('═'.repeat(60));
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Variável para armazenar o payload da criação
  let curriculumPayload = null;
  let csrfToken = null;
  let cookies = null;
  
  // Interceptar todas as requisições
  await page.setRequestInterception(true);
  
  page.on('request', request => {
    const url = request.url();
    const method = request.method();
    
    // Capturar especificamente a chamada de save do currículo
    if (method === 'POST' && url.includes('/curriculum/save')) {
      const postData = request.postData();
      const headers = request.headers();
      
      console.log('\n' + '═'.repeat(60));
      console.log('🎯 CAPTURADO: POST /curriculum/save');
      console.log('═'.repeat(60));
      
      csrfToken = headers['x-csrf-token'];
      cookies = headers['cookie'];
      
      console.log('\n📋 CSRF Token:', csrfToken);
      console.log('\n🍪 Cookies (primeiros 100 chars):', cookies?.substring(0, 100) + '...');
      
      if (postData) {
        try {
          curriculumPayload = JSON.parse(postData);
          console.log('\n📦 PAYLOAD JSON COMPLETO:');
          console.log(JSON.stringify(curriculumPayload, null, 2));
          
          // Salvar em arquivo
          const output = {
            endpoint: url,
            method: 'POST',
            csrfToken: csrfToken,
            cookies: cookies,
            payload: curriculumPayload,
            capturedAt: new Date().toISOString()
          };
          
          fs.writeFileSync('./api-curriculum-save.json', JSON.stringify(output, null, 2));
          console.log('\n💾 Salvado em: ./api-curriculum-save.json');
          
        } catch (e) {
          console.log('\n📦 PAYLOAD RAW:');
          console.log(postData);
          fs.writeFileSync('./api-curriculum-save-raw.txt', postData);
        }
      }
    }
    
    request.continue();
  });
  
  // Capturar resposta também
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/curriculum/save')) {
      console.log('\n📥 RESPOSTA DA API:');
      console.log('Status:', response.status());
      try {
        const json = await response.json();
        console.log('Response:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Response text:', await response.text());
      }
    }
  });
  
  // Navegar para login
  console.log('\n🌐 Fazendo login...');
  await page.goto(process.env.SELECTY_LOGIN_URL || 'https://selecty.app/login');
  
  await page.waitForSelector('#email, input[name="email"]', { timeout: 10000 });
  await page.type('#email, input[name="email"]', process.env.SELECTY_EMAIL);
  await page.type('#password, input[name="password"]', process.env.SELECTY_PASSWORD);
  await page.click('button[type="submit"]');
  
  console.log('✅ Login realizado.');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('\n' + '═'.repeat(60));
  console.log('📋 INSTRUÇÕES:');
  console.log('═'.repeat(60));
  console.log('1. Navegue para Currículos');
  console.log('2. Crie um novo currículo');
  console.log('3. Preencha todos os campos');
  console.log('4. Clique em SALVAR');
  console.log('5. O payload será capturado automaticamente!');
  console.log('═'.repeat(60));
  console.log('\n👀 Aguardando você criar o currículo...\n');
  
  // Aguardar até capturar o payload ou timeout
  let attempts = 0;
  while (!curriculumPayload && attempts < 600) { // 10 minutos
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  
  if (curriculumPayload) {
    console.log('\n✅ Payload capturado com sucesso!');
    console.log('📁 Arquivo salvo: ./api-curriculum-save.json');
  } else {
    console.log('\n⏰ Timeout - nenhum payload capturado.');
  }
  
  console.log('\nPressione ENTER para fechar...');
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  await browser.close();
}

captureApiPayload().catch(console.error);
