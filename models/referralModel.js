const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referralId: { type: String, required: true, unique: true },
  partnerId: { type: String, required: true, ref: 'User' },
  offerId: { type: String, required: true, enum: ['aca', 'rx', 'medicare'] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Referral', referralSchema);