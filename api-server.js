/**
 * API Server para Integração de Currículo Selecty
 * 
 * Endpoints:
 * - POST /api/curriculum/create - Cria currículo com dados JSON
 * - GET /api/curriculum/schema - Retorna schema de campos
 * - GET /api/health - Health check
 */

require('dotenv').config();
const express = require('express');
const CurriculumAutomation = require('./CurriculumAutomation');
const fieldSchema = require('./scraper/curriculum/field-schema.json');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get Field Schema - Para IA consultar valores permitidos
app.get('/api/curriculum/schema', (req, res) => {
  res.json(fieldSchema);
});

// Get Specific Field Options
app.get('/api/curriculum/options/:field', (req, res) => {
  const { field } = req.params;
  const definitions = fieldSchema.definitions || {};
  
  if (definitions[field] && definitions[field].enum) {
    res.json({
      field,
      options: definitions[field].enum,
      description: definitions[field].description || null
    });
  } else {
    res.status(404).json({ error: `Campo '${field}' não encontrado` });
  }
});

// Create Curriculum
app.post('/api/curriculum/create', async (req, res) => {
  console.log('[API] Recebendo solicitação de criação de currículo...');
  console.log('[API] Dados:', JSON.stringify(req.body, null, 2));
  
  // Validação básica
  const { dados_pessoais, contato } = req.body;
  
  if (!dados_pessoais?.nome) {
    return res.status(400).json({ 
      error: 'Campo obrigatório: dados_pessoais.nome' 
    });
  }
  
  if (!contato?.email || !contato?.celular) {
    return res.status(400).json({ 
      error: 'Campos obrigatórios: contato.email, contato.celular' 
    });
  }
  
  try {
    const automation = new CurriculumAutomation({ 
      headless: process.env.HEADLESS === 'true' 
    });
    
    const result = await automation.createCurriculum(req.body);
    
    if (result.success) {
      console.log('[API] Currículo criado com sucesso:', result.url);
      res.json({
        success: true,
        message: 'Currículo criado com sucesso',
        url: result.url,
        logs: result.logs
      });
    } else {
      console.error('[API] Falha na criação:', result.error);
      res.status(500).json({
        success: false,
        error: result.error || 'Falha na criação do currículo',
        logs: result.logs
      });
    }
    
  } catch (error) {
    console.error('[API] Erro:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('[API] Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║     SELECTY CURRICULUM API SERVER                          ║
╠════════════════════════════════════════════════════════════╣
║  🚀 Servidor rodando em http://localhost:${PORT}              ║
║                                                            ║
║  Endpoints:                                                ║
║  • GET  /api/health              - Health check            ║
║  • GET  /api/curriculum/schema   - Schema de campos        ║
║  • GET  /api/curriculum/options/:field - Opções de campo   ║
║  • POST /api/curriculum/create   - Criar currículo         ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
