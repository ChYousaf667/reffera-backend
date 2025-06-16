const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Business = require("../models/businessModel");

const protectBusiness = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Received business token:", token); // Debugging
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded business JWT:", decoded); // Debugging
      req.business = await Business.findById(decoded.id).select("-password");

      if (!req.business) {
        console.error("Business not found for ID:", decoded.id);
        res.status(401);
        throw new Error("Not authorized, business not found");
      }

      next();
    } catch (error) {
      console.error("Business token verification error:", error.message);
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
    console.error("No token provided for business authentication");
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protectBusiness };
