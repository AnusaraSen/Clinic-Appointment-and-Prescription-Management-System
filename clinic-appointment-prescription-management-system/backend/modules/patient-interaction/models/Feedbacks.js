const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({

  appointment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment", // Reference to the Appointment model       
    required: true, // Made required for better data integrity
    },

    rating: {
    type: Number,
    required: true, // Made required for better data integrity
    min: 1,
    max: 5,
    },


    comments: {
    type: String,
    maxlength: 1000, // Limit the comments length
    },


    created_at: {
    type: Date,
    default: Date.now,
    },
    
});

module.exports = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);