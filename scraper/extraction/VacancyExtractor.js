const {
  ScraperError,
  ErrorTypes,
  ErrorCodes,
} = require("../config/ErrorCodes");

class VacancyExtractor {
  constructor(config) {
    this.config = config;
    const configData = config.getConfig();
    this.timeout = configData.scraper.timeout;
    this.maxRetries = 3;
    this.retryDelay = 2000;
  }

  /**
   * Extrai todas as vagas da página (com suporte a paginação)
   * @param {Page} page - Instância da página do Puppeteer
   * @param {number} totalVacancies - Número total de vagas esperadas
   * @param {number} maxVacancies - Limite máximo de vagas a extrair (0 = sem limite)
   * @returns {Promise<Array>} Array com dados de todas as vagas
   */
  async extractAllVacancies(page, totalVacancies, maxVacancies = 0) {
    const vacancies = [];
    let successCount = 0;
    let errorCount = 0;
    let currentPage = 1;

    const limitInfo =
      maxVacancies > 0 ? ` (LIMITE: ${maxVacancies} vagas)` : "";
    console.log(
      `\nIniciando extração de ${totalVacancies} vagas...${limitInfo}`
    );

    while (true) {
      // Verificar se atingiu o limite de vagas
      if (maxVacancies > 0 && vacancies.length >= maxVacancies) {
        console.log(
          `\n🎯 Limite de ${maxVacancies} vagas atingido. Parando extração.`
        );
        break;
      }
      // Contar quantas linhas existem na página atual
      const rowsInPage = await page.evaluate(() => {
        return document.querySelectorAll("tbody tr").length;
      });

      console.log(`\n📄 Página ${currentPage}: ${rowsInPage} vagas visíveis`);

      if (rowsInPage === 0) {
        console.log("Nenhuma vaga encontrada na página atual, finalizando...");
        break;
      }

      // Extrair vagas da página atual
      for (let index = 0; index < rowsInPage; index++) {
        // Verificar se atingiu o limite de vagas
        if (maxVacancies > 0 && vacancies.length >= maxVacancies) {
          console.log(
            `\n🎯 Limite de ${maxVacancies} vagas atingido. Parando extração.`
          );
          break;
        }

        try {
          const vagaNum = vacancies.length + errorCount + 1;
          console.log(`\n[${vagaNum}/${totalVacancies}] Processando vaga...`);

          // Verificar se a linha ainda existe (pode ter mudado)
          const rowExists = await page.evaluate((idx) => {
            return !!document.querySelector(`tbody tr:nth-child(${idx + 1})`);
          }, index);

          if (!rowExists) {
            console.warn(`⚠ Linha ${index + 1} não existe mais, pulando...`);
            errorCount++;
            continue;
          }

          // Primeiro extrair o status da vaga antes de abrir o modal
          const statusVaga = await this.extractVacancyStatus(page, index);
          console.log(`  Status da vaga: ${statusVaga}`);

          // Extrair o selecionador responsável da linha
          const selecionadorResponsavel =
            await this.extractSelecionadorResponsavel(page, index);
          console.log(`  Selecionador responsável: ${selecionadorResponsavel}`);

          // Abrir modal e obter título esperado
          const modalResult = await this.openVacancyModal(page, index);
          if (!modalResult.success) {
            console.warn(
              `⚠ Não foi possível abrir modal da vaga ${vagaNum}, pulando...`
            );
            errorCount++;
            continue;
          }

          // CRÍTICO: Aguardar o conteúdo do modal mudar para a vaga correta
          const contentChanged = await this.waitForModalContentChange(
            page,
            modalResult.expectedTitle
          );
          if (!contentChanged) {
            console.warn(
              `⚠ Conteúdo do modal não atualizou para vaga ${vagaNum}, pulando...`
            );
            await this.closeModal(page);
            errorCount++;
            continue;
          }

          const vacancyData = await this.extractVacancyDetails(page);

          // Adicionar o status e selecionador responsável aos dados da vaga
          vacancyData.statusVaga = statusVaga;
          vacancyData.selecionadorResponsavel = selecionadorResponsavel;

          await this.closeModal(page);

          vacancies.push(vacancyData);
          successCount++;
          console.log(
            `✓ Vaga ${vagaNum} extraída: ${vacancyData.cargo} (${statusVaga})`
          );

          // Pequeno delay entre extrações para evitar sobrecarga
          await this.sleep(500);
        } catch (error) {
          console.error(`✗ Erro ao extrair vaga: ${error.message}`);
          errorCount++;

          // Tentar fechar modal se estiver aberto
          try {
            await this.closeModal(page);
          } catch (e) {
            // Ignorar erro ao fechar
          }

          // Continuar com a próxima vaga
          continue;
        }
      }

      // Verificar se há próxima página
      const hasNextPage = await this.goToNextPage(page);
      if (!hasNextPage) {
        console.log("\n📄 Não há mais páginas para processar");
        break;
      }

      currentPage++;
      await this.sleep(2000); // Aguardar página carregar
    }

    console.log(
      `\n✓ Extração concluída: ${successCount} vagas extraídas, ${errorCount} erros`
    );

    if (vacancies.length === 0) {
      throw new ScraperError(
        "Nenhuma vaga foi extraída com sucesso",
        ErrorTypes.EXTRACTION_ERROR,
        ErrorCodes.EXTRACTION_ERROR,
        "Verifique se a estrutura da página mudou"
      );
    }

    return vacancies;
  }

