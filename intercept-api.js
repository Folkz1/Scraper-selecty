/**
 * Script para interceptar e analisar as chamadas de API do Selecty
 * Execute este script, faça login e crie um currículo manualmente
 * O script vai capturar todas as requisições POST/PUT feitas
 */

const puppeteer = require('puppeteer');
require('dotenv').config();

async function interceptApiCalls() {
  console.log('🔍 Iniciando interceptação de API...');
  console.log('═'.repeat(60));
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Array para armazenar requisições capturadas
  const capturedRequests = [];
  
  // Interceptar todas as requisições
  await page.setRequestInterception(true);
  
  page.on('request', request => {
    const url = request.url();
    const method = request.method();
    
    // Capturar requisições POST e PUT (criação/atualização)
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      const postData = request.postData();
      
      console.log('\n' + '─'.repeat(60));
      console.log(`📤 ${method} ${url}`);
      console.log('Headers:', JSON.stringify(request.headers(), null, 2));
      
      if (postData) {
        try {
          // Tentar parsear como JSON
          const jsonData = JSON.parse(postData);
          console.log('Body (JSON):', JSON.stringify(jsonData, null, 2));
        } catch {
          // Se não for JSON, mostrar como está
          console.log('Body (raw):', postData.substring(0, 2000));
        }
      }
      
      capturedRequests.push({
        method,
        url,
        headers: request.headers(),
        postData: postData
      });
    }
    
    request.continue();
  });
  
  // Interceptar respostas também
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    
    // Capturar respostas de APIs (geralmente JSON)
    if (url.includes('/api/') || url.includes('curriculum') || url.includes('/cv/')) {
      console.log(`\n📥 Response ${status}: ${url}`);
      
      try {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('json')) {
          const json = await response.json();
          console.log('Response JSON:', JSON.stringify(json, null, 2).substring(0, 1000));
        }
      } catch (e) {
        // Ignorar erros de parsing
      }
    }
  });
  
  // Navegar para login
  console.log('\n🌐 Navegando para página de login...');
  await page.goto(process.env.SELECTY_LOGIN_URL || 'https://selecty.app/login');
  
  // Fazer login automático
  await page.waitForSelector('#email, input[name="email"]', { timeout: 10000 });
  await page.type('#email, input[name="email"]', process.env.SELECTY_EMAIL);
  await page.type('#password, input[name="password"]', process.env.SELECTY_PASSWORD);
  await page.click('button[type="submit"]');
  
  console.log('✅ Login realizado. Aguardando...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('\n' + '═'.repeat(60));
  console.log('📋 INSTRUÇÕES:');
  console.log('═'.repeat(60));
  console.log('1. Navegue para a página de currículos');
  console.log('2. Crie um novo currículo manualmente');
  console.log('3. Preencha todos os campos obrigatórios');
  console.log('4. Clique em SALVAR');
  console.log('5. Após salvar, pressione CTRL+C no terminal');
  console.log('═'.repeat(60));
  console.log('\n👀 Monitorando requisições... (CTRL+C para encerrar)\n');
  
  // Manter o script rodando até o usuário encerrar
  process.on('SIGINT', async () => {
    console.log('\n\n═'.repeat(60));
    console.log('📊 RESUMO DAS REQUISIÇÕES CAPTURADAS:');
    console.log('═'.repeat(60));
    
    capturedRequests.forEach((req, i) => {
      console.log(`\n[${i + 1}] ${req.method} ${req.url}`);
      if (req.postData) {
        console.log('  Body:', req.postData.substring(0, 500) + (req.postData.length > 500 ? '...' : ''));
      }
    });
    
    // Salvar em arquivo
    const fs = require('fs');
    fs.writeFileSync('./captured-api-calls.json', JSON.stringify(capturedRequests, null, 2));
    console.log('\n💾 Requisições salvas em: ./captured-api-calls.json');
    
    await browser.close();
    process.exit(0);
  });
  
  // Manter o navegador aberto indefinidamente
  await new Promise(() => {});
}

interceptApiCalls().catch(console.error);
