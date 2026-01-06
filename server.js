const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your_jwt_secret_key_change_this_in_production'; // Simple secret for now

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

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return next(); // Continue without user info if no token

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        // Invalid token, just continue as guest
        next();
    }
};

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
app.post('/api/appointments', verifyToken, async (req, res) => {
    try {
        const { doctorId, patientName, patientEmail, patientPhone, date, time } = req.body;

        const newAppointment = new Appointment({
            doctorId,
            userId: req.user ? req.user.id : null, // Link user if logged in
            patientName,
            patientEmail,
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
            to: patientEmail,
            cc: 'krsachin9097@gmail.com',
            subject: 'Appointment Confirmation - DocSearch',
            text: `
                Hello ${patientName},

                Your appointment has been successfully booked!
                
                Doctor: ${doctor ? doctor.name : 'Unknown Doctor'}
                Date: ${date}
                Time: ${time}
                
                Thank you for using DocSearch.
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

// Auth Routes
// 5. Register User
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// 6. Login User
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate Token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});



// 7. Get My Bookings (Protected)
app.get('/api/my-appointments', verifyToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const appointments = await Appointment.find({ userId: req.user.id }).populate('doctorId');
        res.json(appointments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

