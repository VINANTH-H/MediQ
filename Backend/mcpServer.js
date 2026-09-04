import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from './models/Doctor.js';
import Appointment from './models/Appointment.js';
import User from './models/User.js';
import { searchDoctors } from './services/doctorService.js';
import { determineSpecialty } from './services/ragService.js';
import { generateHourlySlots } from './utils/timeUtils.js';

dotenv.config();

// Connect to DB if not connected
if (mongoose.connection.readyState === 0) {
    mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediq');
}

const server = new Server({
    name: 'mediq-mcp-server',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {}
    }
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'search_doctors',
                description: 'Search for available doctors by specialty, date, and time slot',
                inputSchema: {
                    type: 'object',
                    properties: {
                        specialty: { type: 'string', description: 'The medical specialty required (e.g. Cardiologist)' },
                        date: { type: 'string', description: 'The date for the appointment in YYYY-MM-DD format' },
                        time: { type: 'string', description: 'The 1-hour time slot (e.g. 10:00-11:00)' }
                    }
                }
            },
            {
                name: 'check_available_slots',
                description: 'Check available 1-hour time slots for a specific doctor on a specific date',
                inputSchema: {
                    type: 'object',
                    properties: {
                        doctorId: { type: 'string', description: 'The MongoDB ObjectId of the doctor' },
                        date: { type: 'string', description: 'The date for the appointment in YYYY-MM-DD format' }
                    },
                    required: ['doctorId', 'date']
                }
            },
            {
                name: 'determine_specialty',
                description: 'Map a patient symptom to the correct medical specialty',
                inputSchema: {
                    type: 'object',
                    properties: {
                        symptom: { type: 'string', description: 'The symptom described by the patient (e.g. fever, knee pain)' }
                    },
                    required: ['symptom']
                }
            },
            {
                name: 'book_appointment',
                description: 'Book an appointment for a patient with a specific doctor, date, and time',
                inputSchema: {
                    type: 'object',
                    properties: {
                        doctorId: { type: 'string' },
                        patientId: { type: 'string', description: 'Optional. Will default to first user if omitted.' },
                        date: { type: 'string', description: 'YYYY-MM-DD' },
                        timeSlot: { type: 'string', description: '10:00-11:00' },
                        symptoms: { type: 'string' }
                    },
                    required: ['doctorId', 'date', 'timeSlot']
                }
            }
        ]
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    try {
        if (name === 'determine_specialty') {
            const specialty = await determineSpecialty(args.symptom);
            return {
                content: [{ type: 'text', text: specialty || 'General Physician' }]
            };
        }
        
        if (name === 'search_doctors') {
            const doctors = await searchDoctors({ 
                specialty: args.specialty, 
                date: args.date, 
                time: args.time 
            });
            return {
                content: [{ type: 'text', text: JSON.stringify(doctors) }]
            };
        }

        if (name === 'check_available_slots') {
            const doctor = await Doctor.findById(args.doctorId);
            if (!doctor || doctor.status !== 'approved') {
                throw new Error('Doctor not found or not approved');
            }
            let allSlots = [];
            doctor.availableTime.forEach(range => {
                allSlots = allSlots.concat(generateHourlySlots(range));
            });
            const bookedAppointments = await Appointment.find({
                doctor: args.doctorId,
                date: args.date,
                status: 'scheduled'
            });
            const bookedSlots = bookedAppointments.map(app => app.timeSlot);
            const formattedSlots = allSlots.map(timeSlot => ({
                timeSlot,
                isBooked: bookedSlots.includes(timeSlot)
            }));
            
            return {
                content: [{ type: 'text', text: JSON.stringify({ 
                    doctorName: doctor.name, 
                    date: args.date, 
                    slots: formattedSlots 
                }) }]
            };
        }

        if (name === 'book_appointment') {
            const existingBooking = await Appointment.findOne({
                doctor: args.doctorId,
                date: args.date,
                timeSlot: args.timeSlot,
                status: 'scheduled'
            });
            
            if (existingBooking) {
                return {
                    content: [{ type: 'text', text: JSON.stringify({ error: 'This time slot has already been booked by another patient' }) }],
                    isError: true
                };
            }

            let patientId = args.patientId;
            if (!patientId) {
                const defaultUser = await User.findOne({});
                patientId = defaultUser?._id;
            }

            const appointment = await Appointment.create({
                patient: patientId,
                doctor: args.doctorId,
                date: args.date,
                timeSlot: args.timeSlot,
                symptoms: args.symptoms || 'General Consultation',
                status: 'scheduled'
            });

            return {
                content: [{ type: 'text', text: JSON.stringify({ success: true, appointmentId: appointment._id }) }]
            };
        }

        throw new Error(`Tool not found: ${name}`);
    } catch (error) {
        return {
            content: [{ type: 'text', text: error.message }],
            isError: true
        };
    }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('MediQ MCP Server running on stdio');
