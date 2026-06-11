const permissionService = require('../services/permission.service');

/**
 * POST /api/permissions/issue
 * Issue a new departure permission slip for an entity.
 * Body: { entity_id, reason, destination, expected_departure, expected_return }
 */
const issuePermission = async (req, res) => {
    try {
        const { entity_id, reason, destination, expected_departure, expected_return } = req.body;

        if (!entity_id || !reason || !destination || !expected_departure || !expected_return) {
            return res.status(400).json({
                success: false,
                message: 'Fields entity_id, reason, destination, expected_departure, and expected_return are required.',
            });
        }

        const permission = await permissionService.issuePermission({
            entityId: entity_id,
            issuedBy: req.user.id,
            reason,
            destination,
            expectedDeparture: expected_departure,
            expectedReturn: expected_return,
        });

        return res.status(201).json({
            success: true,
            message: 'Permission issued successfully.',
            data: permission,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Internal server error.',
        });
    }
};

/**
 * GET /api/permissions/active
 * List all students currently outside school.
 */
const getActivePermissions = async (req, res) => {
    try {
        const permissions = await permissionService.getActivePermissions();
        return res.status(200).json({
            success: true,
            count: permissions.length,
            data: permissions,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Internal server error.',
        });
    }
};

/**
 * GET /api/permissions
 * List all permissions (paginated).
 * Query: ?limit=50&offset=0
 */
const getAllPermissions = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const permissions = await permissionService.getAllPermissions(limit, offset);
        return res.status(200).json({
            success: true,
            count: permissions.length,
            data: permissions,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Internal server error.',
        });
    }
};

/**
 * PUT /api/permissions/:id/waive
 * Waive an automated mark deduction. DOD/Admin only.
 * Body: { waived_reason }
 */
const waivePenalty = async (req, res) => {
    try {
        const permissionId = parseInt(req.params.id);
        const { waived_reason } = req.body;

        if (isNaN(permissionId)) {
            return res.status(400).json({ success: false, message: 'Invalid permission ID.' });
        }

        const updated = await permissionService.waivePenalty(permissionId, waived_reason, req.user);

        return res.status(200).json({
            success: true,
            message: `Penalty for permission #${permissionId} has been waived.`,
            data: updated,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Internal server error.',
        });
    }
};

module.exports = { issuePermission, getActivePermissions, getAllPermissions, waivePenalty };
