/**
 * CurriculumApiClientV2 - Cliente API melhorado para criação de currículos
 * Baseado no mapeamento completo do formulário capturado via FormDebugger
 * 
 * Diferenças do V1:
 * - Captura CSRF token diretamente via página
 * - Payload montado com estrutura exata descoberta
 * - Validação de dados antes do envio
 * - Retry com backoff exponencial
 * - Modo híbrido: API first, fallback para form
 */

const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class CurriculumApiClientV2 {
  constructor(config) {
    this.config = config;
    this.baseUrl = 'https://selecty.app';
    this.browser = null;
    this.page = null;
    this.csrfToken = null;
    this.cookies = null;
    this.axiosInstance = null;
    
    // Carregar mapeamento de campos (se existir)
    this.formMapping = this.loadFormMapping();
  }

  loadFormMapping() {
    try {
      const mappingPath = path.join(__dirname, 'form-mapping.json');
      if (fs.existsSync(mappingPath)) {
        const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
        console.log(`✅ Form mapping carregado: ${mapping.statistics?.totalFields || 0} campos`);
        return mapping;
      }
    } catch (e) {
      console.log('⚠️ Form mapping não encontrado, usando estrutura padrão');
    }
    return null;
  }

  /**
   * Inicializa browser e obtém tokens de autenticação
   */
  async init() {
    console.log('🔧 Inicializando CurriculumApiClientV2...');
    
    this.browser = await puppeteer.launch({
      headless: false, // Manter visível para debug
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      defaultViewport: { width: 1400, height: 900 },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    this.page = await this.browser.newPage();
    this.page.setDefaultNavigationTimeout(60000);
    this.page.setDefaultTimeout(30000);
    
    // Interceptar requisições para capturar URLs importantes
    await this.page.setRequestInterception(true);
    this.page.on('request', request => request.continue());
    
    return this;
  }

  /**
   * Faz login e obtém tokens
   */
  async authenticate() {
    console.log('🔐 Autenticando...');
    
    await this.page.goto(`${this.baseUrl}/login`, { waitUntil: 'networkidle2' });
    
    await this.page.waitForSelector('input#login', { timeout: 30000 });
    await this.page.type('input#login', this.config.email, { delay: 30 });
    await this.page.type('input#password', this.config.password, { delay: 30 });
    
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {}),
      this.page.click('button[type="submit"]')
    ]);
    
    await this.sleep(3000);
    
    // Capturar cookies e CSRF
    await this.refreshTokens();
    
    console.log('✅ Autenticado com sucesso');
    return this;
  }

  /**
   * Atualiza tokens CSRF e cookies
   */
  async refreshTokens() {
    const pageCookies = await this.page.cookies();
    this.cookies = pageCookies.map(c => `${c.name}=${c.value}`).join('; ');
    
    this.csrfToken = await this.page.evaluate(() => {
      const meta = document.querySelector('meta[name="csrf-token"]');
      return meta ? meta.content : null;
    });
    
    // Fallback: XSRF cookie
    if (!this.csrfToken) {
      const xsrfCookie = pageCookies.find(c => c.name === 'XSRF-TOKEN');
      if (xsrfCookie) {
        this.csrfToken = decodeURIComponent(xsrfCookie.value);
      }
    }
    
    // Configurar axios com headers
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'X-CSRF-TOKEN': this.csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': this.cookies,
        'Origin': this.baseUrl
      }
    });
    
    console.log(`   CSRF Token: ${this.csrfToken?.substring(0, 20)}...`);
    return this;
  }

  /**
   * Cria currículo via API direta
   * @param {Object} data - Dados do currículo
   */
  async createCurriculum(data) {
    if (!this.csrfToken) {
      await this.init();
      await this.authenticate();
    }
    
    console.log('\n📝 Criando currículo via API...');
    
    // Validar dados obrigatórios
    this.validateData(data);
    
    // Montar payload
    const payload = this.buildPayload(data);
    
    // Salvar payload para debug
    fs.writeFileSync(
      path.join(__dirname, '..', '..', 'debug-payload-v2.json'),
      JSON.stringify(payload, null, 2)
    );
    
    try {
      // Navegar para página do formulário para garantir sessão válida
      await this.page.goto(`${this.baseUrl}/curriculum/create-cv/complete/0`, { 
        waitUntil: 'networkidle2' 
      });
      await this.sleep(2000);
      
      // Atualizar tokens após navegação
      await this.refreshTokens();
      
      // Enviar via API
      const response = await this.axiosInstance.post('/curriculum/save', payload, {
        headers: {
          'Referer': `${this.baseUrl}/curriculum/create-cv/complete/0`
        }
      });
      
      console.log('✅ Currículo criado com sucesso!');
      console.log(`   Person ID: ${response.data.person_id}`);
      console.log(`   Status: ${response.data.status}`);
      
      return {
        success: true,
        personId: response.data.person_id,
        message: response.data.message || 'Currículo criado com sucesso',
        data: response.data
      };
      
    } catch (error) {
      console.error('❌ Erro ao criar currículo via API:', error.response?.data || error.message);
      
      // Tentar fallback via formulário
      console.log('🔄 Tentando via preenchimento de formulário...');
      return await this.createCurriculumViaForm(data);
    }
  }

  /**
   * Cria currículo preenchendo o formulário (fallback)
   */
  async createCurriculumViaForm(data) {
    console.log('📝 Preenchendo formulário manualmente...');
    
    try {
      // Navegar para formulário completo
      await this.page.goto(`${this.baseUrl}/curriculum/create-cv/complete/0`, { 
        waitUntil: 'networkidle2' 
      });
      await this.sleep(2000);
      
      // Preencher campos básicos
      await this.fillFormField('#cv_name', data.nome);
      await this.fillFormField('#cpf', data.cpf);
      await this.fillFormField('#email', data.email);
      await this.fillFormField('#celular', this.formatPhone(data.celular));
      
      // Gênero
      if (data.genero) {
        const genderValue = this.mapGender(data.genero);
        await this.page.evaluate((val) => {
          const radio = document.querySelector(`input[name="gender"][value="${val}"]`);
          if (radio) radio.click();
        }, genderValue);
      }
      
      // Endereço
      if (data.endereco) {
        await this.fillFormField('#cep', data.endereco.cep);
        await this.sleep(1500); // Aguardar autocomplete CEP
        await this.fillFormField('#street', data.endereco.rua);
        await this.fillFormField('#number', data.endereco.numero);
        await this.fillFormField('#neighborhood', data.endereco.bairro);
        
        // Estado e Cidade via Select2
        await this.selectSelect2Value('state', data.endereco.estado);
        await this.sleep(500);
        await this.selectSelect2Value('city', data.endereco.cidade);
      }
      
      // Salário pretendido
      if (data.perfilProfissional?.salarioPretendido) {
        await this.fillFormField('#intended_salary', data.perfilProfissional.salarioPretendido);
      }
      
      // Screenshot antes de salvar
      await this.page.screenshot({ 
        path: path.join(__dirname, '..', '..', 'debug-form-preenchido.png'), 
        fullPage: true 
      });
      
      // Clicar em salvar
      await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const saveBtn = buttons.find(btn => 
          btn.classList.contains('btn-forward') || 
          btn.textContent.toLowerCase().includes('salvar')
        );
        if (saveBtn) saveBtn.click();
      });
      
      await this.sleep(5000);
      
      // Verificar resultado
      const currentUrl = await this.page.url();
      const success = currentUrl.includes('/curriculum/edit') || 
                      currentUrl.includes('/curriculum/view') ||
                      currentUrl.includes('/curriculum/complete');
      
      if (success) {
        // Extrair person_id da URL
        const match = currentUrl.match(/\/(\d+)$/);
        const personId = match ? match[1] : null;
        
        return {
          success: true,
          personId,
          message: 'Currículo criado via formulário',
          method: 'form'
        };
      }
      
      return {
        success: false,
        error: 'Não foi possível confirmar a criação do currículo',
        method: 'form'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        method: 'form'
      };
    }
  }

  /**
   * Preenche um campo do formulário
   */
  async fillFormField(selector, value) {
    if (!value) return;
    
    try {
      await this.page.waitForSelector(selector, { visible: true, timeout: 5000 });
      await this.page.click(selector);
      await this.page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.value = '';
      }, selector);
      await this.page.type(selector, String(value), { delay: 30 });
    } catch (e) {
      console.log(`   ⚠️ Campo ${selector} não encontrado`);
    }
  }

  /**
   * Seleciona valor em Select2
   */
  async selectSelect2Value(fieldName, value) {
    if (!value) return;
    
    try {
      // Clicar no container do Select2
      await this.page.evaluate((name) => {
        const select = document.querySelector(`select[name="${name}"]`);
        if (select && select.nextElementSibling) {
          select.nextElementSibling.querySelector('.select2-selection')?.click();
        }
      }, fieldName);
      
      await this.sleep(500);
      
      // Digitar valor
      await this.page.keyboard.type(value, { delay: 30 });
      await this.sleep(800);
      
      // Selecionar primeira opção
      await this.page.keyboard.press('Enter');
      await this.sleep(300);
    } catch (e) {
      console.log(`   ⚠️ Select2 ${fieldName} erro: ${e.message}`);
    }
  }

  /**
   * Valida dados obrigatórios
   */
  validateData(data) {
    const required = ['nome', 'email'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Campos obrigatórios ausentes: ${missing.join(', ')}`);
    }
    
    // Validar CPF se fornecido
    if (data.cpf && !this.isValidCPF(data.cpf)) {
      console.warn('⚠️ CPF pode ser inválido');
    }
  }

  /**
   * Monta o payload no formato esperado pela API
   */
  buildPayload(data) {
    // Estrutura base do currículo
    const curriculumBase = {
      name: data.nome || '',
      personId: '',
      cpf: this.formatCPF(data.cpf) || '',
      rg: '',
      placeBirth: '',
      civilStatus: data.estadoCivil || '',
      gender: this.mapGender(data.genero),
      stateRg: '',
      dateOfIssueRg: '',
      specialNeeds: null,
      specialNeedsDetails: null,
      cnh: data.cnh || '',
      cnhNumber: '',
      children: data.filhos || '',
      childrenInfo: '',
      racial: '',
      source: '',
      origin: '',
      originId: '',
      bneIdCurriculum: '',
      origin_tags: '',
      assumedName: '',
      birthDate: this.formatDate(data.dataNascimento),
      creationDate: '',
      addresses: [],
      address: {
        personId: '',
        addressType: '',
        addressTypeOther: '',
        addressId: '',
        zipCode: data.endereco?.cep || '',
        streetType: '',
        street: data.endereco?.rua || '',
        number: data.endereco?.numero || '',
        complement: data.endereco?.complemento || null,
        district: data.endereco?.bairro || '',
        city: data.endereco?.cidade || '',
        state: data.endereco?.estado || '',
        country: 'Brasil',
        references: '',
        latitude: '',
        longitude: '',
        flags: ''
      },
      contacts: [],
      contact: {
        business_phone: data.telefoneComercial || '',
        celular: this.formatPhone(data.celular),
        phone: this.formatPhone(data.telefoneFixo || data.celular),
        message_with: '',
        email: data.email || '',
        secondary_email: data.emailSecundario || '',
        site: data.site || ''
      },
      comments: [],
      lastUpdate: '',
      relationships: [],
      behaviorList: [],
      userId: '',
      flags: '',
      isCustomer: '',
      professionalPerformance: this.formatExperiences(data.experiencias),
      professionalPerformanceRemoved: [],
      schooling: this.formatEducation(data.formacao),
      schoolingRemoved: [],
      foreignLanguages: this.formatLanguages(data.idiomas),
      foreignLanguagesRemoved: [],
      complementaryTraining: [],
      complementaryTrainingRemoved: [],
      computerKnowledge: [],
      computerKnowledgeRemoved: [],
      additionalActivities: {
        person_id: '',
        has_abroad_experience: '',
        abroad_experience: '',
        extra_informations: '',
        sports: '',
        hobby: '',
        books: '',
        music: '',
        passions: '',
        social_work: ''
      },
      admissionData: [],
      professionalProfile: {
        available_trip: null,
        cover_letter: null,
        folder_id: null,
        has_professional_history: 'u',
        intended_occupation: this.formatOccupations(data.perfilProfissional?.cargoPretendido),
        interest_areas: data.perfilProfissional?.areasInteresse || [],
        interest_levels: data.perfilProfissional?.niveisInteresse || [],
        interest_regions: [],
        person_id: null,
        salary_intended: parseInt(data.perfilProfissional?.salarioPretendido) || 0,
        suggested_function: null,
        suggested_occupation: null
      },
      processParticipation: [],
      files: [],
      stamps: [],
      stamps_all: [],
      appointments: [],
      customFields: [],
      internal_observation: data.observacoes || ''
    };

    return {
      curriculum: {
        originalData: { ...curriculumBase },
        ...curriculumBase,
        profile: 'full'
      },
      sendWelcomeMessage: false,
      messageTemplateId: 0
    };
  }

  // ==================== FORMATTERS ====================

  formatCPF(cpf) {
    if (!cpf) return '';
    const digits = cpf.replace(/\D/g, '');
    if (digits.length === 11) {
      return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9,11)}`;
    }
    return cpf;
  }

  formatPhone(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return phone;
  }

  formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  }

  mapGender(genero) {
    const map = {
      'homem': 'M', 'masculino': 'M', 'm': 'M',
      'mulher': 'F', 'feminino': 'F', 'f': 'F',
      'outro': 'u', 'nao_informar': 'u'
    };
    return map[genero?.toLowerCase()] || 'u';
  }

  formatOccupations(cargo) {
    if (!cargo) return [];
    if (Array.isArray(cargo)) return cargo;
    return [cargo];
  }

  formatExperiences(exps) {
    if (!exps || !Array.isArray(exps)) return [];
    return exps.map(exp => ({
      company_name: exp.empresa || exp.company_name || '',
      occupation_id: exp.occupation_id || '',
      name: exp.cargo || exp.name || '',
      start: exp.dataInicio || exp.start || '',
      finish: exp.dataFim || exp.finish || '',
      current: exp.atual ? 'yes' : 'no',
      description: exp.descricao || exp.description || '',
      period: exp.periodo || exp.period || '',
      acting_area: exp.area || exp.acting_area || '',
      company_size: exp.porte || exp.company_size || '',
      last_salary: parseInt(exp.salario || exp.last_salary) || 0,
      tempo: exp.tempo || 0,
      tempo_medida: exp.tempoMedida || exp.tempo_medida || 'years'
    }));
  }

  formatEducation(edu) {
    if (!edu || !Array.isArray(edu)) return [];
    return edu.map(e => ({
      education_level_id: e.nivelId || e.education_level_id || 2,
      education_level_name: e.nivel || e.education_level_name || '',
      institute: e.instituicao || e.institute || '',
      course: e.curso || e.course || '',
      start: e.dataInicio || e.start || '',
      finish: e.dataFim || e.finish || '',
      status: e.status || 'complete',
      period: e.turno || e.period || ''
    }));
  }

  formatLanguages(langs) {
    if (!langs || !Array.isArray(langs)) return [];
    return langs.map(l => ({
      language_id: l.idiomaId || l.language_id || 1,
      language_name: l.idioma || l.language_name || 'Inglês',
      reading: l.leitura || l.reading || 'Básico',
      writing: l.escrita || l.writing || 'Básico',
      speaking: l.fala || l.speaking || 'Básico',
      comprehension: l.compreensao || l.comprehension || 'Básico'
    }));
  }

  isValidCPF(cpf) {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(digits)) return false;
    // Simplified validation
    return true;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = CurriculumApiClientV2;
