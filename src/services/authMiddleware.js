const jwtService = require('./jwtService');
const { supabase } = require('../config/supabase');

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user information to request
 */
const authenticateUser = async (req, res, next) => {
	try {
		// Extract token from Authorization header
		const authHeader = req.headers.authorization;
		const token = jwtService.extractTokenFromHeader(authHeader);

		if (!token) {
			return res.status(401).json({
				error: 'No authentication token provided',
				code: 'NO_TOKEN'
			});
		}

		// Verify the token
		let decoded;
		try {
			decoded = jwtService.verifyToken(token);
		} catch (error) {
			return res.status(401).json({
				error: 'Invalid or expired token',
				code: 'INVALID_TOKEN'
			});
		}

		// Get user from database to ensure they still exist and are verified
		const { data: user, error: findError } = await supabase
			.from('users')
			.select('id, email, name, is_verified')
			.eq('id', decoded.id)
			.single();

		if (findError || !user) {
			return res.status(401).json({
				error: 'User not found',
				code: 'USER_NOT_FOUND'
			});
		}

		// Check if user is still verified
		if (!user.is_verified) {
			return res.status(403).json({
				error: 'Account not verified',
				code: 'ACCOUNT_NOT_VERIFIED'
			});
		}

		// Attach user information to request object
		req.user = {
			id: user.id,
			email: user.email,
			name: user.name,
			isVerified: user.is_verified
		};

		// Attach the decoded token for additional context if needed
		req.token = decoded;

		next();
	} catch (error) {
		console.error('Authentication middleware error:', error);
		res.status(500).json({
			error: 'Internal server error',
			code: 'AUTH_MIDDLEWARE_ERROR'
		});
	}
};

/**
 * Optional authentication middleware
 * Attaches user info if token is valid, but doesn't block request if missing
 */
const optionalAuth = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		const token = jwtService.extractTokenFromHeader(authHeader);

		if (!token) {
			// No token provided, continue without authentication
			req.user = null;
			return next();
		}

		try {
			const decoded = jwtService.verifyToken(token);
			
			// Get user from database
			const { data: user, error: findError } = await supabase
				.from('users')
				.select('id, email, name, is_verified')
				.eq('id', decoded.id)
				.single();

			if (!findError && user && user.is_verified) {
				req.user = {
					id: user.id,
					email: user.email,
					name: user.name,
					isVerified: user.is_verified
				};
			} else {
				req.user = null;
			}
		} catch (error) {
			// Invalid token, continue without authentication
			req.user = null;
		}

		next();
	} catch (error) {
		console.error('Optional auth middleware error:', error);
		req.user = null;
		next();
	}
};

/**
 * Role-based authorization middleware
 * Use after authenticateUser to check for specific roles
 */
const requireRole = (roles) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({
				error: 'Authentication required',
				code: 'AUTH_REQUIRED'
			});
		}

		// For now, we don't have roles in our schema
		// This is a placeholder for future role-based access control
		// You could extend the user table to include a 'role' field
		
		next();
	};
};

module.exports = {
	authenticateUser,
	optionalAuth,
	requireRole
}; 