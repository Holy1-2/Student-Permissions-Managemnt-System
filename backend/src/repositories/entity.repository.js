const db = require('../config/db');

/**
 * Search entities by name, national_id, or license_plate.
 */
const searchEntities = async (query) => {
    const searchTerm = `%${query}%`;
    const [rows] = await db.execute(
        `SELECT id, entity_type, name, phone, national_id, academic_bridge_student_id, created_at
         FROM entities
         WHERE entity_type = 'Student'
           AND (name LIKE ? OR national_id LIKE ? OR academic_bridge_student_id LIKE ?)
         ORDER BY name ASC
         LIMIT 20`,
        [searchTerm, searchTerm, searchTerm]
    );
    return rows;
};
/**
 * Find a single entity by ID.
 */
const findById = async (id) => {
    const [rows] = await db.execute(
        `SELECT id, entity_type, name, phone, national_id, license_plate, company_name,
            academic_bridge_student_id, created_at
     FROM entities WHERE id = ?`,
        [id]
    );
    return rows[0] || null;
};

/**
 * Find entity by academic_bridge_student_id (used during sync).
 */
const findByAcademicBridgeId = async (academicBridgeStudentId) => {
    const [rows] = await db.execute(
        'SELECT * FROM entities WHERE academic_bridge_student_id = ?',
        [academicBridgeStudentId]
    );
    return rows[0] || null;
};

/**
 * Upsert a student entity from Academic Bridge sync.
 * Uses INSERT ... ON DUPLICATE KEY UPDATE to avoid duplicates.
 */
const upsertStudent = async ({ name, phone, nationalId, academicBridgeStudentId }) => {
    const [result] = await db.execute(
        `INSERT INTO entities (entity_type, name, phone, national_id, academic_bridge_student_id)
     VALUES ('Student', ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       phone = VALUES(phone),
       national_id = VALUES(national_id)`,
        [name, phone || null, nationalId || null, academicBridgeStudentId]
    );
    return result;
};

/**
 * Create a new entity manually.
 */
const createEntity = async ({ entityType, name, phone, nationalId, licensePlate, companyName, academicBridgeStudentId }) => {
    const [result] = await db.execute(
        `INSERT INTO entities (entity_type, name, phone, national_id, license_plate, company_name, academic_bridge_student_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            entityType,
            name,
            phone || null,
            nationalId || null,
            licensePlate || null,
            companyName || null,
            academicBridgeStudentId || null,
        ]
    );
    return findById(result.insertId);
};

/**
 * List all entities with optional type filter.
 */
const findAll = async (entityType = null) => {
    if (entityType === 'Student') {
        const [rows] = await db.execute('SELECT id, name, student_id AS academic_bridge_student_id FROM students ORDER BY name ASC');
        return rows;
    }
    // Fallback for other tracking layers if needed
    const [rows] = await db.execute('SELECT * FROM entities ORDER BY name ASC');
    return rows;
};

module.exports = {
    searchEntities,
    findById,
    findByAcademicBridgeId,
    upsertStudent,
    createEntity,
    findAll,
};
