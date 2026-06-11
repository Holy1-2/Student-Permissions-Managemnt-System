const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permission.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// All permission routes require authentication
router.use(authenticate);

// GET /api/permissions — List all permissions (Admin, DOD, Patron, Matron)
router.get(
    '/',
    authorize('Admin', 'DOD', 'Patron', 'Matron'),
    permissionController.getAllPermissions
);

// POST /api/permissions/issue — Issue a departure slip (Discipline Staff + Admin)
router.post(
    '/issue',
    authorize('Admin', 'DOD', 'Patron', 'Matron'),
    permissionController.issuePermission
);

// GET /api/permissions/active — Fetch currently active (outside) students
router.get(
    '/active',
    authorize('Admin', 'DOD', 'Patron', 'Matron'),
    permissionController.getActivePermissions
);

// PUT /api/permissions/:id/waive — Waive penalty (DOD and Admin only)
router.put(
    '/:id/waive',
    authorize('Admin', 'DOD'),
    permissionController.waivePenalty
);

module.exports = router;
