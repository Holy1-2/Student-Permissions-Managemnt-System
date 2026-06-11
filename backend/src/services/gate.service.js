const db = require('../config/db');
const gateRepo = require('../repositories/gate.repository');
const permissionRepo = require('../repositories/permission.repository');
const entityRepo = require('../repositories/entity.repository');
const configRepo = require('../repositories/config.repository');

const ONE_HOUR_MS = 3600000;

/**
 * Process a gate checkpoint event (check-in or check-out).
 * Runs inside a DB transaction to guarantee atomicity.
 *
 * @param {number} entityId         - The entity crossing the gate
 * @param {string} direction        - 'IN' or 'OUT'
 * @param {number} loggedBy         - User ID of the gatekeeper
 * @param {object|null} itemsMoved  - { description: string, type: string } (optional)
 */
const processCheckpoint = async ({ entityId, direction, loggedBy, itemsMoved }) => {
    // Validate entity existence
    const entity = await entityRepo.findById(entityId);
    if (!entity) {
        const err = new Error(`Entity with ID ${entityId} not found.`);
        err.statusCode = 404;
        throw err;
    }

    // Acquire a dedicated connection for the transaction
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        // ── STEP 1: Insert gate log ──────────────────────────────────────────────
        const gateLogId = await gateRepo.createGateLog(conn, { entityId, direction, loggedBy });

        // ── STEP 2: Insert asset log if items were moved ─────────────────────────
        let assetLogId = null;
        if (itemsMoved && itemsMoved.description && itemsMoved.type) {
            assetLogId = await gateRepo.createAssetLog(conn, {
                gateLogId,
                itemDescription: itemsMoved.description,
                actionType: itemsMoved.type,
            });
        }

        const summary = {
            gateLogId,
            entityId,
            entityName: entity.name,
            entityType: entity.entity_type,
            direction,
            assetLogId,
            permissionUpdate: null,
            overdueReport: null,
        };

        // ── STEP 3: Student-specific permission logic ────────────────────────────
        if (entity.entity_type === 'Student') {
            if (direction === 'OUT') {
                // Activate the latest approved permission
                const approved = await permissionRepo.findLatestApprovedByEntity(entityId);
                if (approved) {
                    await conn.execute(
                        "UPDATE permissions SET status = 'Active' WHERE id = ?",
                        [approved.id]
                    );
                    summary.permissionUpdate = {
                        permissionId: approved.id,
                        previousStatus: 'Approved',
                        newStatus: 'Active',
                        destination: approved.destination,
                        expectedReturn: approved.expected_return,
                    };
                }
            } else if (direction === 'IN') {
                // Find the current active permission window
                const active = await permissionRepo.findActiveByEntity(entityId);

                if (active) {
                    const now = new Date();
                    const expectedReturn = new Date(active.expected_return);
                    const diffMs = now.getTime() - expectedReturn.getTime();

                    if (diffMs <= 0) {
                        // ── On Time ──
                        await conn.execute(
                            "UPDATE permissions SET status = 'Returned' WHERE id = ?",
                            [active.id]
                        );
                        summary.permissionUpdate = {
                            permissionId: active.id,
                            previousStatus: 'Active',
                            newStatus: 'Returned',
                            minutesEarly: Math.floor(Math.abs(diffMs) / 60000),
                        };
                    } else {
                        // ── Overdue ──
                        const hoursOverdue = Math.floor(diffMs / ONE_HOUR_MS);

                        // Fetch penalty rate from config
                        const config = await configRepo.getConfig();
                        const penaltyRate = config ? config.marks_penalty_per_hour : 2;

                        // Calculate marks to deduct (0 if less than 1 full hour late)
                        const marksDeducted = hoursOverdue * penaltyRate;

                        // Update permission record
                        await conn.execute(
                            "UPDATE permissions SET status = 'Overdue', marks_deducted_cache = ? WHERE id = ?",
                            [marksDeducted, active.id]
                        );

                        summary.permissionUpdate = {
                            permissionId: active.id,
                            previousStatus: 'Active',
                            newStatus: 'Overdue',
                        };

                        summary.overdueReport = {
                            hoursOverdue,
                            minutesOverdue: Math.floor(diffMs / 60000),
                            marksDeducted,
                            penaltyRateUsed: penaltyRate,
                            expectedReturn: active.expected_return,
                            actualReturn: now.toISOString(),
                        };

                        // ── STEP 4: Mock Outbound Webhook to Academic Bridge ─────────────
                        if (marksDeducted > 0) {
                            const webhookPayload = {
                                student_bridge_id: entity.academic_bridge_student_id,
                                student_name: entity.name,
                                permission_id: active.id,
                                hours_overdue: hoursOverdue,
                                marks_deducted: marksDeducted,
                                event_timestamp: now.toISOString(),
                            };

                            const webhookUrl = config
                                ? `${config.academic_bridge_api_url}/discipline/deduct`
                                : 'https://api.academicbridge.rw/v1/discipline/deduct';

                            // Log mock dispatch — real axios call would go here in production
                            console.warn(
                                `[Webhook][MOCK] POST ${webhookUrl}`,
                                JSON.stringify(webhookPayload, null, 2)
                            );

                            summary.webhookDispatched = {
                                mock: true,
                                url: webhookUrl,
                                payload: webhookPayload,
                            };
                        }
                    }
                }
            }
        }

        await conn.commit();
        return summary;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

/**
 * Search entities by name, national ID, or license plate.
 */
const searchEntities = async (query) => {
    const searchTerm = `%${query}%`;
    const [rows] = await db.execute(
        `SELECT 
            e.id AS entity_id, e.name, e.entity_type, e.academic_bridge_student_id,
            p.id AS permission_id, p.status, p.destination, p.reason, 
            p.expected_departure, p.expected_return, p.marks_deducted_cache, 
            p.waived_reason, u.name AS issued_by_name
         FROM entities e
         LEFT JOIN permissions p ON e.id = p.entity_id AND p.status IN ('Approved', 'Active', 'Overdue')
         LEFT JOIN users u ON u.id = p.issued_by
         WHERE e.name LIKE ? OR e.academic_bridge_student_id LIKE ?
         LIMIT 10`,
        [searchTerm, searchTerm]
    );

    // Map flat rows to nested objects
    return rows.map(row => ({
        id: row.entity_id,
        name: row.name,
        entity_type: row.entity_type,
        academic_bridge_student_id: row.academic_bridge_student_id,
        // Only create the permission object if a permission_id exists
        permission: row.permission_id ? {
            id: row.permission_id,
            status: row.status,
            destination: row.destination,
            reason: row.reason,
            expected_departure: row.expected_departure,
            expected_return: row.expected_return,
            marks_deducted_cache: row.marks_deducted_cache,
            waived_reason: row.waived_reason,
            issued_by_name: row.issued_by_name
        } : null
    }));
};
/**
 * Fetch the last 50 gate movements with full relationships.
 */
const getGateHistory = async () => {
    return gateRepo.findRecentHistory(50);
};

module.exports = { processCheckpoint, searchEntities, getGateHistory };
