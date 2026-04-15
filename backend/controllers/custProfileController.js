const CustProfileRef = require("../models/custProfiles");

// POST - Get profile by email
async function custgetProfile(req, res) {
    try {
        const { emailid } = req.body;
        if (!emailid) {
            return res.status(400).json({ message: "Email is required" });
        }
        
        const profile = await CustProfileRef.findOne({ emailid });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        
        res.status(200).json({ message: "Profile found", profile });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
}

// POST - Save new profile
async function custsaveProfile(req, res) {
    try {
        const { emailid, name, address, city, state, gender, profilepic } = req.body;

        if (!emailid || !name || !address || !city || !state || !gender) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existing = await CustProfileRef.findOne({ emailid });
        if (existing) {
            return res.status(400).json({ message: "Profile already exists. Use update instead." });
        }

        const newProfile = new CustProfileRef({
            emailid,
            name,
            address,
            city,
            state,
            gender,
            profilepic
        });

        await newProfile.save();
        res.status(201).json({ message: "Profile saved successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
}

// POST - Update existing profile
async function custupdateProfile(req, res) {
    try {
        const { emailid, name, address, city, state, gender, profilepic } = req.body;

        if (!emailid) {
            return res.status(400).json({ message: "Email is required" });
        }

        const profile = await CustProfileRef.findOne({ emailid });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        profile.name       = name       || profile.name;
        profile.address    = address    || profile.address;
        profile.city       = city       || profile.city;
        profile.state      = state      || profile.state;
        profile.gender     = gender     || profile.gender;
        profile.profilepic = profilepic !== undefined ? profilepic : profile.profilepic;

        await profile.save();
        res.status(200).json({ message: "Profile updated successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
}

module.exports = { custgetProfile, custsaveProfile, custupdateProfile};