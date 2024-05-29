/**
 * @module AuthMiddleware
 *
 * This module provides middleware functions for authentication and authorization.
 * It includes a function to extract the token from the request header and a middleware to enforce role-based access control.
 */

const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

/**
 * Utility to extract token from request header
 * @param {Object} req - Express request object
 * @returns {String} - Extracted token
 * @throws {Error} - If no token is provided
 */
const getTokenFromHeader = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No token provided');
    }
    return authHeader.split(' ')[1];
};

/**
 * Middleware to require a specific role for access
 * @param {Array} allowedRoles - Array of roles allowed to access the route
 * @returns {Function} - Express middleware function
 */
exports.requireRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            const token = getTokenFromHeader(req);
            const decoded = jwt.verify(token, jwtSecret);
            if (!allowedRoles.includes(decoded.role)) {
                console.log(`Role ${decoded.role} not allowed`); // Debugging: log the denied role
                return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
            }

            req.user = decoded; // Add the decoded user to the request object
            next();
        } catch (error) {
            const status = error.message === 'No token provided' ? 401 : 403;
            res.status(status).json({ error: error.message });
            console.log(`Error: ${error.message}`); // Debugging: log the error message
        }
    };
};

/**
 * Middleware to refresh the JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.refreshToken = (req, res) => {
    const { refreshToken } = req.body;
    jwt.verify(refreshToken, jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Unauthorized: Invalid refresh token" });
        }
        const newAccessToken = jwt.sign({ id: decoded.id, role: decoded.role }, jwtSecret, { expiresIn: '15m' });
        res.json({ accessToken: newAccessToken });
    });
};
