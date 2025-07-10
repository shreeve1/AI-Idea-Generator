const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');
const passwordService = require('../services/passwordService');
const jwtService = require('../services/jwtService');

// Input validation helper
function validateEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

// User Registration Endpoint
router.post('/register', async (req, res) => {
	try {
		const { email, password, name } = req.body;

		// Validate required fields
		if (!email || !password) {
			return res.status(400).json({
				error: 'Email and password are required',
				code: 'MISSING_FIELDS'
			});
		}

		// Validate email format
		if (!validateEmail(email)) {
			return res.status(400).json({
				error: 'Invalid email format',
				code: 'INVALID_EMAIL'
			});
		}

		// Validate password strength
		const passwordValidation = passwordService.validatePasswordStrength(password);
		if (!passwordValidation.isValid) {
			return res.status(400).json({
				error: 'Password does not meet requirements',
				code: 'WEAK_PASSWORD',
				details: passwordValidation.errors
			});
		}

		// Check if user already exists (using admin client to bypass RLS)
		const { data: existingUser, error: checkError } = await supabaseAdmin
			.from('users')
			.select('id, email')
			.eq('email', email.toLowerCase())
			.single();

		if (checkError && checkError.code !== 'PGRST116') {
			console.error('Database error checking existing user:', checkError);
			return res.status(500).json({
				error: 'Internal server error',
				code: 'DATABASE_ERROR'
			});
		}

		if (existingUser) {
			return res.status(409).json({
				error: 'User with this email already exists',
				code: 'USER_EXISTS'
			});
		}

		// Hash the password
		const hashedPassword = await passwordService.hashPassword(password);

		// Create the user (using admin client to bypass RLS)
		const { data: newUser, error: createError } = await supabaseAdmin
			.from('users')
			.insert([{
				email: email.toLowerCase(),
				password_hash: hashedPassword,
				name: name || null,
				is_verified: false
			}])
			.select('id, email, name, is_verified, created_at')
			.single();

		if (createError) {
			console.error('Database error creating user:', createError);
			return res.status(500).json({
				error: 'Failed to create user',
				code: 'CREATE_USER_ERROR'
			});
		}

		// Generate verification token
		const verificationToken = jwtService.generateVerificationToken({
			userId: newUser.id,
			email: newUser.email,
			purpose: 'email_verification'
		});

		// TODO: Send verification email (for now, just return the token)
		// In production, you would send this via email service like SendGrid
		
		res.status(201).json({
			message: 'User registered successfully',
			user: {
				id: newUser.id,
				email: newUser.email,
				name: newUser.name,
				isVerified: newUser.is_verified,
				createdAt: newUser.created_at
			},
			// In production, don't return the verification token in the response
			// This is only for testing purposes
			verificationToken: verificationToken
		});

	} catch (error) {
		console.error('Registration error:', error);
		res.status(500).json({
			error: 'Internal server error',
			code: 'REGISTRATION_ERROR'
		});
	}
});

// Email Verification Endpoint
router.post('/verify-email', async (req, res) => {
	try {
		const { token } = req.body;

		if (!token) {
			return res.status(400).json({
				error: 'Verification token is required',
				code: 'MISSING_TOKEN'
			});
		}

		// Verify the token
		let decoded;
		try {
			decoded = jwtService.verifyToken(token);
		} catch (error) {
			return res.status(400).json({
				error: 'Invalid or expired verification token',
				code: 'INVALID_TOKEN'
			});
		}

		// Check if token is for email verification
		if (decoded.sub !== 'email-verification') {
			return res.status(400).json({
				error: 'Invalid token type',
				code: 'INVALID_TOKEN_TYPE'
			});
		}

		// Update user verification status
		const { data: updatedUser, error: updateError } = await supabase
			.from('users')
			.update({ is_verified: true })
			.eq('id', decoded.userId)
			.eq('email', decoded.email)
			.select('id, email, name, is_verified')
			.single();

		if (updateError) {
			console.error('Database error updating user verification:', updateError);
			return res.status(500).json({
				error: 'Failed to verify email',
				code: 'VERIFICATION_ERROR'
			});
		}

		if (!updatedUser) {
			return res.status(404).json({
				error: 'User not found',
				code: 'USER_NOT_FOUND'
			});
		}

		res.status(200).json({
			message: 'Email verified successfully',
			user: {
				id: updatedUser.id,
				email: updatedUser.email,
				name: updatedUser.name,
				isVerified: updatedUser.is_verified
			}
		});

	} catch (error) {
		console.error('Email verification error:', error);
		res.status(500).json({
			error: 'Internal server error',
			code: 'VERIFICATION_ERROR'
		});
	}
});

