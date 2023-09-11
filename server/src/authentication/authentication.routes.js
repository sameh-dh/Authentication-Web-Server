const {
  registerController,
  loginController,
  verify_email,
  forget_password,
  verify_check_code_password
} = require("./authentication.controller");
const limiter = require("../../../Providers/request_limiter");



const router = require("express").Router();


router.post("/register", registerController);
router.post("/login", limiter, loginController);

router.post("/verify_email", verify_email);

router.post("/forget_password", forget_password);
router.post("/verify_check_password", verify_check_code_password);



module.exports = router;
