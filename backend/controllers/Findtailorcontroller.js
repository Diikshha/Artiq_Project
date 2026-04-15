// ═══════════════════════════════════════════════════════════════════════════════
// findTailorController.js
// ═══════════════════════════════════════════════════════════════════════════════

const TailorProfile = require("../models/tailorProfiles");

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /user/findtailor/cities
// ─────────────────────────────────────────────────────────────────────────────
async function getCities(req, res) {
  try {
    const cities = [
      "Agra","Ahmedabad","Allahabad","Amritsar","Aurangabad",
      "Bengaluru","Bhopal","Bhubaneswar","Chandigarh","Chennai",
      "Coimbatore","Dehradun","Delhi","Dhanbad","Faridabad",
      "Ghaziabad","Gurugram","Guwahati","Gwalior","Howrah",
      "Hubli","Hyderabad","Indore","Jabalpur","Jaipur",
      "Jalandhar","Jodhpur","Kalyan","Kanpur","Kochi",
      "Kolkata","Kota","Lucknow","Ludhiana","Madurai",
      "Meerut","Mohali","Mumbai","Mysuru","Nagpur",
      "Nashik","Noida","Patna","Patiala","Phagwara",
      "Pimpri","Pune","Raipur","Rajkot","Ranchi",
      "Solapur","Srinagar","Surat","Thane","Vadodara",
      "Varanasi","Vasai","Vijayawada","Visakhapatnam",
    ];
    return res.status(200).json({ status: true, cities });
  } catch (err) {
    console.error("[getCities]", err.message);
    return res.status(500).json({ status: false, message: "Server error." });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. POST /user/findtailor/specialties
//    Body: { category }
// ─────────────────────────────────────────────────────────────────────────────
async function getSpecialties(req, res) {
  try {
    const { category } = req.body;

    if (!category || !category.trim()) {
      return res.status(400).json({ status: false, message: "category is required." });
    }

    const catFilter = buildCategoryFilter(category.trim());

    const raw = await TailorProfile.distinct("spl", catFilter);

    const splitSet = new Set();
    raw.filter(Boolean).forEach(entry => {
      entry.split(/[,،;\/\n]+/).forEach(part => {
        const trimmed = part.trim();
        if (trimmed) {
          splitSet.add(trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase());
        }
      });
    });

    const specialties = Array.from(splitSet)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    return res.status(200).json({ status: true, specialties });
  } catch (err) {
    console.error("[getSpecialties]", err.message);
    return res.status(500).json({ status: false, message: "Server error." });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. POST /user/findtailor/find-tailors
//    Body: { city?, category?, specialty?, page, limit }
// ─────────────────────────────────────────────────────────────────────────────
async function findTailors(req, res) {
  try {
    const {
      city,
      category,
      specialty,
      page  = 1,
      limit = 6,
    } = req.body;

    const filter = {};

    // City filter
    if (city && city.trim()) {
      filter.city = { $regex: `^${escapeRegex(city.trim())}$`, $options: "i" };
    }

    // Category filter — "Both" (All Categories) means no category restriction
    if (category && category.trim() && category.trim() !== "Both") {
      Object.assign(filter, buildCategoryFilter(category.trim()));
    }

    // Specialty filter
    if (specialty && specialty.trim()) {
      filter.spl = { $regex: escapeRegex(specialty.trim()), $options: "i" };
    }

    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.max(1, parseInt(limit) || 6);
    const skip     = (pageNum - 1) * limitNum;

    const total      = await TailorProfile.countDocuments(filter);
    const totalPages = total === 0 ? 0 : Math.ceil(total / limitNum);

    const rawDocs = await TailorProfile
      .find(filter)
      .sort({ dos: -1 })
      .skip(skip)
      .limit(limitNum)
      .select("-aadharno -dob -gender -otherinfo -address -__v")
      .lean();

    const docs = rawDocs.map((t) => ({
      _id:        t._id.toString(),
      name:       t.name       || "",
      specialty:  t.spl        || "",
      city:       t.city       || "",
      profilepic: t.profilepic || "",
      worktype:   t.worktype   || "",
      shopCity:   t.shopcity   || "",
      since:      t.since      || "",
      contact:    t.contact    || "",
      social:     t.social     || "",
    }));

    return res.status(200).json({ status: true, docs, total, totalPages, page: pageNum });
  } catch (err) {
    console.error("[findTailors]", err.message);
    return res.status(500).json({ status: false, message: "Server error." });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// For a specific category (Men/Women/Children), include tailors registered
// under that category OR under "Both" (meaning they serve all categories)
function buildCategoryFilter(category) {
  return { $or: [{ category }, { category: "Both" }] };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { getCities, getSpecialties, findTailors };