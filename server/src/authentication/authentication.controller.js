const {
  addUserService,
  getUserByEmailAndPasswordService,
  email_check,
  updateUserStatus,
  checkUserStatus
} = require("../user/user.service");
const { generateToken } = require("./authentication.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../../../Providers/Nodemailer");
const {
  generateVerificationCode,
} = require("../../../Providers/generate_code_reset_password");
const {
  storeVerificationCode,
  retrieveVerificationCode,
} = require("../../../Providers/store_in_cache");

const registerController = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      surname,
      phone_number,
      photo_user,
      governorat,
      pays,
      bio,
    } = req.body;

    bcrypt.genSalt(13, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, password) {
        try {
          const result = await addUserService({
            email,
            password,
            name,
            surname,
            phone_number,
            photo_user,
            governorat,
            pays,
            bio,
          });
          if (result === null) {
            res
              .status(200)
              .json({ message: "No user were registred.", ok: false });
          } else {
            // const token = generateToken({
            //   id: hashpassword[0].idUser,
            //   email: hashpassword[0].email,
            // }, '1d');
            await sending_verif_email(email);
            res
              .status(200)
              .cookie("email", email, {
                httpOnly: true,
                secure: false,
              })
              .json({
                message: "user info registred successfully.",
                ok: true,
                res: result,
              });
          }
          const token = generateToken(
            {
              id: result.insertId,
              email: email,
              password: password,
              name,
              surname,
              phone_number,
              photo_user,
              governorat,
              pays,
              bio,
            },
            "1d"
          );
          console.log(token);
        } catch (error) {
          res.send({ error: error?.message ? error.message : error });
          // return res.json({ error: error?.message ? error.message : error });
        }
      });
    });
  } catch (error) {
    res.send({ error: error?.message ? error.message : error });
    // return res.json({ error: error?.message ? error.message : error });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashpassword = await getUserByEmailAndPasswordService(email);
    if (!hashpassword) {
      res
        .status(404)
        .json({ message: "User not found.", ok: false, error: "email" });
    } else {
      bcrypt.compare(
        password,
        hashpassword[0].password,
        async function (err, result) {
          if (result) {
            try {
              const result = await checkUserStatus(email)
              if (result.length) {
                console.log(result)
                const token = generateToken({
                  id: hashpassword[0].idUser,
                  email: hashpassword[0].email,
                }, "1d");
                const refreshtoken = generateToken({
                  id: hashpassword[0].idUser,
                  email: hashpassword[0].email,
                }, "1d");
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
                    refreshtoken,
                  });
                console.log(token);
              } else {
                res.status(403).json({
                  message: "account not verified/activated",
                  ok: false,
                });
              }
            } catch (err) {
              console.log(err)
            }
          } else {
            res.status(200).json({
              message: "Password not matching",
              ok: false,
              error: "password",
            });
          }
        }
      );
    }
  } catch (error) {
    res.status(500).json({ error: error?.message ? error.message : error });
  }
};

const sending_verif_email = async (toEmail) => {
  try {
    const token = jwt.sign({ email: toEmail }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const verificationLink = `http://localhost:5173/logIn/verify?token=${token}`;

    const mailOptions = {
      from: "no-reply@e-tafakna.com",
      to: toEmail,
      subject: "Email Verification",
      html: `<h1 style="font-weight:bold">Click the following link to verify your email: </h><a href="${verificationLink}">${verificationLink}</a>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent: ${info.response}`);
    return info;
  } catch (error) {
    console.error(`Error sending verification email: ${error.message}`);
  }
};

const verify_email = async (req, res) => {
  const { token } = req.query;
  console.log(token);
  const { actual_email } = req.body;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error(`JWT verification failed: ${err.message}`);
      return res
        .status(400)
        .json({ ok: false, message: "Invalid or expired token" });
    }
    const userEmailFromToken = decoded.email;
    const userActualEmail = actual_email;

    if (userEmailFromToken !== userActualEmail) {
      console.error("Email in token does not match the user's actual email");
      return res.status(400).json({ ok: false, message: "Email mismatch" });
    }
    res.status(200).json({ ok: true, message: "Email verified successfully" });
    // send request to activate the user account / status : activated
    updateUserStatus(userActualEmail)
      .then((res) => console.log("---------> account activated", res))
      .catch((err) => console.log("------>account issue activation", err));
  });
  req.session.user = actual_email;
};

const forget_password = async (req, respond) => {
  const { toEmail } = req.body;
  email_check(toEmail).then((res) => {
    if (res.length > 0) {
      try {
        const code_confirmation = generateVerificationCode();

        const mailOptions = {
          from: "no-reply@e-tafakna.com",
          to: toEmail,
          subject: "Reset password",
          html: `Your verification code is: ${code_confirmation}`,
        };

        transporter.sendMail(mailOptions).then((info) => {
          // une fois el email teb3ath - yaani el code wsel , so it should be a sign to store the code of confirmation in the cache of the server , as email and it's code.
          storeVerificationCode(toEmail, code_confirmation);
          // retrieveVerificationCode(toEmail)
          // setTimeout(() => {
          //   retrieveVerificationCode(toEmail);
          // }, 50000);
          respond.status(200).json({
            message: `Verification email sent: ${info.response}`,
            ok: true,
          });
        });
      } catch (error) {
        console.error(`Error sending reset password email: ${error.message}`);
        respond.status(404).json({
          message: `Error sending reset password email: ${error.message}`,
        });
      }
    } else {
      respond.status(404).json({ ok: false, message: "Email does not exist" });
    }
  });
};


const verify_check_code_password = async (req, res) => {

  const { code } = req.body;
  const hashed_code = retrieveVerificationCode();
  if (!hashed_code) {
    res.status(403).json({ message: "Token expired", ok: false })
  } else {
    if (hashed_code !== code) {
      console.log("*********************", hashed_code)
      console.log("*********************", code)
      console.log('-----------------CODE FALSE')
      res.status(404).json({ message: "Code does not match the code in email", ok: false })
    } else {
      res.status(200).json({ message: "Matching code", ok: true })
    }
  }


};




module.exports = {
  registerController,
  loginController,
  verify_email,
  forget_password,
  verify_check_code_password
};
