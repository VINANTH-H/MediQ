import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

import Doctor from '../models/Doctor.js';

const doctorsData = [
    // Orthopedic Doctors
    {
        name: "Dr. Rajesh Sharma",
        specialization: "Orthopedic",
        hospital: "Manipal Hospital, Old Airport Road, Bangalore",
        experience: 15,
        availableTime: ["08:00-12:00", "14:00-17:00"],
        fee: 600,
        address: "Room 102, Wing A, Manipal Hospital",
        rating: 4.9,
        languages: ["English", "Hindi", "Kannada"],
        bio: "Specialist in joint replacements, sports injuries, and advanced orthopedic surgeries."
    },
    {
        name: "Dr. Priya Nair",
        specialization: "Orthopedic",
        hospital: "Fortis Hospital, Bannerghatta Road, Bangalore",
        experience: 10,
        availableTime: ["12:00-17:00", "17:00-21:00"],
        fee: 500,
        address: "Room 205, Block B, Fortis Hospital",
        rating: 4.7,
        languages: ["English", "Hindi", "Malayalam"],
        bio: "Expert in pediatric orthopedics and fracture management."
    },
    // Cardiologist Doctors
    {
        name: "Dr. Vikram Mehta",
        specialization: "Cardiologist",
        hospital: "Narayana Health City, Bommasandra, Bangalore",
        experience: 18,
        availableTime: ["08:00-12:00", "17:00-21:00"],
        fee: 800,
        address: "OPD 3, Narayana Cardiology Block",
        rating: 4.9,
        languages: ["English", "Hindi", "Gujarati"],
        bio: "Consultant Interventional Cardiologist specializing in angioplasty and pacemaker implantation."
    },
    {
        name: "Dr. Ananya Roy",
        specialization: "Cardiologist",
        hospital: "Aster CMI Hospital, Hebbal, Bangalore",
        experience: 12,
        availableTime: ["12:00-17:00"],
        fee: 700,
        address: "Room 110, Aster Heart Centre",
        rating: 4.8,
        languages: ["English", "Hindi", "Bengali"],
        bio: "Expert in non-invasive cardiology, heart failure management, and preventive cardiology."
    },
    // Dermatologist Doctors
    {
        name: "Dr. Kavita Verma",
        specialization: "Dermatologist",
        hospital: "Skin & Care Clinic, Indiranagar, Bangalore",
        experience: 8,
        availableTime: ["08:00-12:00", "12:00-17:00"],
        fee: 450,
        address: "Skin & Care Clinic, 100ft Road, Indiranagar",
        rating: 4.6,
        languages: ["English", "Hindi"],
        bio: "Clinical & cosmetic dermatologist focusing on acne, anti-aging, and laser skin treatments."
    },
    {
        name: "Dr. Rohan Patel",
        specialization: "Dermatologist",
        hospital: "Apollo Hospital, Jayanagar, Bangalore",
        experience: 14,
        availableTime: ["14:00-17:00", "17:00-21:00"],
        fee: 550,
        address: "Room 402, Apollo Specialty Clinic",
        rating: 4.7,
        languages: ["English", "Hindi", "Marathi"],
        bio: "Specializes in clinical dermatology, skin cancer screenings, and hair transplant supervision."
    },
    // ENT Specialist Doctors
    {
        name: "Dr. Suresh Gupta",
        specialization: "ENT Specialist",
        hospital: "St. John's Medical College Hospital, Bangalore",
        experience: 20,
        availableTime: ["08:00-12:00"],
        fee: 500,
        address: "ENT OPD, St. John's Hospital",
        rating: 4.8,
        languages: ["English", "Hindi", "Kannada"],
        bio: "Over 20 years of experience in microscopic ear surgeries and sinus treatments."
    },
    {
        name: "Dr. Meera Iyer",
        specialization: "ENT Specialist",
        hospital: "Columbia Asia Hospital, Whitefield, Bangalore",
        experience: 9,
        availableTime: ["12:00-17:00", "17:00-21:00"],
        fee: 600,
        address: "Room 12, Main Building, Columbia Asia",
        rating: 4.5,
        languages: ["English", "Hindi", "Tamil"],
        bio: "Special interest in pediatric ENT, snoring disorders, and throat infections."
    },
    // Pediatrician Doctors
    {
        name: "Dr. Aarti Desai",
        specialization: "Pediatrician",
        hospital: "Rainbow Children's Hospital, Marathahalli, Bangalore",
        experience: 11,
        availableTime: ["08:00-12:00", "14:00-17:00"],
        fee: 500,
        address: "OPD 5, Rainbow Children's Wing",
        rating: 4.8,
        languages: ["English", "Hindi", "Marathi"],
        bio: "Passionate about child health, immunizations, and developmental pediatrics."
    },
    {
        name: "Dr. Sameer Joshi",
        specialization: "Pediatrician",
        hospital: "Cloudnine Hospital, Jayanagar, Bangalore",
        experience: 16,
        availableTime: ["12:00-17:00", "17:00-21:00"],
        fee: 600,
        address: "Room 303, Cloudnine Pediatrics",
        rating: 4.9,
        languages: ["English", "Hindi", "Kannada"],
        bio: "Neonatology expert specializing in newborn care, nutrition, and pediatric emergencies."
    },
    // Neurologist Doctors
    {
        name: "Dr. Neha Kapoor",
        specialization: "Neurologist",
        hospital: "Sakra World Hospital, Bellandur, Bangalore",
        experience: 14,
        availableTime: ["08:00-12:00", "17:00-21:00"],
        fee: 750,
        address: "Neurology OPD 2, Sakra World Hospital",
        rating: 4.7,
        languages: ["English", "Hindi", "Punjabi"],
        bio: "Specializes in headache disorders, epilepsy management, and stroke rehabilitation."
    },
    {
        name: "Dr. Arjun Reddy",
        specialization: "Neurologist",
        hospital: "NIMHANS Speciality Center, Bangalore",
        experience: 22,
        availableTime: ["12:00-17:00"],
        fee: 900,
        address: "Specialist Wing, NIMHANS Clinic",
        rating: 4.9,
        languages: ["English", "Telugu", "Kannada"],
        bio: "Renowned neurologist specializing in neuro-degenerative disorders and sleep medicine."
    },
    // General Physician Doctors
    {
        name: "Dr. Sanjay Singh",
        specialization: "General Physician",
        hospital: "Fortis Hospital, Cunningham Road, Bangalore",
        experience: 25,
        availableTime: ["08:00-12:00", "12:00-17:00", "17:00-21:00"],
        fee: 400,
        address: "Room 101, Fortis OPD Block",
        rating: 4.8,
        languages: ["English", "Hindi"],
        bio: "Providing comprehensive primary care, diabetes management, and treatment for chronic illnesses."
    },
    {
        name: "Dr. Anjali Menon",
        specialization: "General Physician",
        hospital: "BMS Hospital, Basavanagudi, Bangalore",
        experience: 8,
        availableTime: ["08:00-12:00", "14:00-17:00"],
        fee: 350,
        address: "OPD 1, BMS Hospital",
        rating: 4.6,
        languages: ["English", "Hindi", "Malayalam"],
        bio: "Focuses on general infections, preventive health screenings, and family medicine."
    }
];

const seedDoctors = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB...');

        await Doctor.deleteMany();
        console.log('Cleared existing Doctors collection...');

        // Hash default password for all seeded doctors
        const salt = await bcrypt.genSalt(10);
        const defaultHashedPassword = await bcrypt.hash("Password@123", salt);

        const doctorsWithStatus = doctorsData.map(doc => ({
            ...doc,
            email: doc.email || `${doc.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
            password: defaultHashedPassword,
            phone: doc.phone || "+91 7676436093",
            status: 'approved'
        }));
        await Doctor.insertMany(doctorsWithStatus);

        console.log(`Seeded ${doctorsWithStatus.length} approved doctors successfully!`);

        process.exit(0);
    } catch (error) {
        console.error('Seeding doctors error:', error);
        process.exit(1);
    }
};

seedDoctors();
