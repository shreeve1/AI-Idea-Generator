require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { supabase } = require('./config/supabase');
const database = require('./services/database');

// Import routes
const authRoutes = require('./api/authRoutes');
const aiRoutes = require('./api/aiRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Categories routes
app.get('/api/categories', async (req, res) => {
	try {
		const categories = await database.getCategories();
		res.json(categories);
	} catch (error) {
		console.error('Error fetching categories:', error);
		res.status(500).json({ error: 'Failed to fetch categories' });
	}
});

// Health check route
app.get('/api/health', (req, res) => {
	res.status(200).json({ status: 'UP' });
});

// Database connection test route
app.get('/api/db-test', async (req, res) => {
	try {
		// Test the connection by fetching categories
		const { data, error } = await supabase
			.from('categories')
			.select('count(*)')
			.single();

		if (error) {
			throw error;
		}

		res.status(200).json({ 
			status: 'Database connection successful',
			categoriesCount: data.count 
		});
	} catch (error) {
		console.error('Database connection error:', error);
		res.status(500).json({ 
			status: 'Database connection failed',
			error: error.message 
		});
	}
});

app.get('/api/debug/env', (req, res) => {
    res.json({
        supabaseUrlExists: !!process.env.SUPABASE_URL,
        supabaseUrlLength: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.length : 0,
        supabaseUrlPrefix: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 20) + '...' : 'missing',
        supabaseKeyExists: !!process.env.SUPABASE_ANON_KEY,
        supabaseKeyLength: process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.length : 0,
        nodeEnv: process.env.NODE_ENV || 'development'
    });
});

app.get('/api/debug/supabase', async (req, res) => {
    try {
        const { supabase } = require('./config/supabase');
        
        // Test basic connection
        const { data, error } = await supabase
            .from('categories')
            .select('count')
            .limit(1);
            
        if (error) {
            return res.status(500).json({
                success: false,
                error: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
        }
        
        res.json({
            success: true,
            message: 'Supabase connection successful',
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
	console.log(`Server running on port ${PORT}`);
	console.log(`Local access: http://localhost:${PORT}`);
	console.log(`Network access: http://[YOUR-IP]:${PORT}`);
}); 