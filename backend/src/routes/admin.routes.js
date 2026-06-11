const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const studentController = require('../controllers/studentController');

// All admin routes require authentication + Admin role
router.use(authenticate);
router.use(authorize('Admin'));

// GET  /api/admin/config — View school configurations
router.get('/config', adminController.getConfig);

// ── Student Management Operations ──────────────────────────────────────────
router.post('/register-student', studentController.registerStudent);
router.get('/students', studentController.getAllStudents);            // <-- GET ALL
router.put('/students/:id', studentController.updateStudent);          // <-- UPDATE 
router.delete('/students/:id', studentController.deleteStudent);       // <-- DELETE

// POST /api/admin/sync-students — Trigger Academic Bridge student sync
router.post('/sync-students', adminController.syncStudents);

// PUT  /api/admin/config/academic-bridge — Update Academic Bridge API settings
router.put('/config/academic-bridge', adminController.updateAcademicBridgeConfig);

// PUT  /api/admin/config/penalty-rate — Change marks deduction rate per hour
router.put('/config/penalty-rate', adminController.updatePenaltyRate);

// PUT  /api/admin/config/activation-codes — Rotate staff registration codes
router.put('/config/activation-codes', adminController.rotateActivationCodes);

module.exports = router;