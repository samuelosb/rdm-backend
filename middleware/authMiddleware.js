const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

// Utility to extract token from request header
const getTokenFromHeader = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No token provided');
    }
    return authHeader.split(' ')[1];
};

exports.requireRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            const token = getTokenFromHeader(req);
            const decoded = jwt.verify(token, jwtSecret);
            if (!allowedRoles.includes(decoded.role)) {
                return res.status(403).json({error: "Forbidden: Insufficient permissions"});
            }
            req.user = decoded; // Add the decoded user to the request object
            next();
        } catch (error) {
            const status = error.message === 'No token provided' ? 401 : 403;
            res.status(status).json({error: error.message});
        }
    };
};


exports.refreshToken = (req, res) => {
    const {refreshToken} = req.body;
    jwt.verify(refreshToken, jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(401).json({error: "Unauthorized: Invalid refresh token"});
        }
        const newAccessToken = jwt.sign({id: decoded.id, role: decoded.role}, jwtSecret, {expiresIn: '15m'});
        res.json({accessToken: newAccessToken});
    });
};
