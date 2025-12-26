const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/verifyToken");
const { signup, login } = require("./controllers/authentication");
const {
  forgotPassword,
  changePassword,
  updateProfile,
  deleteUserData,
  logout,
  profileSet,
} = require("./controllers/forgotPassword");
const { appleLogin } = require("./controllers/appleLogin");
const { googleLogin } = require("./controllers/googleLogin");

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/googleLogin", googleLogin);
router.post("/appleLogin", appleLogin);
router.post("/forgotPassword", forgotPassword);

// Protected routes below
router.use(verifyToken);

router.post("/resetPassword", changePassword);
router.put("/updateProfile", updateProfile);
router.delete("/deleteUser", deleteUserData);
router.post("/profileSet", profileSet);
router.post("/logout", logout);

module.exports = router;
