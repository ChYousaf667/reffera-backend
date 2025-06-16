const handler = require("express-async-handler");
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const generateOTP = () => {
  const randomNum = Math.random() * 1000000;
  const FloorNum = Math.floor(randomNum);
  return FloorNum.toString().padStart(6, "0");
};

const sendOTP = (
  email,
  otp,
  id,
  subject = "OTP Verification",
  purpose = "verify"
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP Email Card</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f9;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: #007bff;
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 24px;
    }
    .body {
      padding: 20px;
      text-align: center;
    }
    .otp {
      font-size: 32px;
      font-weight: bold;
      color: #333333;
      margin: 20px 0;
      letter-spacing: 4px;
    }
    .note {
      color: #555555;
      font-size: 14px;
      margin-top: 10px;
    }
    .cta-button {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 30px;
      font-size: 16px;
      color: #ffffff;
      background: #007bff;
      border: none;
      border-radius: 6px;
      text-decoration: none;
      cursor: pointer;
    }
    .cta-button:hover {
      background: #0056b3;
    }
    .footer {
      background: #f4f4f9;
      padding: 10px;
      text-align: center;
      font-size: 12px;
      color: #888888;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      ${purpose === "verify" ? "Verification Code" : "Password Reset Code"}
    </div>
    <div class="body">
      <p>Use the following OTP to ${
        purpose === "verify"
          ? "complete your registration"
          : "reset your password"
      }:</p>
      <div class="otp">${otp}</div>
      <a href="http://localhost:3000/admin/${purpose}/${id}" style='color:white;font-weight:bold;background:green;' class="cta-button">Verify Now</a>
      <p class="note">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
    </div>
    <div class="footer">
      If you didn’t request this, please ignore this email or contact support.
    </div>
  </div>
</body>
</html>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      throw new Error(error.message);
    } else {
      console.log("Mail sent successfully!");
    }
  });
};

const registerUser = handler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }

  const findUser = await userModel.findOne({ email });

  if (findUser) {
    res.status(401);
    throw new Error("Email already exists!");
  }

  const hashedPass = await bcrypt.hash(password, 10);
  const myOTP = generateOTP();

  const createdUser = await userModel.create({
    username,
    email,
    password: hashedPass,
    otp: myOTP,
    isVerified: false,
  });

  sendOTP(email, myOTP, createdUser._id);

  res.status(201).json({
    _id: createdUser._id,
    username: createdUser.username,
    email: createdUser.email,
    message: "Please verify your email with the OTP sent",
    token: generateToken(createdUser._id),
  });
});

const loginUser = handler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }

  const findUser = await userModel.findOne({ email });

  if (!findUser) {
    res.status(404);
    throw new Error("Invalid Email");
  }

  if (!findUser.isVerified) {
    res.status(401);
    throw new Error("Please verify your email first");
  }

  if (await bcrypt.compare(password, findUser.password)) {
    res.json({
      _id: findUser._id,
      username: findUser.username,
      email: findUser.email,
      token: generateToken(findUser._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid password");
  }
});

const verifyOTP = handler(async (req, res) => {
  const user_id = req.user._id;
  const { otp } = req.body;

  if (!otp) {
    res.status(400);
    throw new Error("Please enter the OTP");
  }

  const findUser = await userModel.findById(user_id);

  if (!findUser) {
    res.status(404);
    throw new Error("User not found");
  }

  if (findUser.otp === otp) {
    findUser.otp = null;
    findUser.isVerified = true;
    await findUser.save();
    res.json({
      _id: findUser._id,
      username: findUser.username,
      email: findUser.email,
      token: generateToken(findUser._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid OTP");
  }
});

const forgotPassword = handler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Please provide an email");
  }

  const findUser = await userModel.findOne({ email });

  if (!findUser) {
    res.status(404);
    throw new Error("User not found");
  }

  const resetOTP = generateOTP();
  findUser.resetPasswordToken = resetOTP;
  findUser.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await findUser.save();

  sendOTP(email, resetOTP, findUser._id, "Password Reset OTP", "reset");

  res.status(200).json({
    message: "Password reset OTP sent to your email",
    userId: findUser._id,
  });
});

const resetPassword = handler(async (req, res) => {
  const { userId, otp, newPassword } = req.body;

  if (!userId || !otp || !newPassword) {
    res.status(400);
    throw new Error("Please provide user ID, OTP, and new password");
  }

  const findUser = await userModel.findById(userId);

  if (!findUser) {
    res.status(404);
    throw new Error("User not found");
  }

  if (
    findUser.resetPasswordToken !== otp ||
    findUser.resetPasswordExpires < Date.now()
  ) {
    res.status(401);
    throw new Error("Invalid or expired OTP");
  }

  const hashedPass = await bcrypt.hash(newPassword, 10);
  findUser.password = hashedPass;
  findUser.resetPasswordToken = null;
  findUser.resetPasswordExpires = null;
  await findUser.save();

  res.status(200).json({
    message: "Password reset successfully",
  });
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

module.exports = {
  registerUser,
  loginUser,
  verifyOTP,
  forgotPassword,
  resetPassword,
};
