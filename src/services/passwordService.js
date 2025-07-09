const bcrypt = require('bcryptjs');

class PasswordService {
	constructor() {
		// Default to 12 rounds if not specified in environment
		this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
	}

	/**
	 * Hash a plain text password
	 * @param {string} plainPassword - The plain text password to hash
	 * @returns {Promise<string>} - The hashed password
	 */
	async hashPassword(plainPassword) {
		try {
			if (!plainPassword || typeof plainPassword !== 'string') {
				throw new Error('Password must be a non-empty string');
			}

			const hashedPassword = await bcrypt.hash(plainPassword, this.saltRounds);
			return hashedPassword;
		} catch (error) {
			throw new Error(`Password hashing failed: ${error.message}`);
		}
	}

	/**
	 * Compare a plain text password with a hashed password
	 * @param {string} plainPassword - The plain text password to verify
	 * @param {string} hashedPassword - The hashed password to compare against
	 * @returns {Promise<boolean>} - True if passwords match, false otherwise
	 */
	async comparePassword(plainPassword, hashedPassword) {
		try {
			if (!plainPassword || !hashedPassword) {
				throw new Error('Both plain and hashed passwords are required');
			}

			const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
			return isMatch;
		} catch (error) {
			throw new Error(`Password comparison failed: ${error.message}`);
		}
	}

	/**
	 * Validate password strength (basic validation)
	 * @param {string} password - The password to validate
	 * @returns {object} - Validation result with isValid boolean and errors array
	 */
	validatePasswordStrength(password) {
		const errors = [];
		
		if (!password || typeof password !== 'string') {
			errors.push('Password is required');
			return { isValid: false, errors };
		}

		if (password.length < 8) {
			errors.push('Password must be at least 8 characters long');
		}

		if (!/(?=.*[a-z])/.test(password)) {
			errors.push('Password must contain at least one lowercase letter');
		}

		if (!/(?=.*[A-Z])/.test(password)) {
			errors.push('Password must contain at least one uppercase letter');
		}

		if (!/(?=.*\d)/.test(password)) {
			errors.push('Password must contain at least one number');
		}

		if (!/(?=.*[@$!%*?&])/.test(password)) {
			errors.push('Password must contain at least one special character (@$!%*?&)');
		}

		return {
			isValid: errors.length === 0,
			errors
		};
	}
}

module.exports = new PasswordService(); 