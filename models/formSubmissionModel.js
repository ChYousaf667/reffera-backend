const mongoose = require("mongoose");

const formSubmissionSchema = new mongoose.Schema({
  referralId: { type: String, required: true, ref: "Referral" },
  partnerId: { type: String, required: true, ref: "User" },
  offerId: { type: String, required: true, enum: ["aca", "rx", "medicare"] },
  fname: { type: String, default: "" },
  lname: { type: String, default: "" },
  email: { type: String, required: true },
  phoneNo: { type: String, default: "" },
  medicaidMedicare: { type: String, enum: ["yes", "no", ""], default: "" },
  address: { type: String, default: "" },
  state: { type: String, default: "" },
  city: { type: String, default: "" },
  postalCode: { type: String, default: "" },
  country: { type: String, default: "" },
  dob: { type: String, default: "" },
  ssn: { type: String, default: "" },
  gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
  hasSpouse: { type: String, enum: ["yes", "no", ""], default: "" },
  spouseFname: { type: String, default: "" },
  spouseLname: { type: String, default: "" },
  spouseSsn: { type: String, default: "" },
  enrollSpouse: { type: String, enum: ["yes", "no", ""], default: "" },
  disqualified: { type: Boolean, default: false },
  isPartialSubmission: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

formSubmissionSchema.index({ email: 1, offerId: 1 }); // Optimize lookups

module.exports = mongoose.model("FormSubmission", formSubmissionSchema);
