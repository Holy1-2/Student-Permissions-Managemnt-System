const adminService = require('../services/admin.service');

/**
 * GET /api/admin/config
 * Retrieve current school configurations (API key masked).
 */
const getConfig = async (req, res) => {
    try {
        const config = await adminService.getConfig();
        return res.status(200).json({ success: true, data: config });
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Internal server error.',
        });
    }
};

/**
 * PUT /api/admin/config/academic-bridge
 * Update the Academic Bridge API connection details.
 * Body: { api_url, api_key }
 */
const updateAcademicBridgeConfig = async (req, res) => {
    try {
        const { api_url, api_key } = req.body;
        const updated = await adminService.updateAcademicBridgeConfig({ apiUrl: api_url, apiKey: api_key });
        return res.status(200).json({
            success: true,
            message: 'Academic Bridge configuration updated successfully.',
            data: updated,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Internal server error.',
        });
    }
};

/**
 * POST /api/admin/sync-students
 * Trigger Academic Bridge student synchronization.
 */
const syncStudents = async (req, res) => {
    try {
        const result = await adminService.syncStudents();
        return res.status(200).json({
            success: true,
            message: result.message,
            data: result,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Internal server error.',
        });
    }
};

/**
 * PUT /api/admin/config/penalty-rate
 * Update marks deduction rate per overdue hour.
 * Body: { marks_per_hour }
 */
const updatePenaltyRate = async (req, res) => {
    try {
        const { marks_per_hour } = req.body;
        if (marks_per_hour === undefined) {
            return res.status(400).json({ success: false, message: 'marks_per_hour is required.' });
        }
        const updated = await adminService.updatePenaltyRate(marks_per_hour);
        return res.status(200).json({
            success: true,
            message: `Penalty rate updated to ${updated.marks_penalty_per_hour} marks/hour.`,
            data: updated,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Internal server error.',
        });
    }
};

/**
 * PUT /api/admin/config/activation-codes
 * Rotate system activation codes.
 * Body: { gatekeeper_code, discipline_code }
 */
const rotateActivationCodes = async (req, res) => {
    try {
        const { gatekeeper_code, discipline_code } = req.body;
        const updated = await adminService.rotateActivationCodes({
            gatekeeperCode: gatekeeper_code,
            disciplineCode: discipline_code,
        });
        return res.status(200).json({
            success: true,
            message: 'Activation codes rotated successfully.',
            data: {
                activation_code_gatekeeper: updated.activation_code_gatekeeper,
                activation_code_discipline: updated.activation_code_discipline,
                updated_at: updated.updated_at,
            },
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Internal server error.',
        });
    }
};

module.exports = {
    getConfig,
    updateAcademicBridgeConfig,
    syncStudents,
    updatePenaltyRate,
    rotateActivationCodes,
};
