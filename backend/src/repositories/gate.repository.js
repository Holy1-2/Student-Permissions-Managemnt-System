const db = require('../config/db');

/**
 * Insert a gate crossing log entry.
 * Returns the inserted row ID.
 * @param {object} conn - Active DB connection (for transaction support)
 */
const createGateLog = async (conn, { entityId, direction, loggedBy }) => {
    const [result] = await conn.execute(
        'INSERT INTO gate_logs (entity_id, direction, logged_by) VALUES (?, ?, ?)',
        [entityId, direction, loggedBy]
    );
    return result.insertId;
};

/**
 * Insert an asset log linked to a gate log entry.
 * @param {object} conn - Active DB connection (for transaction support)
 */
const createAssetLog = async (conn, { gateLogId, itemDescription, actionType }) => {
    const [result] = await conn.execute(
        'INSERT INTO asset_logs (gate_log_id, item_description, action_type) VALUES (?, ?, ?)',
        [gateLogId, itemDescription, actionType]
    );
    return result.insertId;
};

/**
 * Fetch the last N gate movements with full entity, user, and asset relationships.
 */
const findRecentHistory = async (limit = 50) => {
    const [rows] = await db.execute(
        `SELECT
        gl.id AS gate_log_id,
        gl.direction,
        gl.timestamp,
        e.id AS entity_id,
        e.name AS entity_name,
        e.entity_type,
        e.national_id,
        e.license_plate,
        u.name AS logged_by_name,
        u.role AS logged_by_role,
        al.id AS asset_log_id,
        al.item_description,
        al.action_type
     FROM gate_logs gl
     JOIN entities e ON e.id = gl.entity_id
     JOIN users u ON u.id = gl.logged_by
     LEFT JOIN asset_logs al ON al.gate_log_id = gl.id
     ORDER BY gl.timestamp DESC
     LIMIT ?`,
        [limit]
    );

    // Group asset logs under their gate log entry
    const grouped = {};
    for (const row of rows) {
        if (!grouped[row.gate_log_id]) {
            grouped[row.gate_log_id] = {
                id: row.gate_log_id,
                direction: row.direction,
                timestamp: row.timestamp,
                entity: {
                    id: row.entity_id,
                    name: row.entity_name,
                    entity_type: row.entity_type,
                    national_id: row.national_id,
                    license_plate: row.license_plate,
                },
                logged_by: {
                    name: row.logged_by_name,
                    role: row.logged_by_role,
                },
                assets: [],
            };
        }
        if (row.asset_log_id) {
            grouped[row.gate_log_id].assets.push({
                id: row.asset_log_id,
                item_description: row.item_description,
                action_type: row.action_type,
            });
        }
    }

    return Object.values(grouped);
};

module.exports = { createGateLog, createAssetLog, findRecentHistory };
