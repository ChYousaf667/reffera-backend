const { v4: uuidv4 } = require("uuid");
const Referral = require("../models/referralModel");
const FormSubmission = require("../models/formSubmissionModel");
const Partner = require("../models/partnerModel");

const generateReferralLink = async (partnerId, offerId) => {
  if (!["aca", "rx", "medicare"].includes(offerId)) {
    throw new Error("Invalid offerId");
  }

  const partner = await Partner.findById(partnerId);
  if (!partner) {
    throw new Error("Invalid partnerId");
  }

  const referralId = uuidv4();
  const referral = new Referral({ referralId, partnerId, offerId });
  await referral.save();

  return `https://refeera.vercel.app/form?referralId=${referralId}&partnerId=${partnerId}&offerId=${offerId}`;
};

const processFormSubmission = async (data) => {
  console.log("Processing form submission:", data);
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
    isPartialSubmission,
  } = data;

  // Validate required fields
  if (!referralId || !partnerId || !offerId || !email) {
    console.log("Missing required fields:", {
      referralId,
      partnerId,
      offerId,
      email,
    });
    throw new Error("Missing required fields");
  }

  // For partial submissions, ensure medicaidMedicare is provided
  if (isPartialSubmission === "true" && !medicaidMedicare) {
    console.log("Missing medicaidMedicare for partial submission");
    throw new Error(
      "Medicaid/Medicare selection is required for partial submission"
    );
  }

  const referral = await Referral.findOne({ referralId, partnerId, offerId });
  if (!referral) {
    console.log("Invalid referral:", { referralId, partnerId, offerId });
    throw new Error("Invalid referralId");
  }

  const partner = await Partner.findById(partnerId);
  if (!partner) {
    console.log("Invalid partnerId:", partnerId);
    throw new Error("Invalid partnerId");
  }

  let submissionData = {
    referralId,
    partnerId,
    offerId,
    fname: fname || "",
    lname: lname || "",
    email,
    phoneNo: phoneNo || "",
    medicaidMedicare: medicaidMedicare || "",
    address: address || "",
    state: state || "",
    city: city || "",
    postalCode: postalCode || "",
    country: country || "",
    dob: dob || "",
    ssn: ssn || "",
    gender: gender || "",
    hasSpouse: hasSpouse || "",
    spouseFname: spouseFname || "",
    spouseLname: spouseLname || "",
    spouseSsn: spouseSsn || "",
    enrollSpouse: enrollSpouse || "",
    disqualified: medicaidMedicare === "yes",
    isPartialSubmission: isPartialSubmission === "true",
  };

  // Check for existing submission
  const existingSubmission = await FormSubmission.findOne({ email, offerId });
  if (existingSubmission) {
    console.log("Updating existing submission:", { email, offerId });
    await FormSubmission.updateOne(
      { email, offerId },
      { $set: submissionData }
    );
    return { success: true, isDisqualified: submissionData.disqualified };
  }

  const submission = new FormSubmission(submissionData);
  await submission.save();

  console.log("Submission saved:", submission);
  return { success: true, isDisqualified: submission.disqualified };
};

const getReferralDetails = async (referralId) => {
  const referral = await Referral.findOne({ referralId });
  if (!referral) {
    throw new Error("Referral not found");
  }
  return {
    referralId,
    partnerId: referral.partnerId,
    offerId: referral.offerId,
  };
};

const getFormSubmissionsByPartner = async (req) => {
  console.log(
    "Fetching form submissions for partner, params:",
    req.params,
    "query:",
    req.query
  );
  const { partnerId } = req.params;
  const {
    offerId,
    email,
    isPartialSubmission,
    page = 1,
    limit = 10,
  } = req.query;

  // Validate partnerId
  if (!partnerId) {
    throw new Error("partnerId is required");
  }

  // Check if partner exists
  const partner = await Partner.findById(partnerId);
  if (!partner) {
    throw new Error("Invalid partnerId");
  }

  // Build query object
  let query = { partnerId };
  if (offerId) query.offerId = offerId;
  if (email) query.email = email;
  if (isPartialSubmission) {
    query.isPartialSubmission = isPartialSubmission === "true";
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  // Validate pagination parameters
  if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
    throw new Error("Invalid pagination parameters");
  }

  const skip = (pageNum - 1) * limitNum;

  try {
    const submissions = await FormSubmission.find(query)
      .select("-ssn -spouseSsn") // Exclude sensitive fields
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await FormSubmission.countDocuments(query);

    console.log("Submissions retrieved:", {
      count: submissions.length,
      total,
      page: pageNum,
      limit: limitNum,
    });

    return {
      success: true,
      submissions,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    };
  } catch (error) {
    console.error("Error fetching submissions:", error.message);
    throw new Error("Failed to fetch form submissions");
  }
};

module.exports = {
  generateReferralLink,
  processFormSubmission,
  getReferralDetails,
  getFormSubmissionsByPartner,
};
