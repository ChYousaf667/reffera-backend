const express = require("express");
const errorHandler = require("./middlewares/errorMiddleware");
const connectDB = require("./config/connectdb");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

const app = express();

require("dotenv").config();
require("colors");

// Configure Cloudinary for file uploads
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for memory storage (temporary, before Cloudinary upload)
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};
const upload = multer({ storage, fileFilter });

// Restrict CORS to frontend domain
app.use(cors({ origin: "https://refeera.vercel.app" }));

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware to handle file uploads to Cloudinary for partner routes
app.use(
  "/api/partner/",
  upload.single("selfie"),
  async (req, res, next) => {
    if (req.file) {
      try {
        // Convert buffer to stream for Cloudinary
        const stream = cloudinary.uploader.upload_stream(
          { folder: "refeera" },
          (error, result) => {
            if (error) {
              return next(error);
            }
            req.file.cloudinaryUrl = result.secure_url; // Store Cloudinary URL
            next();
          }
        );
        Readable.from(req.file.buffer).pipe(stream);
      } catch (error) {
        next(error);
      }
    } else {
      next();
    }
  },
  require("./routes/partnerRoutes")
);

// Routes
app.use("/api/users/", require("./routes/userRoutes"));
app.use("/api/business/", require("./routes/businessRoutes"));
app.use("/api/referral", require("./routes/referralRoutes"));

app.use(errorHandler);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Server started on port: ${PORT.yellow}`));
