const {
  addUserService,
  getUserByEmailAndPasswordService,
} = require("../user/user.service");
const {
  generateToken
} = require("./authentication.service")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerController = async (req, res) => {
  try {
    const { email, password } = req.body;

    bcrypt.genSalt(13, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, password) {
        try {
          const result = await addUserService({ email, password });
          if (result === null) {
            res
              .status(200)
              .json({ message: "No user were registred.", ok: false });
          } else {
            res
              .status(200)
              .json({ message: "user registred successfully.", ok: true });
          }
        } catch (error) {
          return res.json({ error: error?.message ? error.message : error });
        }
      });
    });
  } catch (error) {
    return res.json({ error: error?.message ? error.message : error });
  }
};
const loginController = async (req, res) => {
  
  try {
    const { email, password } = req.body;
    const hashpassword = await getUserByEmailAndPasswordService(email);
    if (!hashpassword) {
      res.status(404).json({ message: "User not found.", ok: false });
    } else {
      bcrypt.compare(password, hashpassword[0].password, function (err, result) {
        if (result) {
          const token = generateToken({
            id: hashpassword[0].idUser,
            email: hashpassword[0].email,
          },10*1000);
          const refreshtoken = generateToken({
            id: hashpassword[0].idUser,
            email: hashpassword[0].email,
          },10*1000);
          res
            .status(200)
            .cookie("refreshtoken", refreshtoken, {
              httpOnly: true,
              secure: true,
            })
            .cookie("jwt", token, {
              httpOnly: true,
              secure: true,
            })
            .json({
              message: "User logged successfully",
              ok: true,
              token,
              refreshtoken
            });
            
        } else {
          res
            .status(200)
            .json({ message: "not credentials matching", ok: false });
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: error?.message ? error.message : error });
  }
};

module.exports = {
  registerController,
  loginController
};
