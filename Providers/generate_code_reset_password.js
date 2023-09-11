const crypto = require('crypto');

const generateVerificationCode = () => {
    return crypto.randomBytes(2).toString('hex').toUpperCase();
}

module.exports = { generateVerificationCode }