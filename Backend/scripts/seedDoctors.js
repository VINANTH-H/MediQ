import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Doctor from '../models/Doctor.js';

const doctorsData = [
    // Orthopedic Doctors
    {
        name: "Dr. Rajesh Sharma",
        specialization: "Orthopedic",
        hospital: "Manipal Hospital, Old Airport Road, Bangalore",
        experience: 15,
        availableTime: ["08:00-12:00", "14:00-17:00"]
    },
    {
        name: "Dr. Priya Nair",
        specialization: "Orthopedic",
        hospital: "Fortis Hospital, Bannerghatta Road, Bangalore",
        experience: 10,
        availableTime: ["12:00-17:00", "17:00-21:00"]
    },
    // Cardiologist Doctors
    {
        name: "Dr. Vikram Mehta",
        specialization: "Cardiologist",
        hospital: "Narayana Health City, Bommasandra, Bangalore",
        experience: 18,
        availableTime: ["08:00-12:00", "17:00-21:00"]
    },
    {
        name: "Dr. Ananya Roy",
        specialization: "Cardiologist",
        hospital: "Aster CMI Hospital, Hebbal, Bangalore",
        experience: 12,
        availableTime: ["12:00-17:00"]
    },
    // Dermatologist Doctors
    {
        name: "Dr. Kavita Verma",
        specialization: "Dermatologist",
        hospital: "Skin & Care Clinic, Indiranagar, Bangalore",
        experience: 8,
        availableTime: ["08:00-12:00", "12:00-17:00"]
    },
    {
        name: "Dr. Rohan Patel",
        specialization: "Dermatologist",
        hospital: "Apollo Hospital, Jayanagar, Bangalore",
        experience: 14,
        availableTime: ["14:00-17:00", "17:00-21:00"]
    },
    // ENT Specialist Doctors
    {
        name: "Dr. Suresh Gupta",
        specialization: "ENT Specialist",
        hospital: "St. John's Medical College Hospital, Bangalore",
        experience: 20,
        availableTime: ["08:00-12:00"]
    },
    {
        name: "Dr. Meera Iyer",
        specialization: "ENT Specialist",
        hospital: "Columbia Asia Hospital, Whitefield, Bangalore",
        experience: 9,
        availableTime: ["12:00-17:00", "17:00-21:00"]
    },
    // Pediatrician Doctors
    {
        name: "Dr. Aarti Desai",
        specialization: "Pediatrician",
        hospital: "Rainbow Children's Hospital, Marathahalli, Bangalore",
        experience: 11,
        availableTime: ["08:00-12:00", "14:00-17:00"]
    },
    {
        name: "Dr. Sameer Joshi",
        specialization: "Pediatrician",
        hospital: "Cloudnine Hospital, Jayanagar, Bangalore",
        experience: 16,
        availableTime: ["12:00-17:00", "17:00-21:00"]
    },
    // Neurologist Doctors
    {
        name: "Dr. Neha Kapoor",
        specialization: "Neurologist",
        hospital: "Sakra World Hospital, Bellandur, Bangalore",
        experience: 14,
        availableTime: ["08:00-12:00", "17:00-21:00"]
    },
    {
        name: "Dr. Arjun Reddy",
        specialization: "Neurologist",
        hospital: "NIMHANS Speciality Center, Bangalore",
        experience: 22,
        availableTime: ["12:00-17:00"]
    },
    // General Physician Doctors
    {
        name: "Dr. Sanjay Singh",
        specialization: "General Physician",
        hospital: "Fortis Hospital, Cunningham Road, Bangalore",
        experience: 25,
        availableTime: ["08:00-12:00", "12:00-17:00", "17:00-21:00"]
    },
    {
        name: "Dr. Anjali Menon",
        specialization: "General Physician",
        hospital: "BMS Hospital, Basavanagudi, Bangalore",
        experience: 8,
        availableTime: ["08:00-12:00", "14:00-17:00"]
    }
];

const seedDoctors = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB...');

        await Doctor.deleteMany();
        console.log('Cleared existing Doctors collection...');

        // In seedDoctors.js, when inserting:

        const doctorsWithStatus = doctorsData.map(doc => ({ ...doc, status: 'approved' }));
        await Doctor.insertMany(doctorsWithStatus);

        console.log(`Seeded ${doctorsWithStatus.length} approved doctors successfully!`);


        process.exit(0);
    } catch (error) {
        console.error('Seeding doctors error:', error);
        process.exit(1);
    }
};

seedDoctors();
