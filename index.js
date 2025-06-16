const express = require("express");
const errorHandler = require("./middlewares/errorMiddleware");
const connectDB = require("./config/connectDB");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();

require("dotenv").config();
require("colors");

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};
const upload = multer({ storage, fileFilter });

app.use(cors());
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Apply Multer middleware to partner routes
app.use("/api/users/", require("./routes/userRoutes"));
app.use(
  "/api/partner/",
  upload.single("selfie"),
  require("./routes/partnerRoutes")
);

app.use("/api/business/", require("./routes/businessRoutes"));
app.use("/api/referral", require("./routes/referralRoutes"));

app.use(errorHandler);

app.listen(process.env.PORT, () =>
  console.log(`Server started on port: ${process.env.PORT.yellow}`)
);
