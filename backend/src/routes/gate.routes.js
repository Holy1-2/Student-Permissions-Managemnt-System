const express = require('express');
const router = express.Router();
const gateController = require('../controllers/gate.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// All gate routes require authentication
router.use(authenticate);

// GET  /api/gate/search?query=xyz — Entity lookup (Gatekeeper + all senior roles)
router.get(
    '/search',
    authorize('Admin', 'DOD', 'Patron', 'Matron', 'Gatekeeper'),
    gateController.searchEntity
);

// POST /api/gate/checkpoint — Log a gate crossing event (Gatekeeper + Admin)
router.post(
    '/checkpoint',
    authorize('Admin', 'Gatekeeper'),
    gateController.checkpoint
);

// GET  /api/gate/history — View last 50 movements (Admin, DOD, Patron, Matron)
// Gatekeepers are blocked from the history/dashboard view
router.get(
    '/history',
    authorize('Admin', 'DOD', 'Patron', 'Matron'),
    gateController.getHistory
);

module.exports = router;
