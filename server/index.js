const authentication = require("./src/authentication/authentication.routes")
const express = require("express");
const cors = require("cors")
const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }))
const cookie = require("cookie-parser");
app.use(cookie());


app.use("/authentication" ,authentication);

app.get("/", (req, res) => {
  res.send({ msg: "etafakna web server working.." });
});

app.listen(PORT, function () {
  console.log("listening on port 3005!");
});