  /**
   * Navega para a próxima página de vagas
   * @param {Page} page - Instância da página do Puppeteer
   * @returns {Promise<boolean>} True se navegou para próxima página
   */
  async goToNextPage(page) {
    try {
      // Procurar botão de próxima página
      const nextPageSelectors = [
        'a[aria-label="Next"]',
        'button[aria-label="Next"]',
        ".pagination .next a",
        ".pagination li:last-child a",
        'a:has-text("Próximo")',
        'a:has-text(">")',
        '[class*="next"]',
        ".page-item:last-child a",
      ];

      for (const selector of nextPageSelectors) {
        try {
          const nextButton = await page.$(selector);
          if (nextButton) {
            // Verificar se o botão está habilitado
            const isDisabled = await page.evaluate((sel) => {
              const btn = document.querySelector(sel);
              if (!btn) return true;
              return (
                btn.classList.contains("disabled") ||
                btn.hasAttribute("disabled") ||
                btn.parentElement?.classList.contains("disabled")
              );
            }, selector);

            if (!isDisabled) {
              console.log(
                `\n📄 Navegando para próxima página usando: ${selector}`
              );
              await page.click(selector);
              await this.sleep(2000);

              // Aguardar tabela recarregar
              await page.waitForSelector("tbody tr", {
                visible: true,
                timeout: 10000,
              });
              return true;
            }
          }
        } catch (e) {
          continue;
        }
      }

      return false;
    } catch (error) {
      console.warn(`⚠ Erro ao navegar para próxima página: ${error.message}`);
      return false;
    }
  }

  /**
   * Extrai o status da vaga da linha da tabela
   * @param {Page} page - Instância da página do Puppeteer
   * @param {number} rowIndex - Índice da linha da vaga (0-based)
   * @returns {Promise<string>} Status da vaga
   */
  async extractVacancyStatus(page, rowIndex) {
    try {
      const rowNumber = rowIndex + 1; // Converter para 1-based

      // Extrair o status da vaga usando o seletor da linha no tbody
      const status = await page.evaluate((rowNum) => {
        // Buscar especificamente no tbody para evitar pegar o thead
        const row = document.querySelector(`tbody tr:nth-child(${rowNum})`);
        if (!row) {
          return "Status não encontrado";
        }

        // Procurar pelo span com a classe específica do status
        const statusSpan = row.querySelector(
          "span.totalVacanciesList_title-status-new"
        );
        if (statusSpan) {
          return statusSpan.textContent.trim();
        }

        // Se não encontrar o span específico, procurar por outros spans de status
        const statusSpans = row.querySelectorAll(
          'span[class*="status"], span.badge'
        );
        if (statusSpans.length > 0) {
          return statusSpans[0].textContent.trim();
        }

        // Se não encontrar nenhum status, retornar padrão
        return "Status não informado";
      }, rowNumber);

      return status;
    } catch (error) {
      console.warn(
        `⚠ Erro ao extrair status da vaga ${rowIndex + 1}: ${error.message}`
      );
      return "Erro ao extrair status";
    }
  }

