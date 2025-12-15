require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DUMMY_DATA = {
  text: 'Teste Automação',
  email: 'teste.auto@example.com',
  phone: '(11) 99999-9999',
  date: '01/01/1990',
  cep: '01001-000',
  number: '123',
  salary: '3500'
};

class FormAutoFiller {
  constructor() {
    this.mapping = JSON.parse(fs.readFileSync(path.join(__dirname, 'scraper', 'curriculum', 'form-mapping.json'), 'utf8'));
    this.browser = null;
    this.page = null;
    this.capturedRequests = [];
  }

  generateCPF() {
    // Generate valid CPF digits only (no formatting) to let the mask handle it
    const random = () => Math.floor(Math.random() * 9);
    const n = Array(9).fill(0).map(() => random());
    let d1 = n.reduce((sum, num, i) => sum + num * (10 - i), 0) % 11;
    d1 = d1 < 2 ? 0 : 11 - d1; n.push(d1);
    let d2 = n.reduce((sum, num, i) => sum + num * (11 - i), 0) % 11;
    d2 = d2 < 2 ? 0 : 11 - d2; n.push(d2);
    return n.join('');
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1366, height: 768 },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });
    this.page = await this.browser.newPage();
    await this.page.setRequestInterception(true);
    this.page.on('request', request => {
      if (request.url().includes('/curriculum/save') && request.method() === 'POST') {
        console.log('🔥 PAYLOAD CAPTURADO (GOLD STANDARD)!');
        this.capturedRequests.push({ url: request.url(), postData: request.postData() });
        fs.writeFileSync('gold-standard-payload.json', JSON.stringify({ url: request.url(), postData: request.postData() }, null, 2));
      }
      request.continue();
    });
  }

  async login() {
    console.log('🔐 Login...');
    await this.page.goto(process.env.SELECTY_LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.type('#login', process.env.SELECTY_EMAIL);
    await this.page.type('#password', process.env.SELECTY_PASSWORD);
    await this.page.click('button[type="submit"]');
    await this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }).catch(() => {});
  }

  async navigateToForm() {
    console.log('🚀 Indo para o formulário...');
    await this.page.goto('https://selecty.app/curriculum/create-cv/complete/0', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.waitForSelector('#cv_name', { timeout: 30000 });
    await this.expandSections();
  }

  async expandSections() {
    console.log('   📂 "Smart" Expanding: Clicking headers & forcing visibility...');
    try {
        await this.page.evaluate(() => {
            const headers = document.querySelectorAll('div[role="button"][aria-controls^="collapse_"]');
            headers.forEach(h => {
                // Click if it looks closed
                if (h.classList.contains('collapsed') || h.getAttribute('aria-expanded') === 'false') {
                    h.click();
                }
            });
        });
        await new Promise(r => setTimeout(r, 1000));
        await this.page.evaluate(() => {
            document.querySelectorAll('.collapse').forEach(el => {
                el.classList.add('show');
                el.style.display = 'block';
                el.style.visibility = 'visible';
                el.style.height = 'auto';
            });
        });
    } catch (e) { }
  }

  async fillAllFields() {
    console.log(`📝 Smart Filling...`);
    const sorted = [...this.mapping.formFields].sort((a,b) => {
        // Dependency sort
        if ((a.name||'').includes('state') && (b.name||'').includes('city')) return -1;
        if ((a.name||'').includes('institution') && (b.name||'').includes('course')) return -1; // Uni before course
        return 0;
    });

    let pendingEducation = false;

    for (const field of sorted) {
      if ((!field.id && !field.name) || field.inputType === 'hidden') continue;
      
      const selector = field.id ? `#${field.id}` : `[name="${field.name}"]`;
      
      try {
        let el = await this.page.$(selector);
        if (!el && field.name) el = await this.page.$(`[name="${field.name}"]`);
        if (!el) continue;

        const isVisible = await el.boundingBox();
        if(!isVisible) {
             await this.page.evaluate(e => e.scrollIntoView(), el);
             // Logic: If still invisible, force it? No, puppeteer type/click needs visibility.
             // If "Formação Acadêmica" fields are hidden, maybe "Incluir" isn't needed yet?
             // But usually they are visible.
        }

        let val = DUMMY_DATA.text;
        const name = (field.name || '').toLowerCase();
        
        // Smart Data Generation
        if (name.includes('cpf')) val = this.generateCPF(); 
        else if (name.includes('email')) val = DUMMY_DATA.email;
        else if (name.match(/phone|celular|tel/)) val = DUMMY_DATA.phone; // Mask will handle format
        else if (name.match(/date|nascimento/)) val = DUMMY_DATA.date;
        else if (name.includes('cep')) val = DUMMY_DATA.cep;
        else if (name.includes('salary')) val = DUMMY_DATA.salary;
        else if (name.includes('number')) val = DUMMY_DATA.number;

        // Validating Education Fields
        if (name.includes('schooling') || name.includes('curso') || name.includes('turno') || name.includes('institution')) {
            pendingEducation = true;
        }

        console.log(`   ✏️ ${field.name || field.id}`);

        if (field.type === 'select') {
           if (field.isSelect2) {
               await this.fillSelect2(selector, name);
           } else {
               // Smart Select: Pick index 1 (Manhã/Ensino Médio)
               await this.page.evaluate((s) => {
                   const opts = s.querySelectorAll('option');
                   // Prefer index 1, or 2 if 1 is disabled/empty
                   let idx = 1;
                   if (opts.length > 2 && (!opts[idx].value || opts[idx].text.includes('Selecione'))) idx = 2;
                   if (opts.length > idx) s.value = opts[idx].value;
                   s.dispatchEvent(new Event('change', { bubbles: true }));
               }, el);
           }
        } else if (field.inputType === 'radio') {
            await el.click();
        } else if (field.inputType !== 'line' && field.inputType !== 'checkbox') {
            await el.click();
            await this.page.evaluate(e => e.value = '', el);
            await this.page.type(selector, val, {delay: 50}); 
            // Delay helps with masks (CPFs)
            await this.page.keyboard.press('Tab');
        }

      } catch (e) { }
    }
    
    // Add Education Item
    if (pendingEducation) {
        console.log('   🎓 Processando "Incluir Escolaridade"...');
        try {
            const addBtns = await this.page.$x("//button[contains(., 'Incluir Escolaridade') or contains(., 'Adicionar')]");
            if (addBtns.length > 0) {
                 await addBtns[0].click();
                 await new Promise(r => setTimeout(r, 1000));
            }
        } catch(e) { console.log('   ⚠️ Failed to click add button'); }
    }
  }

  async fillSelect2(selector, fieldName) {
    try {
      await this.page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (el && el.nextElementSibling) {
             const s = el.nextElementSibling.querySelector('.select2-selection');
             if(s) s.click();
          }
      }, selector);
      await new Promise(r => setTimeout(r, 500));
      
      let text = 'e'; // default
      // Context-aware typing
      if (fieldName.includes('occupation') || fieldName.includes('cargo')) text = 'Auxiliar';
      else if (fieldName.includes('city') || fieldName.includes('cidade')) text = 'São Paulo';
      else if (fieldName.includes('country') || fieldName.includes('pais')) text = 'Brasil';
      else if (fieldName.includes('civil')) text = 'Solteiro';
      else if (fieldName.includes('interest')) text = 'Administração';
      else if (fieldName.includes('state')) text = 'São Paulo';
      
      await this.page.keyboard.type(text);
      await new Promise(r => setTimeout(r, 2000));
      await this.page.keyboard.press('ArrowDown');
      await this.page.keyboard.press('Enter');
    } catch (e) {}
  }
  
  async diagnoseErrors() {
      console.log('   🕵️ Diagnosticando erros na página...');
      const errors = await this.page.evaluate(() => {
          return [...document.querySelectorAll('.text-danger, .invalid-feedback')]
             .filter(e => e.innerText && e.offsetParent !== null) // Visible text
             .map(e => e.innerText);
      });
      if(errors.length) {
          console.log('   🚨 Erros encontrados:', errors);
      } else {
          console.log('   ✅ Nenhum erro textual visível encontrado.');
      }
  }

  async run() {
    try {
        await this.init();
        await this.login();
        await this.navigateToForm();
        await this.fillAllFields();
        
        console.log('💾 Tentando salvar (Smart Submit)...');
        await this.page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const save = btns.find(b => b.textContent.includes('Salvar') || b.textContent.includes('Save'));
            if(save) save.click();
        });
        
        // Wait for response OR errors
        await new Promise(r => setTimeout(r, 10000));
        
        if(!this.capturedRequests.length) {
            console.log('⚠️ Falha no envio. Executando diagnóstico...');
            await this.diagnoseErrors();
            await this.page.screenshot({path: 'debug-failed-submit-v3.png', fullPage: true});
        }
    } catch(e) { console.error(e); }
    // await this.browser.close();
  }
}

new FormAutoFiller().run();
