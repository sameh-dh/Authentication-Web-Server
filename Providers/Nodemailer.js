const nodemailer = require('nodemailer');
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: "e-tafakna.com",
    port: 465,

    auth: {
        user: "no-reply@e-tafakna.com",
        pass: "kVM^tE9IakqD",
    },
});

module.exports = transporter