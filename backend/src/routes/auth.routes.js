const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /api/auth/signup — Register a new staff account
router.post('/signup', authController.signup);

// POST /api/auth/login — Authenticate and receive JWT
router.post('/login', authController.login);

module.exports = router;
