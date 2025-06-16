const mongoose = require("mongoose");

const partnerSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    partner_name: {
      type: String,
      required: true,
    },
    partner_email: {
      type: String,
      required: true,
      unique: true,
    },
    partner_number: {
      type: String,
      required: true,
    },
    partner_location: {
      type: String,
      required: true,
    },
    partner_state: {
      type: String,
      required: true,
    },
    partner_earning: {
      type: String,
      required: true,
    },
    contact_method: {
      type: String,
      required: false,
    },
    experience: {
      type: [String],
      required: false,
      default: [],
    },
    experienceOther: {
      type: String,
      required: false,
    },
    currentlyPromote: {
      type: String,
      required: false,
    },
    promotionDetails: {
      type: String,
      required: false,
    },
    weeklyReach: {
      type: String,
      required: false,
    },
    languages: {
      type: [String],
      required: false,
      default: [],
    },
    languageOther: {
      type: String,
      required: false,
    },
    weeklyHours: {
      type: String,
      required: false,
    },
    promotionMethod: {
      type: String,
      required: false,
    },
    zoomTraining: {
      type: String,
      required: false,
    },
    bonusEligible: {
      type: String,
      required: false,
    },
    selfie: {
      type: String,
      required: false,
    },
    referralCode: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("partner", partnerSchema);
