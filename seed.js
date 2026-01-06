const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');

// MongoDB Connection String
const MONGO_URI = 'mongodb+srv://krsachin9097:Yadav909707@cluster0.hqm4zhe.mongodb.net/?appName=Cluster0';

const indianDoctors = [
    {
        name: "Dr. Rajesh Sharma",
        specialization: "Cardiologist",
        experience: "15 Years",
        location: "Delhi",
        hospital: "AIIMS Delhi",
        fee: 1500,
        rating: 4.9,
        image: "https://randomuser.me/api/portraits/men/1.jpg",
        available: true,
        about: "Dr. Rajesh Sharma is a leading Cardiologist with over 15 years of experience in treating complex heart conditions. He is currently a senior consultant at AIIMS Delhi."
    },
    {
        name: "Dr. Priya Iyer",
        specialization: "Dentist",
        experience: "8 Years",
        location: "Mumbai",
        hospital: "Smile Care Mumbai",
        fee: 800,
        rating: 4.7,
        image: "https://randomuser.me/api/portraits/women/2.jpg",
        available: true,
        about: "Dr. Priya Iyer is a renowned Dentist in Mumbai, specializing in cosmetic dentistry and root canal treatments."
    },
    {
        name: "Dr. Amit Verma",
        specialization: "Neurologist",
        experience: "12 Years",
        location: "Bangalore",
        hospital: "NIMHANS",
        fee: 2000,
        rating: 5.0,
        image: "https://randomuser.me/api/portraits/men/3.jpg",
        available: false,
        about: "Dr. Amit Verma is a top Neurologist in Bangalore. He has published numerous papers on brain stroke management."
    },
    {
        name: "Dr. Sneha Gupta",
        specialization: "Pediatrician",
        experience: "10 Years",
        location: "Hyderabad",
        hospital: "Rainbow Hospital",
        fee: 1000,
        rating: 4.8,
        image: "https://randomuser.me/api/portraits/women/4.jpg",
        available: true,
        about: "Dr. Sneha Gupta is a compassionate Pediatrician known for her friendly approach with children. She specializes in newborn care."
    },
    {
        name: "Dr. Vikram Singh",
        specialization: "Orthopedic Surgeon",
        experience: "20 Years",
        location: "Chennai",
        hospital: "Apollo Chennai",
        fee: 2500,
        rating: 4.9,
        image: "https://randomuser.me/api/portraits/men/5.jpg",
        available: true,
        about: "Dr. Vikram Singh is a veteran Orthopedic Surgeon with expertise in joint replacement surgeries."
    },
    {
        name: "Dr. Anjali Mehta",
        specialization: "Dermatologist",
        experience: "6 Years",
        location: "Pune",
        hospital: "Skin & Glow Clinic",
        fee: 1200,
        rating: 4.6,
        image: "https://randomuser.me/api/portraits/women/6.jpg",
        available: true,
        about: "Dr. Anjali Mehta is a young and dynamic Dermatologist specializing in aesthetic procedures and skin rejuvenation."
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Doctor.deleteMany({});
        console.log('Cleared existing doctors');

        // Insert new data
        await Doctor.insertMany(indianDoctors);
        console.log('Seeded Indian doctors data');

        mongoose.connection.close();
    } catch (err) {
        console.error('Error in seeding:', err);
    }
};

seedDB();