// User Login Endpoint
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;

		// Validate required fields
		if (!email || !password) {
			return res.status(400).json({
				error: 'Email and password are required',
				code: 'MISSING_CREDENTIALS'
			});
		}

		// Validate email format
		if (!validateEmail(email)) {
			return res.status(400).json({
				error: 'Invalid email format',
				code: 'INVALID_EMAIL'
			});
		}

		// Find user by email (using admin client to bypass RLS)
		console.log('Looking for user with email:', email.toLowerCase());
		const { data: user, error: findError } = await supabaseAdmin
			.from('users')
			.select('id, email, password_hash, name, is_verified')
			.eq('email', email.toLowerCase())
			.single();

		if (findError) {
			if (findError.code === 'PGRST116') {
				// User not found
				console.log('User not found with email:', email.toLowerCase());
				return res.status(401).json({
					error: 'Invalid credentials',
					code: 'INVALID_CREDENTIALS'
				});
			}
			console.error('Database error finding user:', findError);
			return res.status(500).json({
				error: 'Internal server error',
				code: 'DATABASE_ERROR'
			});
		}

		console.log('User found:', { id: user.id, email: user.email, name: user.name });

		// Verify password
		const isPasswordValid = await passwordService.comparePassword(password, user.password_hash);
		console.log('Password verification result:', isPasswordValid);
		if (!isPasswordValid) {
			return res.status(401).json({
				error: 'Invalid credentials',
				code: 'INVALID_CREDENTIALS'
			});
		}

		// Check if email is verified (disabled for development)
		// TODO: Re-enable email verification in production
		// if (!user.is_verified) {
		// 	return res.status(403).json({
		// 		error: 'Email not verified. Please check your email and verify your account.',
		// 		code: 'EMAIL_NOT_VERIFIED'
		// 	});
		// }

		// Generate JWT token
		const token = jwtService.generateToken({
			id: user.id,
			email: user.email
		});

		res.status(200).json({
			message: 'Login successful',
			token: token,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				isVerified: user.is_verified
			}
		});

	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({
			error: 'Internal server error',
			code: 'LOGIN_ERROR'
		});
	}
});

// Get Current User (protected route)
router.get('/me', async (req, res) => {
	try {
		// Extract token from Authorization header
		const authHeader = req.headers.authorization;
		const token = jwtService.extractTokenFromHeader(authHeader);

		if (!token) {
			return res.status(401).json({
				error: 'No token provided',
				code: 'NO_TOKEN'
			});
		}

		// Verify token
		let decoded;
		try {
			decoded = jwtService.verifyToken(token);
		} catch (error) {
			return res.status(401).json({
				error: 'Invalid or expired token',
				code: 'INVALID_TOKEN'
			});
		}

		// Get user from database (using admin client to bypass RLS)
		const { data: user, error: findError } = await supabaseAdmin
			.from('users')
			.select('id, email, name, is_verified, created_at')
			.eq('id', decoded.id)
			.single();

		if (findError || !user) {
			return res.status(404).json({
				error: 'User not found',
				code: 'USER_NOT_FOUND'
			});
		}

		res.status(200).json({
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				isVerified: user.is_verified,
				createdAt: user.created_at
			}
		});

	} catch (error) {
		console.error('Get current user error:', error);
		res.status(500).json({
			error: 'Internal server error',
			code: 'GET_USER_ERROR'
		});
	}
});

const emailService = require('../services/emailService');

// Password Reset Request Endpoint
router.post('/request-password-reset', async (req, res) => {
    try {
        const { email } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({
                error: 'Invalid email format',
                code: 'INVALID_EMAIL'
            });
        }

        const { data: user, error: findError } = await supabase
            .from('users')
            .select('id, email')
            .eq('email', email.toLowerCase())
            .single();

        if (findError || !user) {
            return res.status(200).json({ 
                message: 'If a user with that email exists, a password reset link has been sent.' 
            });
        }

        const resetToken = jwtService.generateVerificationToken({
            userId: user.id,
            email: user.email,
            purpose: 'password_reset'
        });

        await emailService.sendPasswordResetEmail(user.email, resetToken);

        res.status(200).json({ 
            message: 'If a user with that email exists, a password reset link has been sent.' 
        });

    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({
            error: 'Internal server error',
            code: 'PASSWORD_RESET_REQUEST_ERROR'
        });
    }
});

// Password Reset Endpoint
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                error: 'Token and new password are required',
                code: 'MISSING_FIELDS'
            });
        }

        let decoded;
        try {
            decoded = jwtService.verifyToken(token);
        } catch (error) {
            return res.status(400).json({
                error: 'Invalid or expired password reset token',
                code: 'INVALID_TOKEN'
            });
        }

        if (decoded.purpose !== 'password_reset') {
            return res.status(400).json({
                error: 'Invalid token purpose',
                code: 'INVALID_TOKEN_PURPOSE'
            });
        }

        const passwordValidation = passwordService.validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                error: 'Password does not meet requirements',
                code: 'WEAK_PASSWORD',
                details: passwordValidation.errors
            });
        }

        const hashedPassword = await passwordService.hashPassword(password);

        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({ password_hash: hashedPassword })
            .eq('id', decoded.userId)
            .single();

        if (updateError) {
            throw updateError;
        }

        res.status(200).json({ message: 'Password has been reset successfully.' });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            error: 'Internal server error',
            code: 'PASSWORD_RESET_ERROR'
        });
    }
});

module.exports = router; 