const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authenticate");

const {
  login,
  logout,
  register,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", authenticate, logout);
router.get("/request-password-reset", authenticate, requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
