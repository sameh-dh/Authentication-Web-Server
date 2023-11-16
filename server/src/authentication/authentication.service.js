const jwt = require("jsonwebtoken");
require("dotenv").config();
const generateToken = (user, expiresIn) => {
  const token = jwt.sign({ user }, "f34f714b45834e9586924c764354e1235f6789ab0cd1ef20314567890abcdef", { expiresIn : 10000 })
  return token;
};
generateToken()
module.exports = { generateToken };