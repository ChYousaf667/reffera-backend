const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  primaryContact: { type: String, required: true },
  businessAddress: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true },
  websiteOrSocialMedia: { type: String },
  businessType: [
    {
      type: String,
      enum: [
        "Barbershop or salon",
        "Check-cashing / tax prep",
        "Retail / convenience store",
        "Medical / health services",
        "Immigration services",
        "Legal office",
        "Other",
      ],
    },
  ],
  otherBusinessType: { type: String },
  weeklyFootTraffic: {
    type: String,
    enum: ["0–50", "50–150", "150–500", "500+"],
  },
  hasPromotingEmployees: { type: Boolean },
  promotionalMaterials: [
    {
      type: String,
      enum: [
        "Window sticker",
        "Counter stand or flyers",
        "Door sign",
        "Digital display (TV or tablet QR code)",
      ],
    },
  ],
  onboardingCall: {
    type: String,
    enum: ["Yes", "No"],
  },
  payoutMethod: {
    type: String,
    enum: ["Bank transfer", "Digital card"],
  },
  offerServices: {
    type: String,
    enum: [
      "Yes – we’d like to become an offer partner",
      "No – just referral traffic",
    ],
  },
  referralSource: {
    type: String,
    enum: [
      "Another business",
      "Online",
      "Direct contact",
      "Referred by another partner",
    ],
  },
  referralPartner: { type: String }, // Stores either referral code or name
  isAuthorized: { type: Boolean, required: true },
  isDeleted: { type: Boolean, default: false }, // Still keeping for soft delete if needed elsewhere
  isActive: { type: Boolean, default: true }, // New field for active/inactive status
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Business", businessSchema);
