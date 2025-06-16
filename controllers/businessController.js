const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Business = require("../models/businessModel");

// @desc    Register new business
// @route   POST /api/business/register
// @access  Public
const registerBusiness = asyncHandler(async (req, res) => {
  const {
    businessName,
    primaryContact,
    businessAddress,
    phoneNumber,
    email,
    password,
    websiteOrSocialMedia,
    businessType,
    otherBusinessType,
    weeklyFootTraffic,
    hasPromotingEmployees,
    promotionalMaterials,
    onboardingCall,
    payoutMethod,
    offerServices,
    referralSource,
    referralPartner,
    isAuthorized,
  } = req.body;

  if (
    !businessName ||
    !primaryContact ||
    !businessAddress ||
    !phoneNumber ||
    !email ||
    !password ||
    !isAuthorized
  ) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Check if business exists
  const businessExists = await Business.findOne({ email, isDeleted: false });
  if (businessExists) {
    res.status(400);
    throw new Error("Business already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Handle referralPartner
  let referralPartnerValue = referralPartner;
  if (referralSource !== "Referred by another partner") {
    referralPartnerValue = undefined;
  }

  // Create business
  const business = await Business.create({
    businessName,
    primaryContact,
    businessAddress,
    phoneNumber,
    email,
    password: hashedPassword,
    websiteOrSocialMedia,
    businessType,
    otherBusinessType: businessType.includes("Other")
      ? otherBusinessType
      : undefined,
    weeklyFootTraffic,
    hasPromotingEmployees,
    promotionalMaterials,
    onboardingCall,
    payoutMethod,
    offerServices,
    referralSource,
    referralPartner: referralPartnerValue,
    isAuthorized,
    isActive: true,
  });

  if (business) {
    res.status(201).json({
      _id: business._id,
      businessName: business.businessName,
      email: business.email,
      token: generateToken(business._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid business data");
  }
});

// @desc    Authenticate business
// @route   POST /api/business/login
// @access  Public
const loginBusiness = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for business
  const business = await Business.findOne({
    email,
    isDeleted: false,
    isActive: true,
  });

  if (!business) {
    res.status(401);
    throw new Error("Invalid email, password, or business is inactive");
  }

  if (await bcrypt.compare(password, business.password)) {
    res.json({
      _id: business._id,
      businessName: business.businessName,
      email: business.email,
      token: generateToken(business._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email, password, or business is inactive");
  }
});

// @desc    Get business profile
// @route   GET /api/business/profile
// @access  Private
const getBusinessProfile = asyncHandler(async (req, res) => {
  res.json({
    _id: req.business._id,
    businessName: req.business.businessName,
    email: req.business.email,
    primaryContact: req.business.primaryContact,
    businessAddress: req.business.businessAddress,
    phoneNumber: req.business.phoneNumber,
    websiteOrSocialMedia: req.business.websiteOrSocialMedia,
    businessType: req.business.businessType,
    otherBusinessType: req.business.otherBusinessType,
    weeklyFootTraffic: req.business.weeklyFootTraffic,
    hasPromotingEmployees: req.business.hasPromotingEmployees,
    promotionalMaterials: req.business.promotionalMaterials,
    onboardingCall: req.business.onboardingCall,
    payoutMethod: req.business.payoutMethod,
    offerServices: req.business.offerServices,
    referralSource: req.business.referralSource,
    referralPartner: req.business.referralPartner,
    isAuthorized: req.business.isAuthorized,
    isActive: req.business.isActive,
  });
});

// @desc    Get all businesses
// @route   GET /api/business/businesses
// @access  Public
const getBusinesses = asyncHandler(async (req, res) => {
  const businesses = await Business.find();
  res.json(businesses);
});

// @desc    Get business by ID
// @route   GET /api/business/:id
// @access  Public
const getBusinessById = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id);
  if (!business || business.isDeleted) {
    res.status(404);
    throw new Error("Business not found");
  }
  res.json({
    _id: business._id,
    businessName: business.businessName,
    email: business.email,
    phoneNumber: business.phoneNumber,
    primaryContact: business.primaryContact,
    businessAddress: business.businessAddress,
    websiteOrSocialMedia: business.websiteOrSocialMedia,
    businessType: business.businessType,
    otherBusinessType: business.otherBusinessType,
    weeklyFootTraffic: business.weeklyFootTraffic,
    hasPromotingEmployees: business.hasPromotingEmployees,
    promotionalMaterials: business.promotionalMaterials,
    onboardingCall: business.onboardingCall,
    payoutMethod: business.payoutMethod,
    offerServices: business.offerServices,
    referralSource: business.referralSource,
    referralPartner: business.referralPartner,
    isAuthorized: business.isAuthorized,
    isActive: business.isActive,
  });
});

// @desc    Edit business by ID
// @route   PUT /api/business/edit/:id
// @access  Public
const editBusinessById = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id);

  if (!business || business.isDeleted) {
    res.status(404);
    throw new Error("Business not found");
  }

  const {
    businessName,
    email,
    phoneNumber,
    primaryContact,
    businessAddress,
    websiteOrSocialMedia,
    businessType,
    otherBusinessType,
    weeklyFootTraffic,
    hasPromotingEmployees,
    promotionalMaterials,
    onboardingCall,
    payoutMethod,
    offerServices,
    referralSource,
    referralPartner,
    isAuthorized,
    isActive,
  } = req.body;

  if (
    !businessName ||
    !email ||
    !phoneNumber ||
    !primaryContact ||
    !businessAddress ||
    !isAuthorized
  ) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Check if new email is already in use by another business
  if (email !== business.email) {
    const emailExists = await Business.findOne({ email, isDeleted: false });
    if (emailExists) {
      res.status(400);
      throw new Error("Email already in use");
    }
  }

  // Handle referralPartner
  let referralPartnerValue = referralPartner;
  if (referralSource !== "Referred by another partner") {
    referralPartnerValue = undefined;
  }

  // Update business
  business.businessName = businessName;
  business.email = email;
  business.phoneNumber = phoneNumber;
  business.primaryContact = primaryContact;
  business.businessAddress = businessAddress;
  business.websiteOrSocialMedia = websiteOrSocialMedia;
  business.businessType = businessType;
  business.otherBusinessType = businessType.includes("Other")
    ? otherBusinessType
    : undefined;
  business.weeklyFootTraffic = weeklyFootTraffic;
  business.hasPromotingEmployees = hasPromotingEmployees;
  business.promotionalMaterials = promotionalMaterials;
  business.onboardingCall = onboardingCall;
  business.payoutMethod = payoutMethod;
  business.offerServices = offerServices;
  business.referralSource = referralSource;
  business.referralPartner = referralPartnerValue;
  business.isAuthorized = isAuthorized;
  business.isActive = isActive !== undefined ? isActive : business.isActive;

  const updatedBusiness = await business.save();

  res.json({
    _id: updatedBusiness._id,
    businessName: updatedBusiness.businessName,
    email: updatedBusiness.email,
    phoneNumber: updatedBusiness.phoneNumber,
    primaryContact: updatedBusiness.primaryContact,
    businessAddress: updatedBusiness.businessAddress,
    websiteOrSocialMedia: updatedBusiness.websiteOrSocialMedia,
    businessType: updatedBusiness.businessType,
    otherBusinessType: updatedBusiness.otherBusinessType,
    weeklyFootTraffic: updatedBusiness.weeklyFootTraffic,
    hasPromotingEmployees: updatedBusiness.hasPromotingEmployees,
    promotionalMaterials: updatedBusiness.promotionalMaterials,
    onboardingCall: updatedBusiness.onboardingCall,
    payoutMethod: updatedBusiness.payoutMethod,
    offerServices: updatedBusiness.offerServices,
    referralSource: updatedBusiness.referralSource,
    referralPartner: updatedBusiness.referralPartner,
    isAuthorized: updatedBusiness.isAuthorized,
    isActive: updatedBusiness.isActive,
  });
});

