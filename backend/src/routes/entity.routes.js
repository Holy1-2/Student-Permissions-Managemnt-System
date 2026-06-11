const express = require('express');
const router = express.Router();
const entityController = require('../controllers/entity.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// All entity routes require authentication
router.use(authenticate);

// POST /api/entities — Manually register a new entity (Admin, DOD, Patron, Matron)
router.post(
    '/',
    authorize('Admin', 'DOD', 'Patron', 'Matron'),
    entityController.createEntity
);

// GET /api/entities — List entities, optional ?type=Student filter
router.get(
    '/',
    authorize('Admin', 'DOD', 'Patron', 'Matron', 'Gatekeeper'),
    entityController.getEntities
);

// GET /api/entities/:id — Get a single entity by ID
router.get(
    '/:id',
    authorize('Admin', 'DOD', 'Patron', 'Matron', 'Gatekeeper'),
    entityController.getEntityById
);

module.exports = router;
