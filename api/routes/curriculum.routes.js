const express = require('express');
const router = express.Router();
const curriculumController = require('../controllers/curriculum.controller');

/**
 * @route POST /api/curriculum
 * @description Cria um novo currículo no Selecty
 * @access Protected (requires API key)
 * @body {
 *   nome: string (obrigatório) - Nome completo da pessoa
 *   cpf: string (obrigatório) - CPF com ou sem formatação
 *   email: string (obrigatório) - E-mail principal
 *   dataNascimento: string (opcional) - Data no formato DD/MM/YYYY
 *   genero: string (opcional) - "mulher", "homem" ou "nao_informar"
 *   telefoneFixo: string (opcional) - Telefone fixo
 *   celular: string (opcional) - Celular
 *   emailSecundario: string (opcional) - E-mail secundário
 *   site: string (opcional) - Site pessoal
 *   cep: string (opcional) - CEP
 *   rua: string (opcional) - Rua/Logradouro
 *   numero: string (opcional) - Número
 *   bairro: string (opcional) - Bairro
 *   pais: string (opcional) - País (default: Brasil)
 *   estado: string (opcional) - Estado (sigla ou nome)
 *   cidade: string (opcional) - Cidade
 *   referencias: string (opcional) - Texto de referências
 * }
 */
router.post('/', curriculumController.create);

/**
 * @route GET /api/curriculum/status
 * @description Retorna o status atual do serviço de criação de currículos
 * @access Protected (requires API key)
 */
router.get('/status', curriculumController.getStatus);

/**
 * @route GET /api/curriculum/last
 * @description Retorna o último resultado de criação de currículo
 * @access Protected (requires API key)
 */
router.get('/last', curriculumController.getLastResult);

module.exports = router;
