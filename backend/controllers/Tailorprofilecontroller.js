const TailorProfile = require("../models/TailorProfiles");

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function validate({ name, contact, address, city, category, spl, since, worktype }) {
    const errors = [];
    const contactOk = /^[6-9]\d{9}$/.test((contact || "").trim());
    const yearOk    = /^\d{4}$/.test((since    || "").trim());

    if (!name     || !name.trim())     errors.push("Full name is required.");
    if (!contact  || !contact.trim())  errors.push("Contact number is required.");
    else if (!contactOk)               errors.push("Contact must be a valid 10-digit Indian number.");
    if (!address  || !address.trim())  errors.push("Address is required.");
    if (!city     || !city.trim())     errors.push("City is required.");
    if (!category)                     errors.push("Category is required.");
    if (!spl      || !spl.trim())      errors.push("Speciality is required.");
    if (!since    || !since.trim())    errors.push("Since year is required.");
    else if (!yearOk)                  errors.push("Since must be a valid 4-digit year.");
    if (!worktype)                     errors.push("Work type is required.");

    return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
//  1. GET profile by email
//     POST /user/tailorprofile/get
//     Body: { emailid }
// ─────────────────────────────────────────────────────────────────────────────
async function tailorgetProfile(req, res) {
    try {
        const { emailid } = req.body;

        if (!emailid || !emailid.trim())
            return res.status(400).json({ message: "Email is required." });

        const profile = await TailorProfile.findOne({
            emailid: emailid.trim().toLowerCase()
        });

        if (!profile)
            return res.status(404).json({ message: "Profile not found." });

        res.status(200).json({ message: "Profile found.", profile });

    } catch (err) {
        console.error("tailorgetProfile:", err.message);
        res.status(500).json({ message: "Server error." });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  2. SAVE new profile
//     POST /user/tailorprofile/save
//     Body: all profile fields
// ─────────────────────────────────────────────────────────────────────────────
async function tailorsaveProfile(req, res) {
    try {
        const {
            emailid, name, contact, address, city,
            aadharno, dob, gender,
            category, spl, social, since, worktype,
            shopadr, shopcity, otherinfo, profilepic
        } = req.body;

        // 1. Email required
        if (!emailid || !emailid.trim())
            return res.status(400).json({ message: "Email is required." });

        // 2. Validate required fields
        const errors = validate({ name, contact, address, city, category, spl, since, worktype });
        if (errors.length > 0)
            return res.status(400).json({ message: errors[0] });

        // 3. Shop address required when worktype is Shop or Both
        if ((worktype === "Shop" || worktype === "Both") && (!shopadr || !shopadr.trim()))
            return res.status(400).json({ message: "Shop address is required for Shop / Both work type." });

        // 4. Check duplicate email
        const exists = await TailorProfile.findOne({ emailid: emailid.trim().toLowerCase() });
        if (exists)
            return res.status(400).json({ message: "Profile already exists. Use Update instead." });

        // 5. Check duplicate contact number
        const contactExists = await TailorProfile.findOne({ contact: contact.trim() });
        if (contactExists)
            return res.status(400).json({ message: "This contact number is already registered with another tailor." });

        // 6. Create & save  ← THIS WAS COMPLETELY MISSING IN YOUR FILE
        await TailorProfile.create({
            emailid:    emailid.trim().toLowerCase(),
            name:       name.trim(),
            contact:    contact.trim(),
            address:    address.trim(),
            city:       city.trim(),
            aadharno:   aadharno  || null,
            dob:        dob       || null,
            gender:     gender    || "",
            category,
            spl:        spl.trim(),
            social:     social    || null,
            since:      since.trim(),
            worktype,
            shopadr:    shopadr   || null,
            shopcity:   shopcity  || null,
            otherinfo:  otherinfo || null,
            profilepic: profilepic || null,
        });

        res.status(201).json({ message: "Profile saved successfully." });

    } catch (err) {
        console.error("tailorsaveProfile:", err.message);
        if (err.code === 11000)
            return res.status(400).json({ message: "Profile already exists for this email." });
        res.status(500).json({ message: "Server error." });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  3. UPDATE existing profile
//     POST /user/tailorprofile/update
//     Body: all profile fields (emailid required to find the record)
// ─────────────────────────────────────────────────────────────────────────────
async function tailorupdateProfile(req, res) {
    try {
        const {
            emailid, name, contact, address, city,
            aadharno, dob, gender,
            category, spl, social, since, worktype,
            shopadr, shopcity, otherinfo, profilepic
        } = req.body;

        // 1. Email required
        if (!emailid || !emailid.trim())
            return res.status(400).json({ message: "Email is required." });

        // 2. Find existing profile
        const profile = await TailorProfile.findOne({ emailid: emailid.trim().toLowerCase() });
        if (!profile)
            return res.status(404).json({ message: "Profile not found. Save it first." });

        // 3. Validate using incoming value or fall back to existing value
        const errors = validate({
            name:     name     !== undefined ? name     : profile.name,
            contact:  contact  !== undefined ? contact  : profile.contact,
            address:  address  !== undefined ? address  : profile.address,
            city:     city     !== undefined ? city     : profile.city,
            category: category !== undefined ? category : profile.category,
            spl:      spl      !== undefined ? spl      : profile.spl,
            since:    since    !== undefined ? since    : profile.since,
            worktype: worktype !== undefined ? worktype : profile.worktype,
        });
        if (errors.length > 0)
            return res.status(400).json({ message: errors[0] });

        // 4. Shop address check
        const wt = worktype !== undefined ? worktype : profile.worktype;
        const sa = shopadr  !== undefined ? shopadr  : profile.shopadr;
        if ((wt === "Shop" || wt === "Both") && (!sa || !sa.trim()))
            return res.status(400).json({ message: "Shop address is required for Shop / Both work type." });

        // 5. Apply updates only for fields that were actually sent
        if (name      !== undefined) profile.name      = name.trim();
        if (contact   !== undefined) profile.contact   = contact.trim();
        if (address   !== undefined) profile.address   = address.trim();
        if (city      !== undefined) profile.city      = city.trim();
        if (aadharno  !== undefined) profile.aadharno  = aadharno  || null;
        if (dob       !== undefined) profile.dob       = dob       || null;
        if (gender    !== undefined) profile.gender    = gender    || "";
        if (category  !== undefined) profile.category  = category;
        if (spl       !== undefined) profile.spl       = spl.trim();
        if (social    !== undefined) profile.social    = social    || null;
        if (since     !== undefined) profile.since     = since.trim();
        if (worktype  !== undefined) profile.worktype  = worktype;
        if (shopadr   !== undefined) profile.shopadr   = shopadr   || null;
        if (shopcity  !== undefined) profile.shopcity  = shopcity  || null;
        if (otherinfo !== undefined) profile.otherinfo = otherinfo || null;
        if (profilepic !== undefined) profile.profilepic = profilepic || null;

        await profile.save();
        res.status(200).json({ message: "Profile updated successfully." });

    } catch (err) {
        console.error("tailorupdateProfile:", err.message);
        res.status(500).json({ message: "Server error." });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  4. DELETE profile by email
//     POST /user/tailorprofile/delete
//     Body: { emailid }
// ─────────────────────────────────────────────────────────────────────────────
async function tailordeleteProfile(req, res) {
    try {
        const { emailid } = req.body;

        if (!emailid || !emailid.trim())
            return res.status(400).json({ message: "Email is required." });

        const deleted = await TailorProfile.findOneAndDelete({
            emailid: emailid.trim().toLowerCase()
        });

        if (!deleted)
            return res.status(404).json({ message: "Profile not found." });

        res.status(200).json({ message: "Profile deleted successfully." });

    } catch (err) {
        console.error("tailordeleteProfile:", err.message);
        res.status(500).json({ message: "Server error." });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  5. GET ALL profiles (with optional filters)
//     GET /user/tailorprofile/all?city=Delhi&category=Men&worktype=Shop
// ─────────────────────────────────────────────────────────────────────────────
async function tailorgetAllProfiles(req, res) {
    try {
        const { city, category, worktype } = req.query;

        const filter = {};
        if (city)     filter.city     = { $regex: city, $options: "i" };
        if (worktype) filter.worktype  = worktype;

        // Fixed: include "Both" tailors when filtering by a specific category
        if (category) {
            if (category === "Both") {
                filter.category = "Both";
            } else {
                filter.$or = [{ category }, { category: "Both" }];
            }
        }

        // exclude large base64 profilepic field to keep response small
        const profiles = await TailorProfile.find(filter).select("-profilepic");

        res.status(200).json({
            message:  "Profiles fetched.",
            count:    profiles.length,
            profiles,
        });

    } catch (err) {
        console.error("tailorgetAllProfiles:", err.message);
        res.status(500).json({ message: "Server error." });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
    tailorgetProfile,
    tailorsaveProfile,
    tailorupdateProfile,
    tailordeleteProfile,
    tailorgetAllProfiles,
};