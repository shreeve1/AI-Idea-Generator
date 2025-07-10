// Auto-detect the correct API base URL based on current host
const getApiBaseUrl = () => {
  const currentHost = window.location.hostname;
  const currentPort = window.location.port;
  
  // If accessing via IP address or custom host, use that host for API
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return `http://${currentHost}:3001/api`;
  }
  
  // Default to localhost for local development
  return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('authToken');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    // Get authentication token
    getToken() {
        return this.token || localStorage.getItem('authToken');
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        // Add auth token if available
        const token = this.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            
            // Handle non-JSON responses (like 401, 403, etc.)
            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText || `HTTP ${response.status}` };
                }
                
                // Handle detailed validation errors
                if (errorData.details && Array.isArray(errorData.details)) {
                    const detailedMessage = errorData.details.join('. ');
                    throw new Error(`${errorData.error || 'Validation Error'}: ${detailedMessage}`);
                }
                
                throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
            }

            // Handle empty responses
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            return await response.text();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async login(credentials) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        
        if (response.token) {
            this.setToken(response.token);
        }
        
        return response;
    }

    async logout() {
        this.setToken(null);
        return Promise.resolve();
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    async verifyEmail(token) {
        return this.request('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
    }

    // AI methods
    async generateIdeas(prompt, categoryIds = [], options = {}) {
        return this.request('/ai/generate-ideas', {
            method: 'POST',
            body: JSON.stringify({ prompt, categoryIds, options }),
        });
    }

    async generateIdeasGuest(prompt, categoryIds = [], options = {}) {
        return this.request('/ai/generate-ideas-guest', {
            method: 'POST',
            body: JSON.stringify({ prompt, categoryIds, options }),
        });
    }

    async testAIConnection() {
        return this.request('/ai/test-connection', {
            method: 'POST',
        });
    }

    async getAIConfig() {
        return this.request('/ai/config');
    }

    async constructPrompt(prompt, categoryIds = [], options = {}) {
        return this.request('/ai/construct-prompt', {
            method: 'POST',
            body: JSON.stringify({ prompt, categoryIds, options }),
        });
    }

    // Database test methods
    async testDatabase() {
        return this.request('/db-test');
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }

    // Categories methods
    async getCategories() {
        return this.request('/categories');
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService; 