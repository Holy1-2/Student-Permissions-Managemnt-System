const authService = require('../services/auth.service');

const VALID_ROLES = ['Admin', 'DOD', 'Patron', 'Matron', 'Gatekeeper'];

/**
 * POST /api/auth/signup
 * Register a new system user with optional activation code.
 */
const signup = async (req, res) => {
    try {
        const { name, email, password, role, activationCode } = req.body;

        // Basic field validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Fields name, email, password, and role are required.',
            });
        }

        if (!VALID_ROLES.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}.`,
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters.',
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format.' });
        }

        const user = await authService.signup({ name, email, password, role, activationCode });

        return res.status(201).json({
            success: true,
            message: `Account created successfully for ${user.name} (${user.role}).`,
            data: user,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Internal server error.',
        });
    }
};

/**
 * POST /api/auth/login
 * Authenticate and return signed JWT token.
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.',
            });
        }

        const result = await authService.login({ email, password });

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            data: result,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Internal server error.',
        });
    }
};

module.exports = { signup, login };
