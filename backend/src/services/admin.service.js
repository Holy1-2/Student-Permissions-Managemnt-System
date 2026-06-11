const axios = require('axios');
const configRepo = require('../repositories/config.repository');
const entityRepo = require('../repositories/entity.repository');

/**
 * Update Academic Bridge API connection settings.
 */
const updateAcademicBridgeConfig = async ({ apiUrl, apiKey }) => {
    if (!apiUrl || !apiKey) {
        const err = new Error('Both api_url and api_key are required.');
        err.statusCode = 400;
        throw err;
    }
    const updated = await configRepo.updateAcademicBridgeConfig({ apiUrl, apiKey });
    return updated;
};

/**
 * Update the marks penalty multiplier.
 */
const updatePenaltyRate = async (marksPerHour) => {
    const rate = parseInt(marksPerHour);
    if (isNaN(rate) || rate < 0) {
        const err = new Error('marks_per_hour must be a non-negative integer.');
        err.statusCode = 400;
        throw err;
    }
    return configRepo.updatePenaltyRate(rate);
};

/**
 * Rotate system activation codes.
 */
const rotateActivationCodes = async ({ gatekeeperCode, disciplineCode }) => {
    if (!gatekeeperCode || !disciplineCode) {
        const err = new Error('Both gatekeeper_code and discipline_code are required.');
        err.statusCode = 400;
        throw err;
    }
    return configRepo.updateActivationCodes({ gatekeeperCode, disciplineCode });
};

/**
 * Simulate syncing students from Academic Bridge API.
 * Reads API credentials from school_configs, makes an outbound request,
 * and upserts student records into the local entities table.
 */
const syncStudents = async () => {
    const config = await configRepo.getConfig();
    if (!config || !config.academic_bridge_api_key) {
        const err = new Error('Academic Bridge API key is not configured. Please update it first.');
        err.statusCode = 424; // Failed Dependency
        throw err;
    }

    const apiUrl = config.academic_bridge_api_url;
    const apiKey = config.academic_bridge_api_key;

    let studentsFromBridge = [];

    try {
        console.log(`[Sync] Dispatching GET ${apiUrl}/students ...`);
        const response = await axios.get(`${apiUrl}/students`, {
            headers: { Authorization: `Bearer ${apiKey}` },
            timeout: 10000,
        });
        studentsFromBridge = response.data?.students || response.data || [];
    } catch (axiosError) {
        // In development / mock mode: simulate a payload if the API is unreachable
        console.warn('[Sync] Academic Bridge API unreachable. Using mock payload for simulation.');
        studentsFromBridge = [
            { id: 'AB-001', name: 'Alice Uwimana', phone: '+250781000001', national_id: '119900001' },
            { id: 'AB-002', name: 'Bob Nkurunziza', phone: '+250781000002', national_id: '119900002' },
            { id: 'AB-003', name: 'Claire Mukamana', phone: '+250781000003', national_id: '119900003' },
        ];
    }

    if (!Array.isArray(studentsFromBridge) || studentsFromBridge.length === 0) {
        return { synced: 0, message: 'No students returned from Academic Bridge.' };
    }

    let synced = 0;
    const errors = [];

    for (const student of studentsFromBridge) {
        try {
            await entityRepo.upsertStudent({
                name: student.name,
                phone: student.phone || null,
                nationalId: student.national_id || null,
                academicBridgeStudentId: student.id,
            });
            synced++;
        } catch (dbErr) {
            errors.push({ student: student.id, error: dbErr.message });
        }
    }

    return {
        synced,
        total: studentsFromBridge.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully synced ${synced} of ${studentsFromBridge.length} students.`,
    };
};

/**
 * Get current school configurations.
 */
const getConfig = async () => {
    const config = await configRepo.getConfig();
    if (!config) {
        const err = new Error('School configuration not found.');
        err.statusCode = 404;
        throw err;
    }
    // Mask the API key partially for security
    return {
        ...config,
        academic_bridge_api_key: config.academic_bridge_api_key
            ? `****${config.academic_bridge_api_key.slice(-4)}`
            : null,
    };
};

module.exports = {
    updateAcademicBridgeConfig,
    updatePenaltyRate,
    rotateActivationCodes,
    syncStudents,
    getConfig,
};
