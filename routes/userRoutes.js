const express = require("express");
const {
  registerUser,
  loginUser,
  verifyOTP,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");
const authHandler = require("../middlewares/authMiddleware");

const userRouter = express.Router();

userRouter.post("/register-user", registerUser);
userRouter.post("/login-user", loginUser);
userRouter.post("/verify-otp", authHandler, verifyOTP);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

module.exports = userRouter;
