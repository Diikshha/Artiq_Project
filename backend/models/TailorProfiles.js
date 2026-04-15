const mongoose = require("mongoose");

const tailorProfileSchema = new mongoose.Schema({
    emailid: {
        type:      String,
        required:  true,
        unique:    true,
        trim:      true,
        lowercase: true
    },
    name: {
        type:     String,
        required: true,
        trim:     true
    },
    contact: {
        type:     String,
        required: true,
        trim:     true
    },
    address: {
        type:     String,
        required: true,
        trim:     true
    },
    city: {
        type:     String,
        required: true,
        trim:     true
    },
    aadharno: {
        type:    String,
        default: null
    },
    dob: {
        type:    String,   // stored as "YYYY-MM-DD"
        default: null
    },
    gender: {
        type:    String,
        enum:    ["Male", "Female", "Other", "Prefer not to say", ""],
        default: ""
    },
    category: {
        type:     String,
        required: true,
        enum:     ["Men", "Women", "Children", "Both", "All"]
    },
    spl: {
        type:     String,
        required: true,
        trim:     true
    },
    social: {
        type:    String,
        default: null
    },
    since: {
        type:     String,
        required: true,
        trim:     true
    },
    worktype: {
        type:     String,
        required: true,
        enum:     ["Home", "Shop", "Both"]
    },
    shopadr: {
        type:    String,
        default: null
    },
    shopcity: {
        type:    String,
        default: null
    },
    otherinfo: {
        type:    String,
        default: null
    },
    profilepic: {
        type:    String,   // base64
        default: null
    },
    dos: {
        type:    Date,
        default: Date.now
    }
});

module.exports = mongoose.model("tailorprofiles", tailorProfileSchema);