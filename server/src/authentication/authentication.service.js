const jwt = require("jsonwebtoken");
const generateToken = (user,expiresIn) => {
    const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn })
    return token;
  };
  module.exports = {generateToken};