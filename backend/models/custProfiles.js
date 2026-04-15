const mongoose = require("mongoose");

const custProfileSchema = new mongoose.Schema({
    emailid: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    profilepic: {
        type: String,   
        default: null
    },
    dos: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("custprofiles", custProfileSchema);