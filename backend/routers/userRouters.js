var app = require("express");
var userController = require("../controllers/userController");
var custProfileController = require("../controllers/custProfileController");
var tailorProfileController = require("../controllers/Tailorprofilecontroller");
var Reviewcontroller = require("../controllers/Reviewcontroller");
var findTailorController = require("../controllers/Findtailorcontroller");
var aadhaarController = require("../controllers/Adhaarcontroller");   // ← NEW
var router = app.Router();

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post("/signup",          userController.signupUser);
router.post("/login",           userController.loginUser);
router.post("/change-password", userController.changePassword);

// ── Aadhaar OCR ───────────────────────────────────────────────────────────────
router.post("/scan-aadhaar", aadhaarController.scanAadhaar);           // ← NEW  // ← NEW

// ── Customer Profile ──────────────────────────────────────────────────────────
router.post("/custprofile/get",    custProfileController.custgetProfile);
router.post("/custprofile/save",   custProfileController.custsaveProfile);
router.post("/custprofile/update", custProfileController.custupdateProfile);

// ── Tailor Profile ────────────────────────────────────────────────────────────
router.post("/tailorprofile/get",    tailorProfileController.tailorgetProfile);
router.post("/tailorprofile/save",   tailorProfileController.tailorsaveProfile);
router.post("/tailorprofile/update", tailorProfileController.tailorupdateProfile);
router.post("/tailorprofile/delete", tailorProfileController.tailordeleteProfile);
router.get( "/tailorprofile/all",    tailorProfileController.tailorgetAllProfiles);

// ── Reviews ───────────────────────────────────────────────────────────────────
router.post("/getTailorByMobile", Reviewcontroller.getTailorByMobile);
router.post("/saveReview",        Reviewcontroller.saveReview);
router.post("/getReviews",        Reviewcontroller.getReviews);

// ── Find Tailor ───────────────────────────────────────────────────────────────
router.get( "/findtailor/cities",       findTailorController.getCities);
router.post("/findtailor/specialties",  findTailorController.getSpecialties);
router.post("/findtailor/find-tailors", findTailorController.findTailors);

module.exports = router;