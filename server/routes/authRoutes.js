const express = require("express");

const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  register,
  login,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  requestDeleteAccount,
  confirmDeleteAccount,
  updateProfile,
} = require("../controllers/authController");

router.post("/register", register);

router.post("/login", login);

router.post("/verify-email", verifyEmail);

router.post(
  "/resend-verification",
  resendVerificationCode
);
router.post(
  "/forgot-password",
  forgotPassword
);
router.post(
  "/verify-reset-code",
  verifyResetCode
);
router.post(
  "/reset-password",
  resetPassword
);
router.post(
  "/request-delete-account",
  authMiddleware,
  requestDeleteAccount
);

router.post(
  "/confirm-delete-account",
  authMiddleware,
  confirmDeleteAccount
);
router.put(
  "/update-profile",
  authMiddleware,
  updateProfile
);
module.exports = router;