  /**
   * Extrai o nome do selecionador responsável da linha da tabela
   * Estrutura HTML esperada:
   * <div style="line-height: 1.1rem;">
   *   <small>Selecionador responsável:</small><br>
   *   <span style="color: rgb(67, 101, 116);"><strong>Nome</strong></span>
   * </div>
   * @param {Page} page - Instância da página do Puppeteer
   * @param {number} rowIndex - Índice da linha da vaga (0-based)
   * @returns {Promise<string>} Nome do selecionador responsável
   */
  async extractSelecionadorResponsavel(page, rowIndex) {
    try {
      const rowNumber = rowIndex + 1; // Converter para 1-based

      // Extrair o selecionador responsável usando o seletor da linha no tbody
      const selecionador = await page.evaluate((rowNum) => {
        // Buscar especificamente no tbody para evitar pegar o thead
        const row = document.querySelector(`tbody tr:nth-child(${rowNum})`);
        if (!row) {
          return 'Selecionador não encontrado';
        }

        // Abordagem 1: Buscar pelo <small> que contém "Selecionador responsável:"
        // e pegar o <strong> que está no próximo span
        const smallElements = row.querySelectorAll('small');
        for (const small of smallElements) {
          if (small.textContent.toLowerCase().includes('selecionador')) {
            // O nome está no <strong> dentro do <span> que vem após o <small>
            const parentDiv = small.parentElement;
            if (parentDiv) {
              const strongElement = parentDiv.querySelector('strong');
              if (strongElement) {
                return strongElement.textContent.trim();
              }
              // Fallback: buscar span com cor específica
              const spanElement = parentDiv.querySelector('span[style*="color"]');
              if (spanElement) {
                return spanElement.textContent.trim();
              }
            }
          }
        }

        // Abordagem 2: Buscar diretamente por divs com "Selecionador responsável"
        const allDivs = row.querySelectorAll('div');
        for (const div of allDivs) {
          const html = div.innerHTML || '';
          if (html.toLowerCase().includes('selecionador') && html.includes('<strong>')) {
            const strongMatch = html.match(/<strong>([^<]+)<\/strong>/i);
            if (strongMatch) {
              return strongMatch[1].trim();
            }
          }
        }

        // Abordagem 3: Regex no texto completo da linha
        const fullText = row.innerText || '';
        // Procurar padrão: "Selecionador responsável:" seguido do nome na próxima linha
        const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes('selecionador')) {
            // O nome geralmente está na linha seguinte
            if (lines[i + 1] && lines[i + 1].length > 0 && lines[i + 1].length < 50) {
              return lines[i + 1];
            }
          }
        }

        // Se não encontrar nenhum selecionador, retornar padrão
        return 'Não informado';
      }, rowNumber);

