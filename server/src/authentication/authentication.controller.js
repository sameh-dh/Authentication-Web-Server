const {
  addUserService,
  getUserByEmailAndPasswordService,
  email_check,
  updateUserStatus,
  checkUserStatus,
  updatePasswordService,
} = require("../user/user.service");

const { OAuth2Client } = require("google-auth-library");

const { generateToken } = require("./authentication.service");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const transporter = require("../../../Providers/Nodemailer");
require("dotenv").config();
const {
  generateVerificationCode,
} = require("../../../Providers/generate_code_reset_password");

const {
  storeVerificationCode,
  retrieveVerificationCode,
} = require("../../../Providers/store_in_cache");

const { setCache, getCache } = require("../../../Providers/setCache");

const loginWGController = async (req, res) => {
  try {
    const { googleToken } = req.body;

    const YOUR_GOOGLE_CLIENT_ID =
      "992642187010-r9ken3t1skjsbp3adrel4lal14725b97.apps.googleusercontent.com";
    const client = new OAuth2Client(YOUR_GOOGLE_CLIENT_ID);

    // Function to verify the Google token
    const verifyGoogleToken = async (idToken) => {
      try {
        const ticket = await client.verifyIdToken({
          idToken,
          audience: YOUR_GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        return payload;
      } catch (error) {
        console.error("Error verifying Google token:", error);
        throw error;
      }
    };

    // Verify and decode the Google token
    const decodedPayload = await verifyGoogleToken(googleToken);
    const existingUser = await getUserByEmailAndPasswordService(
      decodedPayload.email
    );

    if (existingUser) {
      // User exists, log in the user or perform any other actions
      const token = generateToken(
        {
          id: existingUser.idUser,
          email: existingUser.email,
        },
        "1d"
      );
      setCache("token", token);
      res
        .status(200)
        .json({ success: true, message: "User logged in successfully", token });
    } else {
      // Generate a random password
      const generateRandomPassword = () => {
        const length = 10;
        const charset =
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let password = "";
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * charset.length);
          password += charset.charAt(randomIndex);
        }
        return password;
      };
      const password = generateRandomPassword();
      const { email, name, family_name, picture } = decodedPayload;
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 13);
      // Perform your registration logic here
      const result = await addUserService({
        email,
        password: hashedPassword,
        name : decodedPayload.family_name,
        surname: decodedPayload.given_name,
        photo_user: decodedPayload.picture,
    
      });
      // After registration, you can generate a JWT token and send it as a response
      const token = generateToken(
        {
          id: result.insertId,
          email,
        },
        "1d"
      );
      res
        .status(200)
        .json({
          success: true,
          message: "User registered successfully",
          token,
        });
    }
  } catch (error) {
    console.error("Error handling Google token:", error);
    res
      .status(400)
      .json({
        success: false,
        message: "Invalid Google token. Please try again.",
      });
  }
};

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
          setCache("token", token);
        } catch (error) {
          res.send({ error: error?.message ? error.message : error });
        }
      });
    });
  } catch (error) {
    res.send({ error: error?.message ? error.message : error });
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
      //check password
      bcrypt.compare(
        password,
        hashpassword.password,
        async function (err, result) {
          if (result) {
            try {
              const result = await checkUserStatus(email);
                //  res.json(result)
              if (result.length) {
                const token = generateToken(
                  {
                    id: hashpassword.idUser,
                    email: hashpassword.email,
                  },
                  "1d"
                );
                const refreshtoken = generateToken(
                  {
                    id: hashpassword.idUser,
                    email: hashpassword.email,
                  },
                  "1d"
                );
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
              } else {
                res.status(200).json({
                  message: "account not verified/activated",
                  ok: false,
                });
              }
            } catch (err) {
              console.error(err);
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
    const token = jwt.sign(
      { email: toEmail },
      "f34f714b45834e9586924c764354e1235f6789ab0cd1ef20314567890abcdef",
      {
        expiresIn: "15m",
      }
    );

    const verificationLink = `http://localhost:5173/signIn/verify?token=${token}`;

    const mailOptions = {
      from: "no-reply@e-tafakna.com",
      to: toEmail,
      subject: "Email Verification",
      html: `<h1 style="font-weight:bold">Click the following link to verify your email: </h><a href="${verificationLink}">${verificationLink}</a>`,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error(`Error sending verification email: ${error.message}`);
  }
};

const verify_email = async (req, res) => {
  const { token } = req.query;
  const { actual_email } = req.body;
  jwt.verify(
    token,
    "f34f714b45834e9586924c764354e1235f6789ab0cd1ef20314567890abcdef",
    async (err, decoded) => {
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
      try {
        // Perform asynchronous operations
        await updateUserStatus(userActualEmail);
        const token = await getCache("token");

        // Send both responses
        res
          .status(200)
          .send({
            ok: true,
            message: "Email verified successfully",
            token: token,
          });
      } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ ok: false, message: "Internal server error" });
      }
    }
  );
  req.session.user = actual_email;
};

const forget_password = async (req, respond) => {
  const { toEmail } = req.body;
  const token = await getCache("token");
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
    res.status(403).json({ message: "Token expired", ok: false });
  } else {
    if (hashed_code !== code) {
      res
        .status(404)
        .json({ message: "Code does not match the code in email", ok: false });
    } else {
      res.status(200).json({ message: "Matching code", ok: true });
    }
  }
};

const updatePasswordController = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    try {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 13);
      // Update the user's password in the database
      const result = await updatePasswordService(email, hashedPassword);
      if (result) {
        res
          .status(200)
          .json({ message: "Password updated successfully", ok: true });
      } else {
        res.status(404).json({ message: "User not found", ok: false });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  registerController,
  loginController,
  verify_email,
  forget_password,
  verify_check_code_password,
  updatePasswordController,
  loginWGController,
};