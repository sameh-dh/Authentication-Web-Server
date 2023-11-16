const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { getUserByEmailAndPasswordService } = require("../user/user.service");
const { generateToken } = require("../authentication/authentication.service");
const { temp } = require("./temp");

const sendEmailVerification = async (req, res) => {
  const { email } = req.body;
  try {
    // Check if the email exists in the database
    const user = await getUserByEmailAndPasswordService(email);

    if (!user) {
      console.log("User not found for email:", email);
      // Send a response to the client indicating that the user was not found
      return res.status(404).json({ message: "User not found for the given email" });
    }

    // Generate a token with user information
    const token = generateToken(user, "1h");

    // Set up the email transporter
    const transporter = nodemailer.createTransport({
      host: "e-tafakna.com",
      port: 465,
      auth: {
        user: "no-reply@e-tafakna.com",
        pass: "kVM^tE9IakqD",
      },
    });

    // Set up the email options
    const mailOptions = {
      from: "no-reply@e-tafakna.com",
      to: email,
      subject: "Click here to confirm verification",
      text: "Hello. This email is for your email verification.",
      html: temp(`http://localhost:5173/newPassword?token=${token}`),
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");

    // Send a response to the client indicating that the email was sent successfully
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    // Send an error response to the client
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { sendEmailVerification };