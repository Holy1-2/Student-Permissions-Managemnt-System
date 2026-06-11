require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const userRepo = require('../repositories/user.repository');
const configRepo = require('../repositories/config.repository');

const DISCIPLINE_ROLES = ['DOD', 'Patron', 'Matron'];
const GATEKEEPER_ROLE = 'Gatekeeper';

/**
 * Register a new system user.
 * - Admin bypasses activation code.
 * - Gatekeeper requires activation_code_gatekeeper.
 * - Discipline roles (DOD, Patron, Matron) require activation_code_discipline.
 */
const signup = async ({ name, email, password, role, activationCode }) => {
    // 1. Check for duplicate email
    const existing = await userRepo.findByEmail(email);
    if (existing) {
        const err = new Error('An account with this email already exists.');
        err.statusCode = 409;
        throw err;
    }

    // 2. Validate activation code for non-Admin roles
    if (role !== 'Admin') {
        const config = await configRepo.getConfig();
        if (!config) {
            const err = new Error('System configuration not found. Please contact an Admin.');
            err.statusCode = 500;
            throw err;
        }

        if (role === GATEKEEPER_ROLE) {
            if (!activationCode || activationCode !== config.activation_code_gatekeeper) {
                const err = new Error('Invalid System Activation Code for Gatekeeper registration.');
                err.statusCode = 403;
                throw err;
            }
        } else if (DISCIPLINE_ROLES.includes(role)) {
            if (!activationCode || activationCode !== config.activation_code_discipline) {
                const err = new Error('Invalid System Activation Code for Discipline Staff registration.');
                err.statusCode = 403;
                throw err;
            }
        }
    }

    // 3. Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Persist user
    const newUser = await userRepo.createUser({ name, email, passwordHash, role });
    return newUser;
};

/**
 * Authenticate a user and return a signed JWT.
 */
const login = async ({ email, password }) => {
    // 1. Find user
    const user = await userRepo.findByEmail(email);
    if (!user) {
        const err = new Error('Invalid email or password.');
        err.statusCode = 401;
        throw err;
    }

    // 2. Compare password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        const err = new Error('Invalid email or password.');
        err.statusCode = 401;
        throw err;
    }

    // 3. Sign JWT
    const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'my_gate_key_2026_secure', {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    return {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
};

module.exports = { signup, login };
