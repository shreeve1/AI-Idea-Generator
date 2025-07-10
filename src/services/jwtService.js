const jwt = require('jsonwebtoken');

class JWTService {
	constructor() {
		this.secret = process.env.JWT_SECRET;
		this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
		
		if (!this.secret) {
			throw new Error('JWT_SECRET environment variable is required');
		}
	}

	/**
	 * Generate a JWT token for a user
	 * @param {object} payload - The payload to include in the token (usually user data)
	 * @returns {string} - The generated JWT token
	 */
	generateToken(payload) {
		try {
			if (!payload || typeof payload !== 'object') {
				throw new Error('Payload must be a valid object');
			}

			// Remove sensitive data from payload
			const sanitizedPayload = {
				id: payload.id,
				email: payload.email,
				// Add other non-sensitive fields as needed
			};

			const token = jwt.sign(sanitizedPayload, this.secret, {
				expiresIn: this.expiresIn,
				issuer: 'ai-idea-generator-app',
				subject: 'user-authentication'
			});

			return token;
		} catch (error) {
			throw new Error(`Token generation failed: ${error.message}`);
		}
	}

	/**
	 * Generate a verification token for email verification
	 * @param {object} payload - The payload to include in the token
	 * @returns {string} - The generated verification token
	 */
	generateVerificationToken(payload) {
		try {
			if (!payload || typeof payload !== 'object') {
				throw new Error('Payload must be a valid object');
			}

			const verificationPayload = {
				userId: payload.userId,
				email: payload.email,
				purpose: payload.purpose || 'email_verification'
			};

			const token = jwt.sign(verificationPayload, this.secret, {
				expiresIn: '24h', // Verification tokens expire in 24 hours
				issuer: 'ai-idea-generator-app',
				subject: 'email-verification'
			});

			return token;
		} catch (error) {
			throw new Error(`Verification token generation failed: ${error.message}`);
		}
	}

	/**
	 * Verify and decode a JWT token
	 * @param {string} token - The JWT token to verify
	 * @returns {object} - The decoded token payload
	 */
	verifyToken(token) {
		try {
			if (!token || typeof token !== 'string') {
				throw new Error('Token must be a valid string');
			}

			const decoded = jwt.verify(token, this.secret, {
				issuer: 'ai-idea-generator-app'
			});

			return decoded;
		} catch (error) {
			if (error.name === 'TokenExpiredError') {
				throw new Error('Token has expired');
			} else if (error.name === 'JsonWebTokenError') {
				throw new Error('Invalid token');
			} else {
				throw new Error(`Token verification failed: ${error.message}`);
			}
		}
	}

	/**
	 * Extract token from Authorization header
	 * @param {string} authHeader - The Authorization header value
	 * @returns {string|null} - The extracted token or null if not found
	 */
	extractTokenFromHeader(authHeader) {
		if (!authHeader) {
			return null;
		}

		// Check if header starts with 'Bearer '
		if (authHeader.startsWith('Bearer ')) {
			return authHeader.substring(7); // Remove 'Bearer ' prefix
		}

		// If no Bearer prefix, assume the entire header is the token
		return authHeader;
	}

	/**
	 * Check if a token is expired
	 * @param {string} token - The JWT token to check
	 * @returns {boolean} - True if token is expired, false otherwise
	 */
	isTokenExpired(token) {
		try {
			const decoded = jwt.decode(token);
			if (!decoded || !decoded.exp) {
				return true;
			}

			const currentTime = Math.floor(Date.now() / 1000);
			return decoded.exp < currentTime;
		} catch (error) {
			return true;
		}
	}

	/**
	 * Decode a token without verification (use with caution)
	 * @param {string} token - The JWT token to decode
	 * @returns {object|null} - The decoded token payload or null if invalid
	 */
	decodeToken(token) {
		try {
			return jwt.decode(token);
		} catch (error) {
			return null;
		}
	}
}

module.exports = new JWTService(); 