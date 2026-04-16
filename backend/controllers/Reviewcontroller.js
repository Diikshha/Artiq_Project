const ReviewRef        = require("../models/Reviews");
const TailorProfileRef = require("../models/TailorProfiles");   // ← THIS WAS MISSING

// ── GET tailor name by mobile (called onBlur) ─────────────────────────────
//  Route: POST /user/getTailorByMobile
//  Body:  { mobile }
async function getTailorByMobile(req, res) {
    try {
        const { mobile } = req.body;
        if (!mobile || !mobile.trim())
            return res.status(400).json({ status: false, message: "Mobile number is required." });
        const tailor = await TailorProfileRef.findOne({ contact: mobile.trim() });
        if (!tailor)
            return res.status(404).json({ status: false, message: "No tailor found with this mobile number." });

        res.status(200).json({ status: true, name: tailor.name });
    } catch (error) {
        console.error("getTailorByMobile error:", error.message);
        res.status(500).json({ status: false, message: "Server Error." });
    }
}

// ── SAVE review ───────────────────────────────────────────────────────────
//  Route: POST /user/saveReview
//  Body:  { mobile, star, review }
async function saveReview(req, res) {
    try {
        const { mobile, star, review } = req.body;

        if (!mobile || !/^[6-9]\d{9}$/.test(mobile.trim()))
            return res.status(400).json({ message: "Valid 10-digit mobile number is required." });

        if (!star || ![1, 2, 3, 4, 5].includes(Number(star)))
            return res.status(400).json({ message: "Star rating must be between 1 and 5." });

        if (!review || !review.trim())
            return res.status(400).json({ message: "Review text is required." });

        if (review.trim().length > 300)
            return res.status(400).json({ message: "Review must be 300 characters or less." });

        const tailor = await TailorProfileRef.findOne({ contact: mobile.trim() });
        if (!tailor)
            return res.status(404).json({ message: "Tailor not found with this mobile number." });

        await ReviewRef.create({
            mobile: mobile.trim(),
            star:   Number(star),
            review: review.trim(),
        });

        res.status(201).json({ message: "Review saved successfully." });
    } catch (error) {
        console.error("saveReview error:", error.message);
        res.status(500).json({ message: "Server Error." });
    }
}

// ── GET all reviews for a tailor ──────────────────────────────────────────
//  Route: POST /user/getReviews
//  Body:  { mobile }
async function getReviews(req, res) {
    try {
        const { mobile } = req.body;

        if (!mobile || !mobile.trim())
            return res.status(400).json({ message: "Mobile number is required." });

        const reviews = await ReviewRef
            .find({ mobile: mobile.trim() })
            .sort({ createdAt: -1 });

        res.status(200).json({ message: "Reviews fetched.", count: reviews.length, reviews });
    } catch (error) {
        console.error("getReviews error:", error.message);
        res.status(500).json({ message: "Server Error." });
    }
}

module.exports = { getTailorByMobile, saveReview, getReviews };