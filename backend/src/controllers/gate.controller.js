const gateService = require('../services/gate.service');

const VALID_DIRECTIONS = ['IN', 'OUT'];
const VALID_ASSET_TYPES = ['Supply_Delivery', 'School_Property_Movement', 'Personal_Belongings'];

/**
 * GET /api/gate/search?query=xyz
 * Instantly look up entities by name, national ID, or license plate.
 */
const searchEntity = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Query parameter is required.',
            });
        }

        const results = await gateService.searchEntities(query);

        return res.status(200).json({
            success: true,
            count: results.length,
            data: results,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Internal server error.',
        });
    }
};

/**
 * POST /api/gate/checkpoint
 * Execute a check-in or check-out transactional border event.
 * Body: { entity_id, direction, items_moved?: { description, type } }
 */
const checkpoint = async (req, res) => {
    try {
        const { entity_id, direction, items_moved } = req.body;

        if (!entity_id || !direction) {
            return res.status(400).json({
                success: false,
                message: 'Fields entity_id and direction are required.',
            });
        }

        if (!VALID_DIRECTIONS.includes(direction)) {
            return res.status(400).json({
                success: false,
                message: `Invalid direction. Must be one of: ${VALID_DIRECTIONS.join(', ')}.`,
            });
        }

        // Validate items_moved if provided
        if (items_moved) {
            if (!items_moved.description || !items_moved.type) {
                return res.status(400).json({
                    success: false,
                    message: 'items_moved must include both description and type.',
                });
            }
            if (!VALID_ASSET_TYPES.includes(items_moved.type)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid items_moved.type. Must be one of: ${VALID_ASSET_TYPES.join(', ')}.`,
                });
            }
        }

        const summary = await gateService.processCheckpoint({
            entityId: entity_id,
            direction,
            loggedBy: req.user.id,
            itemsMoved: items_moved || null,
        });

        return res.status(201).json({
            success: true,
            message: `${direction === 'IN' ? 'Entry' : 'Exit'} logged for ${summary.entityName}.`,
            data: summary,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Internal server error.',
        });
    }
};

/**
 * GET /api/gate/history
 * List the last 50 gate movements with full relationships.
 */
const getHistory = async (req, res) => {
    try {
        const history = await gateService.getGateHistory();
        return res.status(200).json({
            success: true,
            count: history.length,
            data: history,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Internal server error.',
        });
    }
};

module.exports = { searchEntity, checkpoint, getHistory };
