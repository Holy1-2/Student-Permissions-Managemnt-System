require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Route imports
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const permissionRoutes = require('./routes/permission.routes');
const gateRoutes = require('./routes/gate.routes');
const entityRoutes = require('./routes/entity.routes');

const app = express();

// ── Global Middleware ────────────────────────────────────────────────────────
app.use(cors({
    origin: 'http://localhost:5173', // Vite client local port
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request Logger (dev only) ────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
    app.use((req, _res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
        next();
    });
}

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        success: true,
        system: 'GateFlow Backend',
        version: '1.0.0',
        status: 'operational',
        timestamp: new Date().toISOString(),
    });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/gate', gateRoutes);
app.use('/api/entities', entityRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found.',
    });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('[Error]', err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'An unexpected error occurred.',
    });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 GateFlow Backend running on port ${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
