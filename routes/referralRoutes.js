const express = require("express");
const router = express.Router();
const referralController = require("../controllers/referralController");
const authHandler = require("../middlewares/authMiddleware");
const multer = require("multer");

const upload = multer(); // No file uploads, only text fields

router.post("/generate", authHandler, async (req, res) => {
  const { partnerId, offerId } = req.body;

  if (!partnerId || !offerId) {
    return res
      .status(400)
      .json({ error: "partnerId and offerId are required" });
  }

  try {
    const referralLink = await referralController.generateReferralLink(
      partnerId,
      offerId
    );
    res.status(200).json({ referralLink });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/submit-form", upload.none(), async (req, res) => {
  console.log("Received submit-form request, body:", req.body);
  const {
    referralId,
    partnerId,
    offerId,
    fname,
    lname,
    email,
    phoneNo,
    medicaidMedicare,
    address,
    state,
    city,
    postalCode,
    country,
    dob,
    ssn,
    gender,
    hasSpouse,
    spouseFname,
    spouseLname,
    spouseSsn,
    enrollSpouse,
  } = req.body;

  if (!referralId || !partnerId || !offerId || !email) {
    console.log("Missing required fields:", {
      referralId,
      partnerId,
      offerId,
      email,
    });
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await referralController.processFormSubmission({
      referralId,
      partnerId,
      offerId,
      fname,
      lname,
      email,
      phoneNo,
      medicaidMedicare,
      address,
      state,
      city,
      postalCode,
      country,
      dob,
      ssn,
      gender,
      hasSpouse,
      spouseFname,
      spouseLname,
      spouseSsn,
      enrollSpouse,
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in submit-form:", error.message);
    res.status(400).json({ error: error.message });
  }
});

router.get("/:referralId", async (req, res) => {
  const { referralId } = req.params;

  try {
    const referral = await referralController.getReferralDetails(referralId);
    res.status(200).json(referral);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Modified route: Removed authHandler
router.get("/submissions/partner/:partnerId", async (req, res) => {
  try {
    const result = await referralController.getFormSubmissionsByPartner(req);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in get submissions by partner:", error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
