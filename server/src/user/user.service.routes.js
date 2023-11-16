const { addUserService,
    updateUserService,
    getUserByIdService,
    getAllUserService,
    deleteUserByIdService,
    getUserByEmailAndPasswordService,
    email_check,
    updateUserStatus,
    checkUserStatus } = require("./user.service");


const router = require('express').Router();

router.get('/login', getUserByEmailAndPasswordService)


module.exports = router;