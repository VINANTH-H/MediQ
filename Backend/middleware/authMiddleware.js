import jwt from 'jsonwebtoken';

// Middleware to verify JWT token and extract user details
export const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ error: 'Not authorized, no token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request object
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({ error: 'Not authorized, token failed or expired' });
    }
};

// Middleware to restrict access to specific roles
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access Denied: You do not have permission to perform this action' });
        }
        next();
    };
};
