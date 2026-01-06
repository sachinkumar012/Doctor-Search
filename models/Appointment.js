const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for now (guest bookings) or required if we enforce login
    patientName: { type: String, required: true },
    patientEmail: { type: String, required: true },
    patientPhone: { type: String, required: true },
    date: { type: String, required: true }, // Simple string for now, could be Date
    time: { type: String, required: true },
    status: { type: String, default: 'Confirmed' }, // Confirmed, Cancelled, Completed
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
