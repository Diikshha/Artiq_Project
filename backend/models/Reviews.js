const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        mobile: {
            type:     String,
            required: true,
            trim:     true,
            index:    true,
        },
        star: {
            type:     Number,
            required: true,
            min:      1,
            max:      5,
        },
        review: {
            type:      String,
            required:  true,
            trim:      true,
            maxlength: 300,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("reviews", reviewSchema);