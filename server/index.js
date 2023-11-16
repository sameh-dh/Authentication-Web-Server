const authentication = require("./src/authentication/authentication.routes")
const profile = require("./src/Porfile/profile.routes")
const sendmail = require('./src/Template/email.routes')
const express = require("express");
const cors = require("cors")
const session = require('express-session');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" ,credentials: true
}))
const cookie = require("cookie-parser");
app.use(cookie());

const secret = crypto.randomBytes(64).toString('hex');

app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // Set the cookie expiration time
}));


app.use("/authentication", authentication);
app.use("/profile", profile);
app.use("/sendMail", sendmail);

app.get("/", (req, res) => {
  res.send({ msg: "etafakna web server working.." });
});

app.listen(PORT, function () {
  console.log("listening on port 3005!");
});