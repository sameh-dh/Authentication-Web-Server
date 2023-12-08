const {
  registerController,
  loginController,
  verify_email,
  forget_password,
  verify_check_code_password,
  updatePasswordController,
  loginWGController
} = require("./authentication.controller");
const limiter = require("../../../Providers/request_limiter");



const router = require("express").Router();


router.post("/register", registerController);
router.post("/login", loginController);
router.post("/googleLogin", loginWGController);

router.post("/verify_email", verify_email);

router.post("/forget_password", forget_password);
router.post("/verify_check_password", verify_check_code_password);
router.post("/updatePassword",updatePasswordController)



module.exports = router;
