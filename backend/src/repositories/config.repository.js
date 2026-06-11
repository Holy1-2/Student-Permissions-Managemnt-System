const db = require('../config/db');

/**
 * Fetch the single school configuration row.
 */
const getConfig = async () => {
    const [rows] = await db.execute('SELECT * FROM school_configs LIMIT 1');
    return rows[0] || null;
};

/**
 * Update Academic Bridge API connection details.
 */
const updateAcademicBridgeConfig = async ({ apiUrl, apiKey }) => {
    await db.execute(
        'UPDATE school_configs SET academic_bridge_api_url = ?, academic_bridge_api_key = ? WHERE id = 1',
        [apiUrl, apiKey]
    );
    return getConfig();
};

/**
 * Update the marks penalty multiplier per hour.
 */
const updatePenaltyRate = async (marksPerHour) => {
    await db.execute(
        'UPDATE school_configs SET marks_penalty_per_hour = ? WHERE id = 1',
        [marksPerHour]
    );
    return getConfig();
};

/**
 * Rotate activation codes for staff registration.
 */
const updateActivationCodes = async ({ gatekeeperCode, disciplineCode }) => {
    await db.execute(
        'UPDATE school_configs SET activation_code_gatekeeper = ?, activation_code_discipline = ? WHERE id = 1',
        [gatekeeperCode, disciplineCode]
    );
    return getConfig();
};

module.exports = {
    getConfig,
    updateAcademicBridgeConfig,
    updatePenaltyRate,
    updateActivationCodes,
};
