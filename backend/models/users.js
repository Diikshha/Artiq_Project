const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    emailid: {
        type: String,
        required: true,
        unique: true
    },
    pwd: {
        type: String,
        required: true
    },
    utype: {
        type: String,
        required: true
    },
    dos: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model("users", userSchema);
