const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Verifies the JWT from the Authorization header.
 * Attaches the decoded payload to req.user on success.
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization']|| req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
   try {
    // Add the exact same string fallback constraint used during signing
    const secretKey = process.env.JWT_SECRET || 'my_gate_key_2026_secure';
    const decoded = jwt.verify(token, secretKey);
    
    req.user = decoded; // { id, name, email, role }
    next();
} catch (err) {
    // Logs the exact error signature to the terminal console so you can see it clear as day
    console.error("JWT Verification Error Context:", err.message); 
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
}
};

/**
 * Role-based authorization middleware factory.
 * Pass one or more allowed roles.
 * Usage: authorize('Admin', 'DOD')
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated.' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access forbidden. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}.`,
            });
        }
        next();
    };
};

module.exports = { authenticate, authorize };
