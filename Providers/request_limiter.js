const rateLimit = require('express-rate-limit');
const requestIp = require('request-ip');
require("dotenv").config();
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    keyGenerator: (req) => {
        return requestIp.getClientIp(req);
    },
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many requests, please try again later.',
        });
    },
});

module.exports = limiter;