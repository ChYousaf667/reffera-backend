const asyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

const authHandler = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Received token:", token); // Debugging
      let decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded JWT:", decode); // Debugging
      req.user = await userModel.findById(decode.id);
      if (!req.user) {
        console.error("User not found for ID:", decode.id);
        res.status(401);
        throw new Error("User associated with token not found");
      }
      next();
    } catch (error) {
      console.error("Token verification error:", error.message); // Enhanced debugging
      if (error.name === "TokenExpiredError") {
        res.status(401);
        throw new Error("Token expired. Please log in again.");
      } else if (error.name === "JsonWebTokenError") {
        res.status(401);
        throw new Error("Invalid token format or signature");
      } else {
        res.status(401);
        throw new Error("Token verification failed");
      }
    }
  } else {
    console.error("No token provided in Authorization header");
    res.status(401);
    throw new Error("No authentication token provided");
  }
});

module.exports = authHandler;
