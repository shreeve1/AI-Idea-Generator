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

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
}); 