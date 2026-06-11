const db = require('../config/db');

/**
 * Create a new permission/leave slip for an entity.
 */
const createPermission = async ({ entityId, issuedBy, reason, destination, expectedDeparture, expectedReturn }) => {
    const [result] = await db.execute(
        `INSERT INTO permissions (entity_id, issued_by, reason, destination, expected_departure, expected_return, status)
     VALUES (?, ?, ?, ?, ?, ?, 'Approved')`,
        [entityId, issuedBy, reason, destination, expectedDeparture, expectedReturn]
    );
    return findById(result.insertId);
};

/**
 * Fetch a permission by ID with entity and issuer info.
 */
const findById = async (id) => {
    const [rows] = await db.execute(
        `SELECT p.*,
            e.name AS entity_name, e.entity_type, e.academic_bridge_student_id,
            u.name AS issued_by_name, u.role AS issued_by_role
     FROM permissions p
     JOIN entities e ON e.id = p.entity_id
     JOIN users u ON u.id = p.issued_by
     WHERE p.id = ?`,
        [id]
    );
    return rows[0] || null;
};

/**
 * Get the latest 'Approved' permission for a student (used when they exit).
 */
const findLatestApprovedByEntity = async (entityId) => {
    const [rows] = await db.execute(
        `SELECT * FROM permissions
     WHERE entity_id = ? AND status = 'Approved'
     ORDER BY expected_departure DESC
     LIMIT 1`,
        [entityId]
    );
    return rows[0] || null;
};

/**
 * Get the current 'Active' permission for a student (used when they return).
 */
const findActiveByEntity = async (entityId) => {
    const [rows] = await db.execute(
        `SELECT * FROM permissions
     WHERE entity_id = ? AND status = 'Active'
     ORDER BY expected_departure DESC
     LIMIT 1`,
        [entityId]
    );
    return rows[0] || null;
};

/**
 * Update permission status.
 */
const updateStatus = async (id, status) => {
    await db.execute('UPDATE permissions SET status = ? WHERE id = ?', [status, id]);
};

/**
 * Update permission to Overdue with marks deduction cached.
 */
const markOverdue = async (id, marksDeducted) => {
    await db.execute(
        "UPDATE permissions SET status = 'Overdue', marks_deducted_cache = ? WHERE id = ?",
        [marksDeducted, id]
    );
};

/**
 * Mark permission as Returned (on-time).
 */
const markReturned = async (id) => {
    await db.execute(
        "UPDATE permissions SET status = 'Returned' WHERE id = ?",
        [id]
    );
};

/**
 * Waive a penalty: reset marks cache and store reason.
 */
const waivePenalty = async (id, waivedReason) => {
    await db.execute(
        "UPDATE permissions SET marks_deducted_cache = 0, waived_reason = ?, status = 'Returned' WHERE id = ?",
        [waivedReason, id]
    );
    return findById(id);
};

/**
 * Fetch all active permissions (students currently outside).
 */
const findAllActive = async () => {
    const [rows] = await db.execute(
        `SELECT p.*,
            e.name AS entity_name, e.entity_type, e.phone, e.academic_bridge_student_id,
            u.name AS issued_by_name
     FROM permissions p
     JOIN entities e ON e.id = p.entity_id
     JOIN users u ON u.id = p.issued_by
     WHERE p.status = 'Active'
     ORDER BY p.expected_return ASC`
    );
    return rows;
};

/**
 * Fetch all permissions with pagination support.
 */
const findAll = async (limit = 50, offset = 0) => {
    const [rows] = await db.execute(
        `SELECT p.*,
            e.name AS entity_name, e.entity_type,
            u.name AS issued_by_name
     FROM permissions p
     JOIN entities e ON e.id = p.entity_id
     JOIN users u ON u.id = p.issued_by
     ORDER BY p.id DESC
     LIMIT ? OFFSET ?`,
        [limit, offset]
    );
    return rows;
};

module.exports = {
    createPermission,
    findById,
    findLatestApprovedByEntity,
    findActiveByEntity,
    updateStatus,
    markOverdue,
    markReturned,
    waivePenalty,
    findAllActive,
    findAll,
};
