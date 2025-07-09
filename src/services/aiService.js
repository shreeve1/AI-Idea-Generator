const OpenAI = require('openai');

class AIService {
    constructor() {
        // Only initialize OpenAI if API key is provided
        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
        } else {
            this.openai = null;
        }
        
        // Configuration
        this.config = {
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
            temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
            timeout: parseInt(process.env.OPENAI_TIMEOUT) || 30000, // 30 seconds
            maxRetries: parseInt(process.env.OPENAI_MAX_RETRIES) || 3,
            retryDelay: parseInt(process.env.OPENAI_RETRY_DELAY) || 1000, // 1 second
        };
    }

    /**
     * Construct a prompt for idea generation based on user input and category contexts
     * @param {string} userPrompt - The user's input prompt
     * @param {Array} categories - Array of category objects with ai_prompt_context
     * @param {Object} options - Additional options for prompt construction
     * @returns {string} - The constructed prompt
     */
    constructPrompt(userPrompt, categories = [], options = {}) {
        const {
            includeCategories = true,
            maxIdeas = 5,
            creativityLevel = 'balanced', // 'conservative', 'balanced', 'creative'
            format = 'structured' // 'structured', 'bullet', 'paragraph'
        } = options;

        // Base system prompt
        let systemPrompt = `You are an AI assistant specialized in generating creative and practical ideas. Your role is to help users brainstorm innovative solutions, concepts, and approaches based on their input.

Guidelines:
- Generate ${maxIdeas} distinct and actionable ideas
- Ensure ideas are practical and implementable
- Provide brief explanations for each idea
- Consider different perspectives and approaches
- Focus on value and feasibility`;

        // Add creativity level instructions
        switch (creativityLevel) {
            case 'conservative':
                systemPrompt += '\n- Prioritize proven, low-risk approaches\n- Focus on incremental improvements\n- Emphasize practical implementation';
                break;
            case 'creative':
                systemPrompt += '\n- Think outside the box and explore unconventional approaches\n- Consider emerging trends and technologies\n- Embrace innovative and disruptive concepts';
                break;
            default: // balanced
                systemPrompt += '\n- Balance innovation with practicality\n- Mix proven approaches with creative solutions\n- Consider both short-term and long-term possibilities';
        }

        // Add format instructions
        switch (format) {
            case 'bullet':
                systemPrompt += '\n\nFormat your response as a numbered list with brief descriptions.';
                break;
            case 'paragraph':
                systemPrompt += '\n\nFormat your response as flowing paragraphs with detailed explanations.';
                break;
            default: // structured
                systemPrompt += '\n\nFormat your response as a structured list with titles and descriptions for each idea.';
        }

        // Construct category context
        let categoryContext = '';
        if (includeCategories && categories.length > 0) {
            categoryContext = '\n\nRelevant Category Contexts:\n';
            categories.forEach((category, index) => {
                if (category.ai_prompt_context) {
                    categoryContext += `${index + 1}. ${category.name}: ${category.ai_prompt_context}\n`;
                }
            });
            categoryContext += '\nConsider these contexts when generating ideas, but don\'t limit yourself to them.';
        }

        // Construct the main user prompt
        const mainPrompt = `${systemPrompt}${categoryContext}

User Request: ${userPrompt}

Please generate ${maxIdeas} ideas based on this request:`;

        return mainPrompt;
    }

    /**
     * Generate ideas using OpenAI ChatGPT API
     * @param {string} prompt - The user's prompt
     * @param {Array} categories - Array of categories with context
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} - Generated ideas and metadata
     */
    async generateIdeas(prompt, categories = [], options = {}) {
        try {
            // Construct the prompt
            const constructedPrompt = this.constructPrompt(prompt, categories, options);
            
            // Make API call with retry logic
            const response = await this.makeAPICallWithRetry(constructedPrompt);
            
            // Parse and return the response
            return this.parseResponse(response, prompt, categories);
            
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Make API call to OpenAI with retry logic
     * @param {string} prompt - The constructed prompt
     * @returns {Promise<Object>} - OpenAI API response
     */
    async makeAPICallWithRetry(prompt) {
        if (!this.openai) {
            throw new Error('OpenAI client not initialized. Please check your API key configuration.');
        }
        
        let lastError;
        
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
                
                const response = await this.openai.chat.completions.create({
                    model: this.config.model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: this.config.maxTokens,
                    temperature: this.config.temperature,
                }, {
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                return response;
                
            } catch (error) {
                lastError = error;
                
                // Don't retry on certain errors
                if (this.isNonRetryableError(error)) {
                    throw error;
                }
                
                // If this isn't the last attempt, wait before retrying
                if (attempt < this.config.maxRetries) {
                    const delay = this.calculateRetryDelay(attempt);
                    await this.sleep(delay);
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Parse the OpenAI API response
     * @param {Object} response - OpenAI API response
     * @param {string} originalPrompt - The original user prompt
     * @param {Array} categories - Categories used in generation
     * @returns {Object} - Parsed response with ideas and metadata
     */
    parseResponse(response, originalPrompt, categories) {
        try {
            const content = response.choices[0]?.message?.content;
            
            if (!content) {
                throw new Error('No content in API response');
            }

            return {
                success: true,
                generated_content: content,
                metadata: {
                    model: response.model,
                    usage: response.usage,
                    prompt_tokens: response.usage?.prompt_tokens,
                    completion_tokens: response.usage?.completion_tokens,
                    total_tokens: response.usage?.total_tokens,
                    finish_reason: response.choices[0]?.finish_reason,
                    created_at: new Date().toISOString(),
                    original_prompt: originalPrompt,
                    categories_used: categories.map(cat => cat.name),
                    response_id: response.id
                }
            };
            
        } catch (error) {
            throw new Error(`Failed to parse API response: ${error.message}`);
        }
    }

    /**
     * Handle and categorize errors
     * @param {Error} error - The error to handle
     * @returns {Error} - Processed error with additional context
     */
    handleError(error) {
        // API key errors
        if (error.code === 'invalid_api_key' || error.status === 401) {
            return new Error('Invalid OpenAI API key. Please check your configuration.');
        }
        
        // Rate limiting
        if (error.status === 429) {
            return new Error('OpenAI API rate limit exceeded. Please try again later.');
        }
        
        // Quota exceeded
        if (error.code === 'insufficient_quota') {
            return new Error('OpenAI API quota exceeded. Please check your billing.');
        }
        
        // Timeout errors
        if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
            return new Error('Request timed out. Please try again.');
        }
        
        // Network errors
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            return new Error('Network error. Please check your internet connection.');
        }
        
        // Model errors
        if (error.code === 'model_not_found') {
            return new Error('Specified OpenAI model not found. Please check your configuration.');
        }
        
        // Content policy violations
        if (error.code === 'content_filter') {
            return new Error('Content violates OpenAI usage policies.');
        }
        
        // Generic error
        return new Error(`AI service error: ${error.message || 'Unknown error occurred'}`);
    }

    /**
     * Check if an error should not be retried
     * @param {Error} error - The error to check
     * @returns {boolean} - True if error should not be retried
     */
    isNonRetryableError(error) {
        const nonRetryableCodes = [
            'invalid_api_key',
            'insufficient_quota',
            'content_filter',
            'model_not_found'
        ];
        
        const nonRetryableStatuses = [400, 401, 403, 404];
        
        return nonRetryableCodes.includes(error.code) || 
               nonRetryableStatuses.includes(error.status);
    }

    /**
     * Calculate retry delay with exponential backoff
     * @param {number} attempt - Current attempt number
     * @returns {number} - Delay in milliseconds
     */
    calculateRetryDelay(attempt) {
        return this.config.retryDelay * Math.pow(2, attempt - 1);
    }

    /**
     * Sleep for specified milliseconds
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise} - Promise that resolves after delay
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Validate service configuration
     * @returns {Object} - Validation result
     */
    validateConfiguration() {
        const issues = [];
        
        if (!process.env.OPENAI_API_KEY) {
            issues.push('OPENAI_API_KEY environment variable is required');
        }
        
        if (this.config.maxTokens < 1 || this.config.maxTokens > 4096) {
            issues.push('OPENAI_MAX_TOKENS must be between 1 and 4096');
        }
        
        if (this.config.temperature < 0 || this.config.temperature > 2) {
            issues.push('OPENAI_TEMPERATURE must be between 0 and 2');
        }
        
        return {
            valid: issues.length === 0,
            issues,
            config: this.config
        };
    }

    /**
     * Test API connectivity
     * @returns {Promise<Object>} - Test result
     */
    async testConnection() {
        try {
            if (!this.openai) {
                return {
                    success: false,
                    message: 'OpenAI client not initialized. Please check your API key configuration.',
                    error: 'missing_api_key'
                };
            }
            
            const response = await this.openai.chat.completions.create({
                model: this.config.model,
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 10
            });
            
            return {
                success: true,
                message: 'OpenAI API connection successful',
                model: response.model
            };
            
        } catch (error) {
            return {
                success: false,
                message: this.handleError(error).message,
                error: error.code || error.status
            };
        }
    }
}

module.exports = new AIService(); 