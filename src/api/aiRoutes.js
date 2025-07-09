const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const databaseService = require('../services/database');
const { authenticateUser } = require('../services/authMiddleware');

/**
 * POST /api/ai/generate-ideas
 * Generate ideas using AI based on user prompt and categories
 */
router.post('/generate-ideas', authenticateUser, async (req, res) => {
    try {
        const { prompt, categoryIds = [], options = {} } = req.body;
        
        // Validate input
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return res.status(400).json({
                error: 'Prompt is required and must be a non-empty string'
            });
        }
        
        if (prompt.length > 1000) {
            return res.status(400).json({
                error: 'Prompt must be less than 1000 characters'
            });
        }
        
        // Fetch categories if provided
        let categories = [];
        if (categoryIds.length > 0) {
            try {
                categories = await databaseService.getCategoriesByIds(categoryIds);
            } catch (error) {
                console.error('Error fetching categories:', error);
                return res.status(400).json({
                    error: 'Invalid category IDs provided'
                });
            }
        }
        
        // Generate ideas using AI service
        const result = await aiService.generateIdeas(prompt, categories, options);
        
        // Log the generation for analytics (optional)
        console.log(`Ideas generated for user ${req.user.id}: ${prompt.substring(0, 50)}...`);
        
        res.json({
            success: true,
            data: result,
            prompt: prompt,
            categories: categories.map(cat => ({ id: cat.id, name: cat.name }))
        });
        
    } catch (error) {
        console.error('AI generation error:', error);
        res.status(500).json({
            error: error.message || 'Failed to generate ideas'
        });
    }
});

/**
 * POST /api/ai/test-connection
 * Test OpenAI API connectivity
 */
router.post('/test-connection', authenticateUser, async (req, res) => {
    try {
        const result = await aiService.testConnection();
        res.json(result);
    } catch (error) {
        console.error('AI connection test error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Connection test failed'
        });
    }
});

/**
 * GET /api/ai/config
 * Get AI service configuration (without sensitive data)
 */
router.get('/config', authenticateUser, async (req, res) => {
    try {
        const validation = aiService.validateConfiguration();
        
        // Remove sensitive information
        const safeConfig = {
            model: validation.config.model,
            maxTokens: validation.config.maxTokens,
            temperature: validation.config.temperature,
            timeout: validation.config.timeout,
            maxRetries: validation.config.maxRetries,
            retryDelay: validation.config.retryDelay,
            hasApiKey: !!process.env.OPENAI_API_KEY
        };
        
        res.json({
            valid: validation.valid,
            issues: validation.issues,
            config: safeConfig
        });
        
    } catch (error) {
        console.error('AI config error:', error);
        res.status(500).json({
            error: 'Failed to get configuration'
        });
    }
});

/**
 * POST /api/ai/construct-prompt
 * Test prompt construction without making API calls
 */
router.post('/construct-prompt', authenticateUser, async (req, res) => {
    try {
        const { prompt, categoryIds = [], options = {} } = req.body;
        
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({
                error: 'Prompt is required and must be a string'
            });
        }
        
        // Fetch categories if provided
        let categories = [];
        if (categoryIds.length > 0) {
            try {
                categories = await databaseService.getCategoriesByIds(categoryIds);
            } catch (error) {
                console.error('Error fetching categories:', error);
                return res.status(400).json({
                    error: 'Invalid category IDs provided'
                });
            }
        }
        
        // Construct prompt without making API call
        const constructedPrompt = aiService.constructPrompt(prompt, categories, options);
        
        res.json({
            success: true,
            originalPrompt: prompt,
            constructedPrompt,
            categories: categories.map(cat => ({ id: cat.id, name: cat.name })),
            options
        });
        
    } catch (error) {
        console.error('Prompt construction error:', error);
        res.status(500).json({
            error: error.message || 'Failed to construct prompt'
        });
    }
});

module.exports = router; 