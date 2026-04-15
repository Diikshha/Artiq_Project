var path = require("path");
const bcrypt = require("bcryptjs");
var UserColRef = require("../models/users");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

async function signupUser(req, res) {
    try {
        const { emailid, pwd, utype } = req.body;
        if (!emailid || !pwd || !utype) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!emailRegex.test(emailid)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (!passwordRegex.test(pwd)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters, include uppercase, lowercase, number and special character"
            });
        }
        const existingUser = await UserColRef.findOne({ emailid });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(pwd, 10);
        const newUser = new UserColRef({ emailid, pwd: hashedPassword, utype });
        await newUser.save();
        res.status(201).json({ message: "Signup Successful" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
}

async function loginUser(req, res) {
    try {
        const { emailid, pwd } = req.body;
        if (!emailid || !pwd) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await UserColRef.findOne({ emailid });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if (!user.status) {
            return res.status(403).json({ message: "Account is blocked" });
        }
        const isMatch = await bcrypt.compare(pwd, user.pwd);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }
        res.status(200).json({
            message: "Login Successful",
            user: { emailid: user.emailid, utype: user.utype }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
}

// ── Change Password ────────────────────────────────────────────────────────────
// POST /user/change-password
// Body: { emailid, currentPwd, newPwd }
async function changePassword(req, res) {
    try {
        const { emailid, currentPwd, newPwd } = req.body;

        if (!emailid || !currentPwd || !newPwd) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const user = await UserColRef.findOne({ emailid });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isMatch = await bcrypt.compare(currentPwd, user.pwd);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect." });
        }

        if (!passwordRegex.test(newPwd)) {
            return res.status(400).json({
                message: "New password must be at least 8 characters with uppercase, lowercase, number and special character."
            });
        }

        user.pwd = await bcrypt.hash(newPwd, 10);
        await user.save();

        res.status(200).json({ message: "Password changed successfully." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
}

module.exports = { signupUser, loginUser, changePassword };