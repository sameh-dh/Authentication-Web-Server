const { getUserByIdService } = require("../user/user.service");
const jwt = require("jsonwebtoken");
require("dotenv").config();
function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Token is missing" });
  }
  jwt.verify(token, "f34f714b45834e9586924c764354e1235f6789ab0cd1ef20314567890abcdef", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(200).json({ message: "info get it", ok: true });
    req.info = decoded;
  });
}

module.exports = {
  verifyToken,
};
