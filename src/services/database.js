const { supabase } = require('../config/supabase');

class DatabaseService {
	// User operations
	async createUser(userData) {
		const { data, error } = await supabase
			.from('users')
			.insert([userData])
			.select();
		
		if (error) throw error;
		return data[0];
	}

	async getUserByEmail(email) {
		const { data, error } = await supabase
			.from('users')
			.select('*')
			.eq('email', email)
			.single();
		
		if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
		return data;
	}

	async getUserById(id) {
		const { data, error } = await supabase
			.from('users')
			.select('*')
			.eq('id', id)
			.single();
		
		if (error && error.code !== 'PGRST116') throw error;
		return data;
	}

	// Category operations
	async getCategories() {
		const { data, error } = await supabase
			.from('categories')
			.select('*')
			.order('name');
		
		if (error) throw error;
		return data;
	}

	async createCategory(categoryData) {
		const { data, error } = await supabase
			.from('categories')
			.insert([categoryData])
			.select();
		
		if (error) throw error;
		return data[0];
	}

	async getCategoriesByIds(ids) {
		if (!Array.isArray(ids) || ids.length === 0) {
			return [];
		}
		
		const { data, error } = await supabase
			.from('categories')
			.select('*')
			.in('id', ids)
			.order('name');
		
		if (error) throw error;
		return data;
	}

	// Idea operations
	async createIdea(ideaData) {
		const { data, error } = await supabase
			.from('ideas')
			.insert([ideaData])
			.select();
		
		if (error) throw error;
		return data[0];
	}

	async getIdeas(filters = {}) {
		let query = supabase
			.from('ideas')
			.select(`
				*,
				users(email),
				categories(name)
			`)
			.order('created_at', { ascending: false });

		// Apply filters if provided
		if (filters.category_id) {
			query = query.eq('category_id', filters.category_id);
		}
		if (filters.user_id) {
			query = query.eq('user_id', filters.user_id);
		}

		const { data, error } = await query;
		
		if (error) throw error;
		return data;
	}

	async getIdeaById(id) {
		const { data, error } = await supabase
			.from('ideas')
			.select(`
				*,
				users(email),
				categories(name)
			`)
			.eq('id', id)
			.single();
		
		if (error && error.code !== 'PGRST116') throw error;
		return data;
	}

	async updateIdea(id, ideaData) {
		const { data, error } = await supabase
			.from('ideas')
			.update(ideaData)
			.eq('id', id)
			.select();
		
		if (error) throw error;
		return data[0];
	}

	async deleteIdea(id) {
		const { data, error } = await supabase
			.from('ideas')
			.delete()
			.eq('id', id);
		
		if (error) throw error;
		return data;
	}
}

module.exports = new DatabaseService(); 