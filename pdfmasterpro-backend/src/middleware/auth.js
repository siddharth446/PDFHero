const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token (Supabase model already excludes password)
            req.user = await User.findById(decoded.id);

            if (!req.user) {
                res.status(401);
                throw new Error('User not found');
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            return next(new Error('Not authorized'));
        }
    }

    if (!token) {
        res.status(401);
        const error = new Error('Not authorized, no token');
        return next(error);
    }
};

module.exports = { protect };
