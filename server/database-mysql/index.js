var mysql = require("mysql2");
require("dotenv").config();

var connection = mysql.createPool({
  connectionLimit: process.env.CONNECTIONLIMIT || 100,
  host: process.env.MYSQL_HOST || "containers-us-west-185.railway.app",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "RXAYxJMEpreGnt1ymdrQ",
  database: process.env.MYSQL_DATABASE || "railway",
  charset: "cp1256",
  port: 6470,
});
connection.getConnection((err, success) => {
  if (err) {
    console.log(err);
  } else {
    console.log("My SQL Database Connected..");
  }
});
module.exports = connection;

