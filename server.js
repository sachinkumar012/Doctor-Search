const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// Models
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://krsachin9097:Yadav909707@cluster0.hqm4zhe.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// Email Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'krsachin9097@gmail.com',
        pass: 'joqi tyzl qfta nxkj'
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoints

// 1. Search Doctors
app.get('/api/doctors', async (req, res) => {
    try {
        const { query, location, specialization, experience, fee, available } = req.query;
        let filter = {};

        // Keyword Search (Name, Specialization, Hospital)
        if (query) {
            const regex = new RegExp(query, 'i');
            filter.$or = [
                { name: regex },
                { specialization: regex },
                { hospital: regex }
            ];
        }

        // Exact Filters
        if (location && location !== 'All Locations') {
            filter.location = location;
        }

        if (specialization && specialization !== 'All Specializations') {
            filter.specialization = specialization;
        }

        if (available === 'true') {
            filter.available = true;
        }

        // Range Filters
        let doctors = await Doctor.find(filter);

        // Client-side like filtering for numbers (simplification for Mongoose queries)
        if (experience && experience !== 'all') {
            const expLimit = parseInt(experience);
            doctors = doctors.filter(doc => parseInt(doc.experience) >= expLimit);
        }

        if (fee && fee !== 'all') {
            const feeValue = parseInt(fee);
            doctors = doctors.filter(doc => {
                if (feeValue === 100) return doc.fee < 1000; // Adjusted for INR
                if (feeValue === 200) return doc.fee >= 1000 && doc.fee <= 2000;
                if (feeValue === 201) return doc.fee > 2000;
                return true;
            });
        }

        res.json(doctors);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// 2. Get Single Doctor
app.get('/api/doctors/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });
        res.json(doctor);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// 3. Create Appointment
app.post('/api/appointments', async (req, res) => {
    try {
        const { doctorId, patientName, patientPhone, date, time } = req.body;

        const newAppointment = new Appointment({
            doctorId,
            patientName,
            patientPhone,
            date,
            time
        });

        await newAppointment.save();

        // Get Doctor details for email
        const doctor = await Doctor.findById(doctorId);

        // Send Email
        const mailOptions = {
            from: 'krsachin9097@gmail.com',
            to: 'krsachin9097@gmail.com', // Sending to admin/doctor for now
            subject: 'New Appointment Booking - DocSearch',
            text: `
                New Appointment Booked!
                
                Doctor: ${doctor ? doctor.name : 'Unknown Doctor'}
                Patient: ${patientName}
                Phone: ${patientPhone}
                Date: ${date}
                Time: ${time}
                
                Please login to dashboard to view details.
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(201).json({ message: "Appointment booked successfully!", appointment: newAppointment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to book appointment" });
    }
});

// 4. Contact Form Submission
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        const mailOptions = {
            from: 'krsachin9097@gmail.com',
            to: 'krsachin9097@gmail.com',
            subject: `New Contact Message from ${name}`,
            text: `
                New Contact Message Received
                
                Name: ${name}
                Email: ${email}
                Message: ${message}
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending contact email:', error);
                return res.status(500).json({ message: "Failed to send message" });
            } else {
                console.log('Contact email sent: ' + info.response);
                return res.status(200).json({ message: "Message sent successfully!" });
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

