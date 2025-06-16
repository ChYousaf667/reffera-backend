const express = require("express");
const authHandler = require("../middlewares/authMiddleware");
const {
  addpartner,
  getAllpartner,
  deleteAllpartner,
  deletepartner,
  updatepartner,
} = require("../controllers/partnerController");
const partnerModel = require("../models/partnerModel");
const asyncHandler = require("express-async-handler");

const partnerRouter = express.Router();

partnerRouter.post("/add-partner", authHandler, addpartner);
partnerRouter.get("/get-partners", getAllpartner);
partnerRouter.get(
  "/get-partner/:userId",
  authHandler,
  asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const partner = await partnerModel.findOne({ user: userId });
    if (!partner) {
      res.status(404);
      throw new Error("Partner not found");
    }
    res.json(partner);
  })
);
partnerRouter.delete("/delete-partners", deleteAllpartner);
partnerRouter.delete("/delete-partner/:partnerId", deletepartner);
partnerRouter.put("/update-partner/:partnerId", authHandler, updatepartner);

module.exports = partnerRouter;
