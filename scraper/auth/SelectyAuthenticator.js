const { ScraperError, ErrorTypes, ErrorCodes } = require('../config/ErrorCodes');

class SelectyAuthenticator {
  constructor(config) {
    this.config = config;
    this.timeout = config.getTimeout();
  }

  /**
   * Realiza login no sistema Selecty
   * @param {Page} page - Instância da página do Puppeteer
   * @param {Object} credentials - Credenciais de login
   * @returns {Promise<boolean>} True se login bem-sucedido
   */
  async login(page, credentials) {
    try {
      console.log('Navegando para página de login...');
      
      // Navega para a URL de login
      await page.goto(credentials.loginUrl, {
        waitUntil: 'networkidle2',
        timeout: this.timeout
      });

      console.log('Aguardando campos de login...');
      
      // Aguarda os campos de login e senha estarem visíveis (seletores corretos validados)
      await page.waitForSelector('input#login', {
        visible: true,
        timeout: this.timeout
      });

      // Preenche o campo de login (usuário)
      await page.type('input#login', credentials.email, {
        delay: 100
      });

      console.log('Usuário preenchido');

      // Preenche o campo de senha
      await page.type('input#password', credentials.password, {
        delay: 100
      });

      console.log('Senha preenchida');

      // Aguarda um pouco antes de submeter
      await page.waitForTimeout(500);

      // Clica no botão de login
      const loginButtonSelectors = [
        'button[type="submit"]',
        'button:has-text("Entrar")',
        'button:has-text("Login")',
        'input[type="submit"]',
        '.btn-login',
        '#login-button'
      ];

      let loginClicked = false;
      for (const selector of loginButtonSelectors) {
        try {
          await page.click(selector, { timeout: 2000 });
          loginClicked = true;
          console.log(`Login submetido usando seletor: ${selector}`);
          break;
        } catch (e) {
          continue;
        }
      }

      if (!loginClicked) {
        // Tenta submeter o formulário via Enter
        await page.keyboard.press('Enter');
        console.log('Login submetido via Enter');
      }

      // Aguarda navegação após login
      await page.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: this.timeout
      }).catch(() => {
        // Ignora timeout de navegação, vamos validar de outra forma
        console.log('Timeout de navegação ignorado, validando login...');
      });

      return true;
    } catch (error) {
      throw new ScraperError(
        `Falha ao realizar login: ${error.message}`,
        ErrorTypes.AUTH_ERROR,
        ErrorCodes.AUTH_ERROR,
        'Verifique se as credenciais estão corretas e se a página de login não foi alterada'
      );
    }
  }

  /**
   * Valida se o login foi bem-sucedido
   * @param {Page} page - Instância da página do Puppeteer
   * @returns {Promise<boolean>} True se autenticado
   */
  async validateLogin(page) {
    try {
      console.log('Validando autenticação...');
      
      // Aguarda um pouco para a página carregar
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      console.log(`URL atual: ${currentUrl}`);

      // Verifica se ainda está na página de login (indica falha)
      if (currentUrl.includes('/login')) {
        // Verifica se há mensagem de erro
        const errorMessage = await page.evaluate(() => {
          const errorElements = document.querySelectorAll('.error, .alert-danger, .invalid-feedback, [class*="error"]');
          if (errorElements.length > 0) {
            return errorElements[0].textContent.trim();
          }
          return null;
        });

        throw new ScraperError(
          `Autenticação falhou: ${errorMessage || 'Credenciais inválidas'}`,
          ErrorTypes.AUTH_ERROR,
          ErrorCodes.AUTH_ERROR,
          'Verifique se o email e senha estão corretos'
        );
      }

      // Verifica presença de elementos que indicam autenticação bem-sucedida
      const authenticatedSelectors = [
        'a[href*="logout"]',
        'button:has-text("Sair")',
        '.user-menu',
        '.navbar-user',
        '[class*="user-profile"]',
        '[class*="dashboard"]'
      ];

      let isAuthenticated = false;
      for (const selector of authenticatedSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          isAuthenticated = true;
          console.log(`Autenticação validada com seletor: ${selector}`);
          break;
        } catch (e) {
          continue;
        }
      }

      // Se não encontrou elementos específicos, verifica se saiu da página de login
      if (!isAuthenticated && !currentUrl.includes('/login')) {
        isAuthenticated = true;
        console.log('Autenticação validada por mudança de URL');
      }

      if (!isAuthenticated) {
        throw new ScraperError(
          'Não foi possível validar a autenticação',
          ErrorTypes.AUTH_ERROR,
          ErrorCodes.AUTH_ERROR,
          'A página não apresenta elementos esperados após login'
        );
      }

      console.log('✓ Login realizado com sucesso!');
      return true;
    } catch (error) {
      if (error instanceof ScraperError) {
        throw error;
      }
      
      throw new ScraperError(
        `Erro ao validar login: ${error.message}`,
        ErrorTypes.AUTH_ERROR,
        ErrorCodes.AUTH_ERROR,
        'Falha na validação de autenticação'
      );
    }
  }
}

module.exports = SelectyAuthenticator;
