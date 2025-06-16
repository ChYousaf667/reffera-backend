const asyncHandler = require("express-async-handler");
const partnerModel = require("../models/partnerModel");

const addpartner = asyncHandler(async (req, res) => {
  const {
    partner_name,
    partner_email,
    partner_number,
    partner_location,
    partner_state,
    partner_earning,
    contact_method,
    experience,
    experienceOther,
    currentlyPromote,
    promotionDetails,
    weeklyReach,
    languages,
    languageOther,
    weeklyHours,
    promotionMethod,
    zoomTraining,
    bonusEligible,
    referralCode,
  } = req.body;

  const selfie = req.file ? req.file.path : null;

  console.log("Received partner data:", req.body, "Selfie:", selfie);
  console.log("User ID from token:", req.user?._id);

  if (
    !partner_name ||
    !partner_email ||
    !partner_number ||
    !partner_location ||
    !partner_state ||
    !partner_earning
  ) {
    res.status(400);
    throw new Error(
      "Please enter all required fields: name, email, number, location, state, earning"
    );
  }

  const findpartner = await partnerModel.findOne({ partner_email });
  if (findpartner) {
    res.status(400);
    throw new Error("Email already exists");
  }

  try {
    const createdpartner = await partnerModel.create({
      user: req.user._id,
      partner_name,
      partner_email,
      partner_number,
      partner_location,
      partner_state,
      partner_earning,
      contact_method,
      experience: Array.isArray(experience) ? experience : [],
      experienceOther,
      currentlyPromote,
      promotionDetails,
      weeklyReach,
      languages: Array.isArray(languages) ? languages : [],
      languageOther,
      weeklyHours,
      promotionMethod,
      zoomTraining,
      bonusEligible,
      selfie,
      referralCode,
    });
    console.log("Partner created:", createdpartner);
    res.status(201).json(createdpartner);
  } catch (error) {
    console.error("Error creating partner:", error);
    res.status(500);
    throw new Error("Failed to create partner");
  }
});

const getAllpartner = asyncHandler(async (req, res) => {
  const allPartners = await partnerModel.find();
  res.json(allPartners);
});

const deleteAllpartner = asyncHandler(async (req, res) => {
  await partnerModel.deleteMany({});
  res.json("All partners deleted");
});

const deletepartner = asyncHandler(async (req, res) => {
  const partnerId = req.params.partnerId;
  const partner = await partnerModel.findById(partnerId);
  if (!partner) {
    res.status(404);
    throw new Error("Partner not found");
  }
  await partnerModel.findByIdAndDelete(partnerId);
  res.json("Partner deleted");
});

const updatepartner = asyncHandler(async (req, res) => {
  const partnerId = req.params.partnerId;
  const {
    partner_name,
    partner_email,
    partner_number,
    partner_location,
    partner_state,
    partner_earning,
    contact_method,
    experience,
    experienceOther,
    currentlyPromote,
    promotionDetails,
    weeklyReach,
    languages,
    languageOther,
    weeklyHours,
    promotionMethod,
    zoomTraining,
    bonusEligible,
    referralCode,
  } = req.body;

  const selfie = req.file ? req.file.path : null;

  console.log(
    "Received update partner data:",
    req.body,
    "Selfie:",
    selfie,
    "for partner:",
    partnerId
  );

  if (
    !partner_name ||
    !partner_email ||
    !partner_number ||
    !partner_location ||
    !partner_state ||
    !partner_earning
  ) {
    res.status(400);
    throw new Error(
      "Please enter all required fields: name, email, number, location, state, earning"
    );
  }

  const partner = await partnerModel.findById(partnerId);
  if (!partner) {
    res.status(404);
    throw new Error("Partner not found");
  }

  const existingpartner = await partnerModel.findOne({
    partner_email,
    _id: { $ne: partnerId },
  });
  if (existingpartner) {
    res.status(400);
    throw new Error("Email already exists");
  }

  try {
    const updatedpartner = await partnerModel.findByIdAndUpdate(
      partnerId,
      {
        partner_name,
        partner_email,
        partner_number,
        partner_location,
        partner_state,
        partner_earning,
        contact_method,
        experience: Array.isArray(experience) ? experience : [],
        experienceOther,
        currentlyPromote,
        promotionDetails,
        weeklyReach,
        languages: Array.isArray(languages) ? languages : [],
        languageOther,
        weeklyHours,
        promotionMethod,
        zoomTraining,
        bonusEligible,
        selfie: selfie || partner.selfie,
        referralCode,
      },
      { new: true }
    );
    console.log("Partner updated:", updatedpartner);
    res.status(200).json(updatedpartner);
  } catch (error) {
    console.error("Error updating partner:", error);
    res.status(500);
    throw new Error("Failed to update partner");
  }
});

module.exports = {
  addpartner,
  getAllpartner,
  deleteAllpartner,
  deletepartner,
  updatepartner,
};
