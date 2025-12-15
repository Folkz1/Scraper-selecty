/**
 * API Client para criação de currículos via REST API
 * Usa chamadas diretas para o endpoint /curriculum/save
 */

const axios = require('axios');
const puppeteer = require('puppeteer');

class CurriculumApiClient {
  constructor(config) {
    this.config = config;
    this.baseUrl = 'https://selecty.app';
    this.csrfToken = null;
    this.cookies = null;
  }

  /**
   * Obtém tokens de autenticação via Puppeteer (login)
   */
  async authenticate() {
    console.log('🔐 Autenticando via navegador para obter tokens...');
    
    const browser = await puppeteer.launch({
      headless: false, // Temporariamente desativado para debug
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(30000);
    
    // Navegar para login e aguardar carregamento
    console.log('   Navegando para login...');
    await page.goto(`${this.baseUrl}/login`, { waitUntil: 'networkidle2' });
    
    // Aguardar campo de login aparecer
    await page.waitForSelector('input#login', { timeout: 30000 });
    
    // Preencher credenciais
    console.log('   Preenchendo credenciais...');
    await page.type('input#login', this.config.selecty.email, { delay: 50 });
    await page.type('input#password', this.config.selecty.password, { delay: 50 });
    
    // Submeter login
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {}),
      page.click('button[type="submit"]')
    ]);
    
    // Aguardar carregamento do dashboard
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Obter cookies
    const pageCookies = await page.cookies();
    this.cookies = pageCookies.map(c => `${c.name}=${c.value}`).join('; ');
    
    // Obter CSRF token do meta tag ou do cookie
    this.csrfToken = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="csrf-token"]');
      return meta ? meta.content : null;
    });
    
    // Se não encontrou no meta, buscar no cookie
    if (!this.csrfToken) {
      const xsrfCookie = pageCookies.find(c => c.name === 'XSRF-TOKEN');
      if (xsrfCookie) {
        this.csrfToken = decodeURIComponent(xsrfCookie.value);
      }
    }
    
    await browser.close();
    
    console.log('✅ Autenticação concluída');
    console.log(`   CSRF Token: ${this.csrfToken?.substring(0, 20)}...`);
    console.log(`   Cookies: ${this.cookies?.substring(0, 50)}...`);
    
    return { csrfToken: this.csrfToken, cookies: this.cookies };
  }

  /**
   * Cria um currículo via API REST
   * @param {Object} data - Dados do currículo
   * @returns {Promise<Object>} Resultado da criação
   */
  async createCurriculum(data) {
    if (!this.cookies || !this.csrfToken) {
      await this.authenticate();
    }
    
    console.log('\n📝 Criando currículo via API...');
    
    // Montar payload no formato esperado pelo Selecty
    const payload = this.buildPayload(data);
    
    // Debug: salvar payload
    const fs = require('fs');
    fs.writeFileSync('./debug-payload-sent.json', JSON.stringify(payload, null, 2));
    console.log('   Payload salvo em debug-payload-sent.json');
    
    try {
      const response = await axios.post(`${this.baseUrl}/curriculum/save`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
          'X-CSRF-TOKEN': this.csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
          'Cookie': this.cookies,
          'Origin': this.baseUrl,
          'Referer': `${this.baseUrl}/curriculum/create-cv/complete/0`
        }
      });
      
      console.log('✅ Currículo criado com sucesso!');
      console.log(`   Person ID: ${response.data.person_id}`);
      console.log(`   Status: ${response.data.status}`);
      console.log(`   Message: ${response.data.message}`);
      
      return {
        success: true,
        personId: response.data.person_id,
        message: response.data.message,
        data: response.data
      };
      
    } catch (error) {
      console.error('❌ Erro ao criar currículo via API:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Monta o payload JSON no formato esperado pelo Selecty
   */
  buildPayload(data) {
    // Dados do currículo
    const curriculumData = {
      name: data.nome || '',
      personId: '',
      cpf: data.cpf || '',
      rg: '',
      placeBirth: '',
      civilStatus: '',
      gender: this.mapGender(data.genero),
      stateRg: '',
      dateOfIssueRg: '',
      specialNeeds: null,
      specialNeedsDetails: null,
      cnh: '',
      cnhNumber: '',
      children: '',
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
        business_phone: data.telefoneFixo || '',
        celular: this.formatPhone(data.celular),
        phone: this.formatPhone(data.telefoneFixo || data.celular),
        message_with: '',
        email: data.email || '',
        secondary_email: data.emailSecundario || '',
        site: ''
      },
      comments: [],
      lastUpdate: '',
      relationships: [],
      behaviorList: [],
      userId: '',
      flags: '',
      isCustomer: '',
      professionalPerformance: data.experiencias || [],
      professionalPerformanceRemoved: [],
      schooling: data.formacao || [],
      schoolingRemoved: [],
      foreignLanguages: data.idiomas || [],
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
        intended_occupation: data.perfilProfissional?.cargoPretendido 
          ? [data.perfilProfissional.cargoPretendido] 
          : [],
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
      internal_observation: data.referencias || ''
    };

    // Estrutura do currículo com originalData contendo os mesmos dados (como o Selecty faz)
    const curriculum = {
      originalData: {
        name: '',
        personId: '',
        cpf: '',
        rg: '',
        placeBirth: '',
        civilStatus: '',
        gender: '',
        stateRg: '',
        dateOfIssueRg: '',
        specialNeeds: '',
        specialNeedsDetails: '',
        cnh: '',
        cnhNumber: '',
        children: '',
        childrenInfo: '',
        racial: '',
        source: '',
        origin: '',
        originId: '',
        bneIdCurriculum: '',
        origin_tags: '',
        assumedName: '',
        birthDate: '',
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
          complement: null,
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
          business_phone: '',
          celular: '',
          phone: '',
          message_with: '',
          email: '',
          secondary_email: '',
          site: ''
        },
        comments: [],
        lastUpdate: '',
        relationships: [],
        behaviorList: [],
        userId: '',
        flags: '',
        isCustomer: '',
        // IMPORTANTE: Incluir os mesmos dados aqui!
        professionalPerformance: data.experiencias || [],
        professionalPerformanceRemoved: [],
        schooling: data.formacao || [],
        schoolingRemoved: [],
        foreignLanguages: data.idiomas || [],
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
        // IMPORTANTE: Incluir professionalProfile aqui também!
        professionalProfile: {
          available_trip: null,
          cover_letter: null,
          folder_id: null,
          has_professional_history: 'u',
          intended_occupation: data.perfilProfissional?.cargoPretendido 
            ? [data.perfilProfissional.cargoPretendido] 
            : [],
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
        internal_observation: ''
      },
      ...curriculumData,
      profile: 'full'
    };

    return {
      curriculum,
      sendWelcomeMessage: false,
      messageTemplateId: 0
    };
  }

  mapGender(genero) {
    const map = {
      'homem': 'M',
      'mulher': 'F',
      'masculino': 'M',
      'feminino': 'F',
      'm': 'M',
      'f': 'F'
    };
    return map[genero?.toLowerCase()] || '';
  }

  formatDate(dateStr) {
    if (!dateStr) return '';
    // Converter de DD/MM/YYYY para YYYY-MM-DD
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  }

  formatPhone(phone) {
    if (!phone) return '';
    // Adicionar formatação (XX) XXXXX-XXXX se necessário
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return phone;
  }
}

module.exports = CurriculumApiClient;
