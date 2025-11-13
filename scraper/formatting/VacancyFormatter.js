class VacancyFormatter {
  /**
   * Gera separador visual
   * @param {number} length - Comprimento do separador
   * @returns {string} String com caracteres de separação
   */
  generateSeparator(length = 30) {
    return '━'.repeat(length);
  }

  /**
   * Formata uma única vaga no padrão especificado
   * @param {Object} vacancy - Dados da vaga
   * @returns {string} Texto formatado da vaga
   */
  formatVacancy(vacancy) {
    const separator = this.generateSeparator(9);
    const title = 'RESUMO DA VAGA';
    const heale = 'RESUMO DA VAGA';
    const header = `${separator}${title}${separator}`;
    const footer = separator;

    const formattedText = `${header}
Cargo: ${vacancy.cargo}
Empresa: ${vacancy.empresa}
Status: ${vacancy.statusVaga}
Salário: ${vacancy.salario}
Jornada: ${vacancy.jornada}
Tipo de contrato: ${vacancy.tipoContrato}
Benefícios: ${vacancy.beneficios}

Descrição das atividades:
${vacancy.descricaoAtividades}

Experiências e qualificações:
${vacancy.experienciasQualificacoes}

Escolaridade: ${vacancy.escolaridade}
Nível de atuação: ${vacancy.nivelAtuacao}
Área de atuação: ${vacancy.areaAtuacao}
Local: ${vacancy.local}
Observações: ${vacancy.observacoes}
${footer}`;

    return formattedText;
  }

  /**
   * Formata múltiplas vagas com separadores entre elas
   * @param {Array} vacancies - Array de vagas
   * @returns {string} Texto formatado de todas as vagas
   */
  formatAllVacancies(vacancies) {
    if (!vacancies || vacancies.length === 0) {
      return '';
    }

    const divider = '_'.repeat(30);
    
    return vacancies
      .map(vacancy => this.formatVacancy(vacancy))
      .join(`\n${divider}\n\n`);
  }

  /**
   * Adiciona texto formatado a cada objeto de vaga
   * @param {Array} vacancies - Array de vagas
   * @returns {Array} Array de vagas com campo formattedText
   */
  addFormattedTextToVacancies(vacancies) {
    return vacancies.map(vacancy => ({
      ...vacancy,
      formattedText: this.formatVacancy(vacancy)
    }));
  }
}

module.exports = VacancyFormatter;
