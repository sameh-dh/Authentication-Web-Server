const { userInfo} = require("../user/user.service");
const jwt = require("jsonwebtoken");

require("dotenv").config();


const  verifyToken = async (req, res, next) => {
  const email = req.body.email;
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Token is missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: err});
    }
    let userData =  await userInfo(email)
    res.status(200).json({ message: "info get it", ok: true ,data: userData});
    req.info = decoded;
    
  });
}

module.exports = {
  verifyToken,
};
