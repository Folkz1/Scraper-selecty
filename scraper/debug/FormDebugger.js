/**
 * FormDebugger - Ferramenta avançada para debugging de formulários complexos
 * Usa CDP para captura HAR, mapeamento de campos e replay de requisições
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class FormDebugger {
  constructor(options = {}) {
    this.browser = null;
    this.page = null;
    this.cdpSession = null;
    this.networkEvents = [];
    this.harEntries = [];
    this.formFields = [];
    this.select2Options = {};
    this.outputDir = options.outputDir || './debug-output';
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Inicia o browser e configura CDP
   */
  async init(headless = false) {
    console.log('🔧 Iniciando FormDebugger...');
    
    this.browser = await puppeteer.launch({
      headless,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      defaultViewport: { width: 1400, height: 900 },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    this.page = await this.browser.newPage();
    this.page.setDefaultNavigationTimeout(60000);
    this.page.setDefaultTimeout(30000);
    
    // Criar sessão CDP
    this.cdpSession = await this.page.target().createCDPSession();
    
    // Habilitar domínios CDP necessários
    await this.cdpSession.send('Network.enable');
    await this.cdpSession.send('Page.enable');
    await this.cdpSession.send('DOM.enable');
    
    // Configurar listeners para captura de rede
    this.setupNetworkCapture();
    
    console.log('✅ FormDebugger inicializado');
    return this;
  }

  /**
   * Configura captura de rede via CDP
   */
  setupNetworkCapture() {
    const startTime = Date.now();
    
    this.cdpSession.on('Network.requestWillBeSent', (params) => {
      this.networkEvents.push({
        type: 'request',
        timestamp: Date.now() - startTime,
        requestId: params.requestId,
        url: params.request.url,
        method: params.request.method,
        headers: params.request.headers,
        postData: params.request.postData
      });
    });
    
    this.cdpSession.on('Network.responseReceived', async (params) => {
      this.networkEvents.push({
        type: 'response',
        timestamp: Date.now() - startTime,
        requestId: params.requestId,
        url: params.response.url,
        status: params.response.status,
        headers: params.response.headers,
        mimeType: params.response.mimeType
      });
    });
    
    this.cdpSession.on('Network.loadingFinished', async (params) => {
      try {
        const response = await this.cdpSession.send('Network.getResponseBody', {
          requestId: params.requestId
        });
        
        const event = this.networkEvents.find(e => 
          e.requestId === params.requestId && e.type === 'response'
        );
        
        if (event) {
          event.body = response.body;
          event.base64Encoded = response.base64Encoded;
        }
      } catch (e) {
        // Response body might not be available for all requests
      }
    });
  }

  /**
   * Faz login no Selecty
   */
  async login(email, password, loginUrl = 'https://selecty.app/login') {
    console.log('🔐 Fazendo login...');
    
    await this.page.goto(loginUrl, { waitUntil: 'networkidle2' });
    
    await this.page.waitForSelector('input#login', { timeout: 30000 });
    await this.page.type('input#login', email, { delay: 30 });
    await this.page.type('input#password', password, { delay: 30 });
    
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {}),
      this.page.click('button[type="submit"]')
    ]);
    
    await this.sleep(3000);
    console.log('✅ Login realizado');
  }

  /**
   * Navega para a página de criação de currículo
   */
  async navigateToCurriculumForm() {
    console.log('📝 Navegando para formulário de currículo...');
    
    // Ir para página de currículos
    await this.page.goto('https://selecty.app/curriculum/index', { waitUntil: 'networkidle2' });
    await this.sleep(2000);
    
    // Clicar em "Novo currículo"
    const clicked = await this.page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, button'));
      const novoBtn = links.find(el => el.textContent.includes('Novo currículo'));
      if (novoBtn) {
        novoBtn.click();
        return true;
      }
      return false;
    });
    
    if (!clicked) {
      // Navegar diretamente
      await this.page.goto('https://selecty.app/curriculum/create', { waitUntil: 'networkidle2' });
    }
    
    await this.sleep(3000);
    
    // Selecionar tipo "Completo" para ter todos os campos
    await this.page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('label'));
      const completoLabel = labels.find(l => l.textContent.toLowerCase().includes('completo'));
      if (completoLabel) completoLabel.click();
    });
    
    await this.sleep(2000);
    console.log('✅ Formulário de currículo carregado');
  }

  /**
   * Mapeia TODOS os campos do formulário
   */
  async mapFormFields() {
    console.log('🔍 Mapeando campos do formulário...');
    
    this.formFields = await this.page.evaluate(() => {
      const fields = [];
      
      // Mapear inputs
      document.querySelectorAll('input').forEach(input => {
        if (input.type === 'hidden') return;
        
        const formGroup = input.closest('.form-group, .col, .row, .mb-3');
        const label = formGroup?.querySelector('label')?.textContent?.trim() || 
                      input.placeholder || '';
        
        fields.push({
          type: 'input',
          inputType: input.type,
          id: input.id,
          name: input.name,
          label: label,
          placeholder: input.placeholder,
          required: input.required,
          value: input.value,
          className: input.className,
          disabled: input.disabled,
          readonly: input.readOnly,
          pattern: input.pattern,
          maxLength: input.maxLength > 0 ? input.maxLength : null
        });
      });
      
      // Mapear selects
      document.querySelectorAll('select').forEach(select => {
        const formGroup = select.closest('.form-group, .col, .row, .mb-3');
        const label = formGroup?.querySelector('label')?.textContent?.trim() || '';
        
        const options = Array.from(select.options).map(opt => ({
          value: opt.value,
          text: opt.text,
          selected: opt.selected
        }));
        
        fields.push({
          type: 'select',
          id: select.id,
          name: select.name,
          label: label,
          required: select.required,
          multiple: select.multiple,
          className: select.className,
          options: options,
          isSelect2: select.classList.contains('select2-hidden-accessible') || 
                     !!select.nextElementSibling?.classList.contains('select2-container')
        });
      });
      
      // Mapear textareas
      document.querySelectorAll('textarea').forEach(textarea => {
        const formGroup = textarea.closest('.form-group, .col, .row, .mb-3');
        const label = formGroup?.querySelector('label')?.textContent?.trim() || '';
        
        fields.push({
          type: 'textarea',
          id: textarea.id,
          name: textarea.name,
          label: label,
          required: textarea.required,
          placeholder: textarea.placeholder,
          className: textarea.className
        });
      });
      
      // Mapear radio buttons e checkboxes
      const radioGroups = {};
      document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
        const name = input.name || input.id;
        if (!radioGroups[name]) {
          const formGroup = input.closest('.form-group, .col, .row, .mb-3, .btn-group');
          const groupLabel = formGroup?.querySelector('label:first-of-type')?.textContent?.trim() || '';
          
          radioGroups[name] = {
            type: input.type === 'radio' ? 'radioGroup' : 'checkboxGroup',
            name: name,
            label: groupLabel,
            options: []
          };
        }
        
        const label = input.closest('label')?.textContent?.trim() || 
                      document.querySelector(`label[for="${input.id}"]`)?.textContent?.trim() || '';
        
        radioGroups[name].options.push({
          id: input.id,
          value: input.value,
          label: label,
          checked: input.checked
        });
      });
      
      Object.values(radioGroups).forEach(group => fields.push(group));
      
      return fields;
    });
    
    console.log(`✅ ${this.formFields.length} campos mapeados`);
    return this.formFields;
  }

  /**
   * Expande todas as seções accordion do formulário
   */
  async expandAllSections() {
    console.log('📂 Expandindo todas as seções...');
    
    await this.page.evaluate(() => {
      // Clicar em todos os headers de accordion
      document.querySelectorAll('h2, .accordion-header, [data-bs-toggle="collapse"]').forEach(el => {
        el.click();
      });
    });
    
    await this.sleep(2000);
    
    // Expandir clicando nos botões/links de seções
    const sections = [
      'Dados Pessoais',
      'Contato',
      'Endereço',
      'Perfil Profissional',
      'Experiência',
      'Perfil Educacional',
      'Formação',
      'Idiomas',
      'Conhecimentos',
      'Atividades'
    ];
    
    for (const section of sections) {
      await this.page.evaluate((sectionName) => {
        const headers = Array.from(document.querySelectorAll('h2, h3, h4, .accordion-header, .card-header'));
        const header = headers.find(h => h.textContent.includes(sectionName));
        if (header) header.click();
      }, section);
      await this.sleep(500);
    }
    
    console.log('✅ Seções expandidas');
  }

  /**
   * Captura opções de todos os Select2
   */
  async mapSelect2Options() {
    console.log('🎯 Mapeando opções de Select2...');
    
    const select2Fields = this.formFields.filter(f => f.isSelect2);
    
    for (const field of select2Fields) {
      try {
        // Abrir o dropdown do Select2
        const containerSelector = `#select2-${field.id}-container, [id*="select2-${field.id}"]`;
        
        await this.page.click(containerSelector).catch(() => {});
        await this.sleep(800);
        
        // Capturar opções visíveis
        const options = await this.page.evaluate(() => {
          const opts = [];
          document.querySelectorAll('.select2-results__option').forEach(opt => {
            opts.push({
              id: opt.getAttribute('data-select2-id') || opt.id,
              value: opt.getAttribute('data-value') || '',
              text: opt.textContent.trim()
            });
          });
          return opts;
        });
        
        this.select2Options[field.id || field.name] = options;
        
        // Fechar dropdown
        await this.page.keyboard.press('Escape');
        await this.sleep(300);
        
      } catch (e) {
        console.log(`   ⚠ Não conseguiu mapear Select2: ${field.id || field.name}`);
      }
    }
    
    console.log(`✅ ${Object.keys(this.select2Options).length} Select2s mapeados`);
    return this.select2Options;
  }

  /**
   * Captura o CSRF token
   */
  async getCsrfToken() {
    const csrfToken = await this.page.evaluate(() => {
      const meta = document.querySelector('meta[name="csrf-token"]');
      return meta ? meta.content : null;
    });
    
    const cookies = await this.page.cookies();
    const xsrfCookie = cookies.find(c => c.name === 'XSRF-TOKEN');
    
    return {
      metaToken: csrfToken,
      cookieToken: xsrfCookie ? decodeURIComponent(xsrfCookie.value) : null,
      cookies: cookies.map(c => `${c.name}=${c.value}`).join('; ')
    };
  }

  /**
   * Gera relatório completo em JSON
   */
  async generateReport(filename = 'form-mapping.json') {
    console.log('📊 Gerando relatório...');
    
    const auth = await this.getCsrfToken();
    
    const report = {
      timestamp: new Date().toISOString(),
      url: await this.page.url(),
      auth: {
        csrfToken: auth.metaToken || auth.cookieToken,
        cookies: auth.cookies.substring(0, 200) + '...'
      },
      formFields: this.formFields,
      select2Options: this.select2Options,
      networkCalls: this.networkEvents.filter(e => 
        e.url.includes('selecty.app') && 
        !e.url.includes('.js') && 
        !e.url.includes('.css') &&
        !e.url.includes('/broadcasting/')
      ).slice(-50), // Últimas 50 chamadas relevantes
      statistics: {
        totalFields: this.formFields.length,
        inputFields: this.formFields.filter(f => f.type === 'input').length,
        selectFields: this.formFields.filter(f => f.type === 'select').length,
        select2Fields: this.formFields.filter(f => f.isSelect2).length,
        textareaFields: this.formFields.filter(f => f.type === 'textarea').length,
        radioGroups: this.formFields.filter(f => f.type === 'radioGroup').length
      }
    };
    
    const outputPath = path.join(this.outputDir, filename);
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`✅ Relatório salvo em: ${outputPath}`);
    
    return report;
  }

  /**
   * Captura screenshot
   */
  async screenshot(name) {
    const filename = `${name}-${Date.now()}.png`;
    const filepath = path.join(this.outputDir, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 Screenshot: ${filepath}`);
    return filepath;
  }

  /**
   * Fecha o browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = FormDebugger;
