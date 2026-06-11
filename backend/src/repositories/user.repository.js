const db = require('../config/db');

/**
 * Find a user by their email address.
 */
const findByEmail = async (email) => {
    const [rows] = await db.execute(
        'SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = ?',
        [email]
    );
    return rows[0] || null;
};

/**
 * Find a user by their ID.
 */
const findById = async (id) => {
    const [rows] = await db.execute(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [id]
    );
    return rows[0] || null;
};

/**
 * Create a new system user.
 */
const createUser = async ({ name, email, passwordHash, role }) => {
    const [result] = await db.execute(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [name, email, passwordHash, role]
    );
    return { id: result.insertId, name, email, role };
};

/**
 * Retrieve all users (Admin use).
 */
const findAll = async () => {
    const [rows] = await db.execute(
        'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
};

module.exports = { findByEmail, findById, createUser, findAll };
