const crypto = require('crypto');
require("dotenv").config();
const generateVerificationCode = () => {
    return crypto.randomBytes(2).toString('hex').toUpperCase();
}

module.exports = { generateVerificationCode }