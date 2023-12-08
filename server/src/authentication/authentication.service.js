const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const generateToken = (user, expiresIn) => {
  const token = jwt.sign({ user }, process.env.JWT_SECRET_KEY, { expiresIn : 10000 })
  return token;
};
generateToken()
module.exports = { generateToken };