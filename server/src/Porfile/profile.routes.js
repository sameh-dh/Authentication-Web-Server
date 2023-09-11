const { verifyToken } = require("./profile.controller");


const router = require('express').Router();

router.get('/infoUser', verifyToken)


module.exports = router;