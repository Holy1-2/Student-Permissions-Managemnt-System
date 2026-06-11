const permissionRepo = require('../repositories/permission.repository');
const entityRepo = require('../repositories/entity.repository');
const db = require('../config/db'); // Ensure your database config is imported
/**
 * Issue a new departure permission slip.
 * Only Discipline Staff (DOD, Patron, Matron) and Admin may issue.
 */
// ── FIXED STEP 1 IN services/permission.service.js ──
// ── FLEXIBLE FALLBACK LOOKUP IN services/permission.service.js ──
const issuePermission = async ({ entityId, issuedBy, reason, destination, expectedDeparture, expectedReturn }) => {
    
    // 1. Verify the true primary ID exists in the entities table
    const [rows] = await db.execute(
        'SELECT * FROM entities WHERE id = ?', 
        [entityId]
    );
    const entity = rows[0];

    if (!entity) {
        const error = new Error(`Umunyeshuri ufite ID ya ${entityId} ntabwo aboneka muri sisitemu.`);
        error.statusCode = 404;
        throw error;
    }

    // 2. Insert into permissions matching the Foreign Key constraint exactly
    const [result] = await db.execute(
        `INSERT INTO permissions (entity_id, issued_by, reason, destination, expected_departure, expected_return, status)
         VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
        [
            entityId, 
            issuedBy, 
            reason, 
            destination, 
            expectedDeparture, 
            expectedReturn
        ]
    );

    return {
        id: result.insertId,
        entityName: entity.name,
        entityId,
        reason,
        destination,
        expectedDeparture,
        expectedReturn,
        status: 'Active'
    };
};

// Helper function to handle the SQL insert once an entity record is secured
async function proceedWithInsertion(entity, entityId, issuedBy, reason, destination, expectedDeparture, expectedReturn) {
    const [result] = await db.execute(
        `INSERT INTO permissions (entity_id, issued_by, reason, destination, expected_departure, expected_return, status)
         VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
        [entityId, issuedBy, reason, destination, expectedDeparture, expectedReturn]
    );

    return {
        id: result.insertId,
        entityName: entity.name,
        entityId,
        reason,
        destination,
        expectedDeparture,
        expectedReturn,
        status: 'Active'
    };
}
const getActivePermissions = async () => {
    return permissionRepo.findAllActive();
};

/**
 * Waive an automated mark penalty.
 * Only DOD or Admin may waive.
 */
const waivePenalty = async (permissionId, waivedReason, requestingUser) => {
    if (!['Admin', 'DOD'].includes(requestingUser.role)) {
        const err = new Error('Only DOD or Admin can waive penalties.');
        err.statusCode = 403;
        throw err;
    }

    if (!waivedReason || waivedReason.trim().length === 0) {
        const err = new Error('A waived_reason is required to waive a penalty.');
        err.statusCode = 400;
        throw err;
    }

    const permission = await permissionRepo.findById(permissionId);
    if (!permission) {
        const err = new Error(`Permission record ${permissionId} not found.`);
        err.statusCode = 404;
        throw err;
    }

    if (permission.marks_deducted_cache === 0) {
        const err = new Error('This permission has no active penalty to waive.');
        err.statusCode = 400;
        throw err;
    }

    return permissionRepo.waivePenalty(permissionId, waivedReason.trim());
};

/**
 * List all permissions (paginated).
 */
const getAllPermissions = async (limit = 50, offset = 0) => {
    return permissionRepo.findAll(limit, offset);
};

module.exports = {
    issuePermission,
    getActivePermissions,
    waivePenalty,
    getAllPermissions,
};
