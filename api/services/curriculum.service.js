/**
 * Curriculum Service - Usando CurriculumAutomation V3
 * Esta versão usa o CurriculumAutomation que foi testado e validado
 */

const CurriculumAutomation = require('../../CurriculumAutomation');

class CurriculumService {
  constructor() {
    this.isRunning = false;
    this.lastExecution = null;
    this.lastResult = null;
  }

  /**
   * Cria um novo currículo no Selecty
   * @param {Object} curriculumData - Dados do currículo
   * @returns {Promise<Object>} Resultado da criação
   */
  async createCurriculum(curriculumData) {
    if (this.isRunning) {
      throw new Error('Curriculum creation already in progress. Please wait.');
    }

    // Transformar dados do formato antigo para o novo formato
    const data = this.transformData(curriculumData);
    
    // Validar campos obrigatórios
    this.validateRequiredFields(data);

    this.isRunning = true;
    const startTime = new Date();

    try {
      console.log('🚀 Starting curriculum creation with CurriculumAutomation V3...');
      console.log('📋 Candidate:', data.dados_pessoais?.nome || data.nome);
      
      // Usar CurriculumAutomation (headless: true para servidor)
      const automation = new CurriculumAutomation({ headless: true });
      
      // Executar criação
      const result = await automation.createCurriculum(data);
      
      // Fechar navegador
      if (automation.browser) {
        await automation.browser.close();
      }

      const endTime = new Date();
      const executionTime = endTime - startTime;

      const finalResult = {
        success: result.success,
        timestamp: endTime.toISOString(),
        executionTime: `${Math.round(executionTime / 1000)}s`,
        message: result.success ? 'Currículo criado com sucesso' : (result.message || 'Falha na criação'),
        url: result.url,
        curriculum: {
          nome: data.dados_pessoais?.nome || data.nome,
          cpf: data.dados_pessoais?.cpf || data.cpf,
          email: data.contato?.email || data.email
        },
        logs: result.logs
      };

      // Cache do resultado
      this.lastExecution = endTime;
      this.lastResult = finalResult;

      console.log(`✅ Curriculum creation completed: ${finalResult.message}`);
      
      return finalResult;

    } catch (error) {
      console.error('❌ Curriculum creation failed:', error);
      
      const errorResult = {
        success: false,
        timestamp: new Date().toISOString(),
        error: error.message,
        curriculum: null
      };

      this.lastExecution = new Date();
      this.lastResult = errorResult;

      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Transforma dados do formato antigo (flat) para o formato novo (estruturado)
   */
  transformData(data) {
    // Se já está no formato novo, retornar como está
    if (data.dados_pessoais || data.contato) {
      return data;
    }

    // Transformar formato flat para estruturado
    return {
      dados_pessoais: {
        nome: data.nome,
        cpf: data.cpf,
        data_nascimento: data.dataNascimento || data.data_nascimento,
        genero: data.genero || 'M'
      },
      contato: {
        telefone_fixo: data.telefoneFixo || data.telefone_fixo,
        celular: data.celular,
        email: data.email
      },
      endereco: {
        cep: data.cep,
        logradouro: data.rua || data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        estado: data.estado,
        cidade: data.cidade
      },
      perfil_educacional: data.perfil_educacional || [],
      perfil_profissional: data.perfil_profissional || {
        cargo_pretendido: data.cargo_pretendido,
        salario_pretendido: data.salario_pretendido,
        area_interesse: data.area_interesse,
        nivel: data.nivel
      },
      experiencias: data.experiencias || []
    };
  }

  /**
   * Valida campos obrigatórios
   */
  validateRequiredFields(data) {
    const nome = data.dados_pessoais?.nome || data.nome;
    const cpf = data.dados_pessoais?.cpf || data.cpf;
    const email = data.contato?.email || data.email;

    const missingFields = [];
    if (!nome) missingFields.push('nome');
    if (!cpf) missingFields.push('cpf');
    if (!email) missingFields.push('email');
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validar formato do CPF (11 dígitos)
    const cpfClean = cpf.toString().replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      throw new Error('Invalid CPF format. Must have 11 digits.');
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format.');
    }
  }

  /**
   * Retorna o status atual do serviço
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastExecution: this.lastExecution,
      hasCache: this.lastResult !== null,
      lastSuccess: this.lastResult ? this.lastResult.success : null
    };
  }

  /**
   * Retorna o último resultado
   */
  getLastResult() {
    return this.lastResult;
  }
}

// Singleton instance
const curriculumService = new CurriculumService();

module.exports = curriculumService;
