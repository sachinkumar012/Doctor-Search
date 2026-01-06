const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: String, required: true },
    location: { type: String, required: true },
    hospital: { type: String, required: true },
    fee: { type: Number, required: true }, // Changed to Number for easier filtering
    rating: { type: Number, default: 0 },
    image: { type: String, required: true },
    available: { type: Boolean, default: true },
    about: { type: String, default: "Experienced medical professional dedicated to patient care." },
    slots: [{
        day: String,
        time: String,
        isBooked: { type: Boolean, default: false }
    }] // For booking system
});

module.exports = mongoose.model('Doctor', doctorSchema);