// @desc    Edit business
// @route   PUT /api/business/edit
// @access  Private
const editBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.business._id);

  if (!business || business.isDeleted) {
    res.status(404);
    throw new Error("Business not found");
  }

  const {
    businessName,
    primaryContact,
    businessAddress,
    phoneNumber,
    email,
    websiteOrSocialMedia,
    businessType,
    otherBusinessType,
    weeklyFootTraffic,
    hasPromotingEmployees,
    promotionalMaterials,
    onboardingCall,
    payoutMethod,
    offerServices,
    referralSource,
    referralPartner,
    isAuthorized,
    isActive,
  } = req.body;

  if (
    !businessName ||
    !primaryContact ||
    !businessAddress ||
    !phoneNumber ||
    !email ||
    !isAuthorized
  ) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Check if new email is already in use by another business
  if (email !== business.email) {
    const emailExists = await Business.findOne({ email, isDeleted: false });
    if (emailExists) {
      res.status(400);
      throw new Error("Email already in use");
    }
  }

  // Handle referralPartner
  let referralPartnerValue = referralPartner;
  if (referralSource !== "Referred by another partner") {
    referralPartnerValue = undefined;
  }

  // Update business
  business.businessName = businessName;
  business.primaryContact = primaryContact;
  business.businessAddress = businessAddress;
  business.phoneNumber = phoneNumber;
  business.email = email;
  business.websiteOrSocialMedia = websiteOrSocialMedia;
  business.businessType = businessType;
  business.otherBusinessType = businessType.includes("Other")
    ? otherBusinessType
    : undefined;
  business.weeklyFootTraffic = weeklyFootTraffic;
  business.hasPromotingEmployees = hasPromotingEmployees;
  business.promotionalMaterials = promotionalMaterials;
  business.onboardingCall = onboardingCall;
  business.payoutMethod = payoutMethod;
  business.offerServices = offerServices;
  business.referralSource = referralSource;
  business.referralPartner = referralPartnerValue;
  business.isAuthorized = isAuthorized;
  business.isActive = isActive !== undefined ? isActive : business.isActive;

  const updatedBusiness = await business.save();

  res.json({
    _id: updatedBusiness._id,
    businessName: updatedBusiness.businessName,
    email: updatedBusiness.email,
    primaryContact: updatedBusiness.primaryContact,
    businessAddress: updatedBusiness.businessAddress,
    phoneNumber: updatedBusiness.phoneNumber,
    websiteOrSocialMedia: updatedBusiness.websiteOrSocialMedia,
    businessType: updatedBusiness.businessType,
    otherBusinessType: updatedBusiness.otherBusinessType,
    weeklyFootTraffic: updatedBusiness.weeklyFootTraffic,
    hasPromotingEmployees: updatedBusiness.hasPromotingEmployees,
    promotionalMaterials: updatedBusiness.promotionalMaterials,
    onboardingCall: updatedBusiness.onboardingCall,
    payoutMethod: updatedBusiness.payoutMethod,
    offerServices: updatedBusiness.offerServices,
    referralSource: updatedBusiness.referralSource,
    referralPartner: updatedBusiness.referralPartner,
    isAuthorized: updatedBusiness.isAuthorized,
    isActive: updatedBusiness.isActive,
  });
});

// @desc    Toggle business active status
// @route   DELETE /api/business/delete/:id
// @access  Public
const deleteBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id);

  if (!business || business.isDeleted) {
    res.status(404);
    throw new Error("Business not found");
  }

  business.isActive = !business.isActive; // Toggle isActive status
  await business.save();

  res.json({
    message: business.isActive
      ? "Business activated successfully"
      : "Business deactivated successfully",
    isActive: business.isActive,
  });
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = {
  registerBusiness,
  loginBusiness,
  getBusinessProfile,
  getBusinesses,
  getBusinessById,
  editBusiness,
  editBusinessById,
  deleteBusiness,
};