      return selecionador;
    } catch (error) {
      console.warn(
        `⚠ Erro ao extrair selecionador da vaga ${rowIndex + 1}: ${error.message}`
      );
      return 'Erro ao extrair selecionador';
    }
  }

  /**
   * Abre o modal de detalhes de uma vaga
   * @param {Page} page - Instância da página do Puppeteer
   * @param {number} rowIndex - Índice da linha da vaga (0-based)
   * @returns {Promise<Object>} Objeto com success e expectedTitle
   */
  async openVacancyModal(page, rowIndex) {
    try {
      const rowNumber = rowIndex + 1; // Converter para 1-based
      console.log(`Abrindo modal da vaga ${rowNumber}...`);

      // Passo 1: Capturar o título esperado da vaga ANTES de abrir o modal
      const expectedTitle = await page.evaluate((rowNum) => {
        const row = document.querySelector(`tbody tr:nth-child(${rowNum})`);
        if (!row) return null;

        // Procurar especificamente pelo cargo (geralmente está em um elemento com classe específica)
        // Tentar múltiplos seletores para encontrar o cargo
        let cargo = null;

        // Tentar pegar de um span ou div com classe específica
        const cargoElement = row.querySelector(
          '[class*="cargo"], [class*="title"], [class*="job"]'
        );
        if (cargoElement) {
          cargo = cargoElement.textContent.trim();
        }

        // Se não encontrou, pegar o primeiro texto significativo da linha
        if (!cargo) {
          const allText = row.textContent.trim();
          // Procurar por padrão: "# 370 Marceneiro, 1 Posição..."
          // Extrair apenas o cargo (palavra após o número)
          const match = allText.match(/#\s*\d+\s+([^,]+)/);
          if (match) {
            cargo = match[1].trim();
          }
        }

        return cargo;
      }, rowNumber);

      if (!expectedTitle) {
        throw new Error(
          "Não foi possível identificar o título da vaga na tabela"
        );
      }

      console.log(`  Título esperado: "${expectedTitle}"`);

      // Fechar qualquer dropdown/modal que possa estar aberto
      await page.keyboard.press("Escape");
      await this.sleep(300);

      // Scroll para garantir que a linha está visível
      await page.evaluate((rowNum) => {
        const row = document.querySelector(`tbody tr:nth-child(${rowNum})`);
        if (row) {
          row.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, rowNumber);
      await this.sleep(300);

      // Clicar no ícone de menu (três pontos) da linha no tbody
      const menuIconSelectors = [
        `tbody tr:nth-child(${rowNumber}) i.fas.fa-ellipsis-v`,
        `tbody tr:nth-child(${rowNumber}) i.fas`,
        `tbody tr:nth-child(${rowNumber}) i.fa`,
        `tbody tr:nth-child(${rowNumber}) i.fa-ellipsis-v`,
        `tbody tr:nth-child(${rowNumber}) button i`,
        `tbody tr:nth-child(${rowNumber}) .dropdown-toggle`,
        `tbody tr:nth-child(${rowNumber}) [data-toggle="dropdown"]`,
        `tbody tr:nth-child(${rowNumber}) button.btn-link`,
        `tbody tr:nth-child(${rowNumber}) td:last-child button`,
        `tbody tr:nth-child(${rowNumber}) td:last-child i`,
      ];

      let menuClicked = false;
      for (const menuSelector of menuIconSelectors) {
        try {
          const exists = await page.$(menuSelector);
          if (exists) {
            console.log(`  Tentando ícone de menu: ${menuSelector}`);
            await page.click(menuSelector);
            menuClicked = true;
            console.log(`  ✓ Menu clicado`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!menuClicked) {
        throw new Error("Não foi possível clicar no ícone de menu");
      }

      // Passo 2: Aguardar dropdown abrir
      console.log(`  Aguardando dropdown abrir...`);
      await this.sleep(1000);

      // Verificar se dropdown abriu
      const dropdownOpen = await page.evaluate((rowNum) => {
        const row = document.querySelector(`tbody tr:nth-child(${rowNum})`);
        if (!row) return false;
        const dropdown = row.querySelector(
          '.dropdown-menu.show, .dropdown-menu[style*="display: block"], ul.show, .show .dropdown-menu'
        );
        return !!dropdown;
      }, rowNumber);

      if (!dropdownOpen) {
        console.log(`  ⚠ Dropdown não abriu, tentando clicar novamente...`);
        // Tentar clicar novamente no menu
        for (const menuSelector of menuIconSelectors) {
          try {
            await page.click(menuSelector);
            await this.sleep(1000);
            break;
          } catch (e) {
            continue;
          }
        }
      }

      // Passo 3: Clicar em "Informações da vaga" - tentar múltiplas abordagens
      console.log(`  Procurando botão "Informações da vaga"...`);

      let infoClicked = false;

      // Abordagem 1: Seletor específico da linha (múltiplas variações)
      const infoButtonSelectors = [
        `tbody tr:nth-child(${rowNumber}) ul > div:nth-of-type(2) button`,
        `tbody tr:nth-child(${rowNumber}) .dropdown-menu button:nth-of-type(2)`,
        `tbody tr:nth-child(${rowNumber}) .dropdown-menu > div:nth-of-type(2) button`,
        `tbody tr:nth-child(${rowNumber}) .dropdown-menu li:nth-child(2) button`,
        `tbody tr:nth-child(${rowNumber}) .dropdown-menu li:nth-child(2) a`,
        `tbody tr:nth-child(${rowNumber}) .dropdown-menu li:nth-child(2)`,
        `tbody tr:nth-child(${rowNumber}) [aria-label*="Informações"]`,
        `tbody tr:nth-child(${rowNumber}) .show button:nth-of-type(2)`,
        `tbody tr:nth-child(${rowNumber}) ul.show > div:nth-of-type(2) button`,
      ];

      for (const selector of infoButtonSelectors) {
        try {
          await page.waitForSelector(selector, {
            visible: true,
            timeout: 1500,
          });
          console.log(
            `  Clicando em "Informações da vaga" com seletor: ${selector}`
          );
          await page.click(selector);
          infoClicked = true;
          console.log(`  ✓ Botão clicado`);
          break;
        } catch (e) {
          continue;
        }
      }

      // Abordagem 2: Buscar por texto DENTRO da linha específica
      if (!infoClicked) {
        console.log(`  Tentando encontrar por texto na linha ${rowNumber}...`);
        infoClicked = await page.evaluate((rowNum) => {
          // Buscar dropdown DENTRO da linha específica
          const row = document.querySelector(`tbody tr:nth-child(${rowNum})`);
          if (!row) return false;

          // Procurar dropdown dentro da linha (múltiplos seletores)
          const dropdownSelectors = [
            ".dropdown-menu.show",
            ".dropdown-menu",
            "ul.dropdown-menu",
            "ul.show",
            ".show ul",
            '[class*="dropdown"]',
          ];

          let dropdown = null;
          for (const sel of dropdownSelectors) {
            dropdown = row.querySelector(sel);
            if (dropdown) break;
          }

          if (dropdown) {
            const buttons = dropdown.querySelectorAll(
              "button, a, li, div, span"
            );
            for (const btn of buttons) {
              const text = btn.textContent.trim().toLowerCase();
              if (
                text.includes("informações") ||
                text.includes("informacoes") ||
                text === "info"
              ) {
                btn.click();
                return true;
              }
            }
          }

          // Fallback: procurar qualquer elemento clicável na linha com texto de informações
          const allClickable = row.querySelectorAll(
            'button, a, [role="button"], [onclick]'
          );
          for (const el of allClickable) {
            const text = el.textContent.trim().toLowerCase();
            if (text.includes("informações") || text.includes("informacoes")) {
              el.click();
              return true;
            }
          }

          return false;
        }, rowNumber);
      }

      if (!infoClicked) {
        throw new Error('Botão "Informações da vaga" não encontrado');
      }

      console.log(`  Aguardando modal...`);

      // Passo 4: Aguardar modal aparecer
      const modalSelectors = [
        ".modal-dialog",
        ".modal-content",
        '[role="dialog"]',
        ".modal",
        '[class*="modal"]',
      ];

      let modalFound = false;
      for (const selector of modalSelectors) {
        try {
          await page.waitForSelector(selector, {
            visible: true,
            timeout: 2000,
          });
          console.log(`  Modal encontrado com seletor: ${selector}`);
          modalFound = true;
          break;
        } catch (e) {
          continue;
        }
      }

      if (!modalFound) {
        throw new Error("Modal não apareceu após clicar no botão");
      }

      console.log(`✓ Modal da vaga ${rowNumber} aberto`);
      return { success: true, expectedTitle };
    } catch (error) {
      console.error(`✗ Erro ao abrir modal: ${error.message}`);
      return { success: false, expectedTitle: null };
    }
  }

  /**
   * Aguarda o conteúdo do modal mudar para a vaga correta
   * @param {Page} page - Instância da página do Puppeteer
   * @param {string} expectedTitle - Título esperado da vaga
   * @param {number} maxAttempts - Número máximo de tentativas
   * @returns {Promise<boolean>} True se o conteúdo mudou
   */
  async waitForModalContentChange(page, expectedTitle, maxAttempts = 20) {
    console.log(`  Aguardando modal atualizar para: "${expectedTitle}"...`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Extrair o título atual do modal
        const currentTitle = await page.evaluate(() => {
          // Procurar pelo campo "Título da Vaga" no modal
          const modalElement = document.querySelector('[class*="modal"]');
          if (!modalElement) return null;

          const fullText = modalElement.innerText || "";

          // Tentar extrair o título da vaga do texto
          const match = fullText.match(
            /Título da Vaga:\s*(.+?)\s+(?:Tipo de Requisição|$)/
          );
          if (match) {
            return match[1].trim();
          }

          // Fallback: pegar o primeiro h4 ou h3
          const header = modalElement.querySelector("h4, h3");
          if (header) {
            return header.textContent.trim();
          }

          return null;
        });

        if (currentTitle) {
          console.log(
            `  [Tentativa ${attempt}/${maxAttempts}] Título atual: "${currentTitle}"`
          );

          // Verificar se o título contém parte do título esperado ou vice-versa
          // (às vezes o título na tabela é abreviado)
          const titleMatch =
            currentTitle.toLowerCase().includes(expectedTitle.toLowerCase()) ||
            expectedTitle.toLowerCase().includes(currentTitle.toLowerCase());

          if (titleMatch) {
            console.log(`  ✓ Conteúdo do modal atualizado corretamente!`);
            return true;
          }
        }

        // Aguardar antes da próxima tentativa
        await this.sleep(300);
      } catch (error) {
        console.warn(`  ⚠ Erro na tentativa ${attempt}: ${error.message}`);
      }
    }

    console.warn(
      `  ⚠ Timeout: Modal não atualizou após ${maxAttempts} tentativas`
    );
    return false;
  }

  /**
   * Extrai detalhes da vaga do modal
   * @param {Page} page - Instância da página do Puppeteer
   * @returns {Promise<Object>} Dados da vaga
   */
  async extractVacancyDetails(page) {
    try {
      // Aguardar modal estar completamente carregado - tentar múltiplos seletores
      const modalSelectors = [
        '[class*="modal"]',
        ".modal-dialog",
        ".modal-content",
        ".modal",
        '[role="dialog"]',
        'div:has(h4:contains("Detalhes da vaga"))',
      ];
      let modal = null;

      for (const selector of modalSelectors) {
        try {
          if (selector.includes("contains")) {
            // Para seletores com :contains, verificar se existe
            const exists = await page.evaluate(() => {
              const headers = Array.from(document.querySelectorAll("h4"));
              const detailsHeader = headers.find((h) =>
                h.textContent.includes("Detalhes da vaga")
              );
              return detailsHeader ? detailsHeader.closest("div") : null;
            });
            if (exists) {
              modal = "div"; // Usar div genérico e buscar pelo evaluate
              console.log(`  Modal encontrado via texto "Detalhes da vaga"`);
              break;
            }
          } else {
            await page.waitForSelector(selector, {
              visible: true,
              timeout: 2000,
            });
            modal = selector;
            console.log(`  Modal encontrado com seletor: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!modal) {
        // Debug: listar todos os elementos visíveis
        const debugInfo = await page.evaluate(() => {
          const allElements = Array.from(document.querySelectorAll("*")).filter(
            (el) => {
              const style = window.getComputedStyle(el);
              return style.display !== "none" && style.visibility !== "hidden";
            }
          );

          return {
            modalClasses: Array.from(
              document.querySelectorAll('[class*="modal"]')
            ).map((el) => el.className),
            dialogElements: Array.from(
              document.querySelectorAll('[role="dialog"]')
            ).length,
            h4Elements: Array.from(document.querySelectorAll("h4")).map(
              (h) => h.textContent
            ),
            totalVisible: allElements.length,
          };
        });

        console.log(
          "  Debug - elementos encontrados:",
          JSON.stringify(debugInfo, null, 2)
        );
        throw new Error("Modal não encontrado com nenhum seletor");
      }

      // Extrair todo o conteúdo do modal
      const modalData = await page.evaluate((modalSelector) => {
        let modalElement;

        if (modalSelector === "div") {
          // Buscar div que contém "Detalhes da vaga"
          const headers = Array.from(document.querySelectorAll("h4"));
          const detailsHeader = headers.find((h) =>
            h.textContent.includes("Detalhes da vaga")
          );
          modalElement = detailsHeader ? detailsHeader.closest("div") : null;

          // Se não encontrar, tentar buscar por modal classes
          if (!modalElement) {
            modalElement = document.querySelector('[class*="modal"]');
          }
        } else {
          modalElement = document.querySelector(modalSelector);
        }

        if (!modalElement) {
          throw new Error(`Modal não encontrado com seletor: ${modalSelector}`);
        }

        // Extrair título da vaga para debug
        const titleElement = modalElement.querySelector("h4, h3, h2, h1");
        const title = titleElement
          ? titleElement.textContent.trim()
          : "Título não encontrado";

        return {
          fullText: modalElement.innerText || "",
          html: modalElement.innerHTML || "",
          className: modalElement.className || "",
          debugTitle: title,
        };
      }, modal);

      console.log(`  DEBUG: Título do modal: ${modalData.debugTitle}`);
      console.log(
        `  Conteúdo extraído (${modalData.fullText.length} chars), parseando campos...`
      );

      // Parsear campos do texto extraído
      const vacancyData = this.parseVacancyFields(modalData.fullText);

      return vacancyData;
    } catch (error) {
      throw new Error(`Erro ao extrair detalhes da vaga: ${error.message}`);
    }
  }

  /**
   * Parseia os campos da vaga a partir do texto do modal
   * @param {string} text - Texto completo do modal
   * @returns {Object} Objeto com campos da vaga
   */
  parseVacancyFields(text) {
    console.log("Parseando campos da vaga...");

    const extractField = (pattern, defaultValue = "—") => {
      try {
        const match = text.match(pattern);
        return match ? match[1].trim() : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    };

    // Extrair cargo (do título)
    const cargo = extractField(/Título da Vaga:\s*(.+?)\s+Tipo de Requisição/);

    // Extrair empresa
    const empresa = extractField(
      /Empresa\s+E-mail\s+Telefone\n[\d\s]+\t[\d\s]+\t(.+?)\t/
    );

    // Extrair salário
    const salario = extractField(/Salário\n\n(.+?)\n/);

    // Extrair jornada
    const jornada = extractField(/Jornada\n\n(.+?)\n/);

    // Extrair tipo de contrato
    const tipoContrato = extractField(/Tipo de contrato\n\n(.+?)\n/);

    // Extrair benefícios (texto completo até próxima seção)
    const beneficios = extractField(
      /Benefícios da Vaga\n(.+?)(?=\nJustificativa)/s
    );

    // Extrair descrição das atividades
    const descricaoAtividades = extractField(
      /Descrição das atividades que o profissional irá realizar\n(.+?)(?=\nRequisitos)/s
    );

    // Extrair requisitos (equivalente a experiências e qualificações)
    const experienciasQualificacoes = extractField(
      /Requisitos\n(.+?)(?=\nObservações)/s
    );

    // Extrair observações
    const observacoes = extractField(/Observações\n(.+?)(?=\nCEP)/s);

    // Extrair endereço completo
    const cep = extractField(/CEP\s+Endereço\s+Complemento\n(.+?)\t/);
    const endereco = extractField(
      /CEP\s+Endereço\s+Complemento\n[^\t]+\t(.+?)\t/
    );
    const bairro = extractField(/Bairro\s+Cidade\s+UF\n(.+?)\t/);
    const cidade = extractField(/Bairro\s+Cidade\s+UF\n[^\t]+\t(.+?)\t/);
    const uf = extractField(/Bairro\s+Cidade\s+UF\n[^\t]+\t[^\t]+\t(.+?)\n/);

    const local = `${endereco}, ${bairro}, ${cidade} - ${uf}`;

    // Extrair escolaridade (pode estar vazio)
    const escolaridade = extractField(
      /Escolaridade\nNível\s+Curso\s+Situação\s+Tempo de formado\s+Importância\n(.+?)(?=\nConhecimentos)/s
    );

    // Extrair nível de atuação
    const nivelAtuacao = extractField(/Níveis de atuação\n(.+?)\n/);

    // Extrair área de atuação
    const areaAtuacao = extractField(/Áreas de atuação\n(.+?)\n/);

    return {
      cargo: cargo || "—",
      empresa: empresa || "—",
      salario: salario || "—",
      jornada: jornada || "—",
      tipoContrato: tipoContrato || "—",
      beneficios: beneficios || "—",
      descricaoAtividades: descricaoAtividades || "—",
      experienciasQualificacoes: experienciasQualificacoes || "—",
      escolaridade: escolaridade || "—",
      nivelAtuacao: nivelAtuacao || "—",
      areaAtuacao: areaAtuacao || "—",
      local: local || "—",
      observacoes: observacoes || "—",
      statusVaga: "—", // Será preenchido no método principal
    };
  }

  /**
   * Fecha o modal de detalhes
   * @param {Page} page - Instância da página do Puppeteer
   * @returns {Promise<void>}
   */
  async closeModal(page) {
    try {
      // Tentar múltiplos seletores para o botão de fechar
      const closeSelectors = [
        "button.close",
        "button.close > i",
        ".modal-header button",
        '[aria-label*="Close"]',
        '[aria-label*="Fechar"]',
        'button[data-dismiss="modal"]',
        ".close",
      ];

      let closed = false;
      for (const selector of closeSelectors) {
        try {
          console.log(`  Tentando fechar com seletor: ${selector}`);
          await page.waitForSelector(selector, {
            visible: true,
            timeout: 2000,
          });
          await page.click(selector);
          console.log(`  Clicou no botão de fechar`);
          closed = true;
          break;
        } catch (e) {
          continue;
        }
      }

      if (!closed) {
        console.log(`  Tentando fechar com ESC...`);
        await page.keyboard.press("Escape");
      }

      // Aguardar modal desaparecer - tentar múltiplos seletores
      const modalSelectors = [
        ".modal-dialog",
        ".modal-content",
        ".modal",
        '[role="dialog"]',
      ];
      for (const selector of modalSelectors) {
        try {
          await page.waitForSelector(selector, { hidden: true, timeout: 2000 });
          break;
        } catch (e) {
          continue;
        }
      }

      await this.sleep(500);
      console.log("✓ Modal fechado");
    } catch (error) {
      console.warn(
        "⚠ Erro ao fechar modal, tentando ESC como último recurso..."
      );
      try {
        await page.keyboard.press("Escape");
        await this.sleep(500);
      } catch (e) {
        console.warn("⚠ Não foi possível fechar modal, continuando...");
      }
    }
  }

  /**
   * Função auxiliar para aguardar
   * @param {number} ms - Milissegundos para aguardar
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = VacancyExtractor;
