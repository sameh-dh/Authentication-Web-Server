const { sendEmailVerification } = require("./emailVerif");


const router = require('express').Router();

router.post('/emailSend', sendEmailVerification)


module.exports = router;