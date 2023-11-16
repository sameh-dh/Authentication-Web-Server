const crypto = require('crypto');
const NodeCache = require("node-cache");
const Cache = new NodeCache({  });

const secretKey = crypto.randomBytes(32); // 256 bits for AES-256
const iv = crypto.randomBytes(16); // 128 bits for AES
require("dotenv").config();
const encrypt = (text) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

const decrypt = (encryptedText) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}

const storeVerificationCode = (email, code) => {
    const hashed_code = encrypt(code)
    obj = { "email": email, "hashed_code": hashed_code };
    Cache.set("data", obj);
}

const retrieveVerificationCode = () => {         

    const data = Cache.get("data")
    if (!data) {
        return null
    } else {
        return decrypt(data.hashed_code);
    }

    // return codeCache.get(email);
}

module.exports = { storeVerificationCode, retrieveVerificationCode }