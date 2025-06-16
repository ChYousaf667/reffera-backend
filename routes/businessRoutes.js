const express = require("express");
const router = express.Router();
const {
  registerBusiness,
  loginBusiness,
  getBusinessProfile,
  getBusinesses,
  getBusinessById,
  editBusiness,
  editBusinessById,
  deleteBusiness,
} = require("../controllers/businessController");
const { protectBusiness } = require("../middlewares/businessAuthMiddleware");

// Public routes
router.post("/register", registerBusiness);
router.post("/login", loginBusiness);
router.get("/businesses", getBusinesses);
router.get("/:id", getBusinessById);
router.put("/edit/:id", editBusinessById);
router.delete("/delete/:id", deleteBusiness);

// Protected routes
router.get("/profile", protectBusiness, getBusinessProfile);
router.put("/edit", protectBusiness, editBusiness);

module.exports = router;
