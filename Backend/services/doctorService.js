import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { generateHourlySlots } from '../utils/timeUtils.js';

/**
 * Searches for approved doctors of a specialty who are actually free
 * on the requested date and 1-hour time slot range.
 */
const searchDoctors = async ({ specialty, date, time }) => {
    try {
        const query = { status: 'approved' };

        if (specialty) {
            query.specialization = specialty;
        }

        // 1. Fetch all approved doctors matching the specialty
        const doctors = await Doctor.find(query);

        // If no date or time is collected yet, just return matching doctors by specialty
        if (!date || !time) {
            return doctors;
        }

        const availableDoctors = [];

        // 2. Filter doctors based on their actual availability for the requested slot
        for (const doctor of doctors) {
            // A. Generate all possible 1-hour slots for this doctor
            let allSlots = [];
            doctor.availableTime.forEach(range => {
                allSlots = allSlots.concat(generateHourlySlots(range));
            });

            // B. Check if the doctor even works during the requested time slot
            if (!allSlots.includes(time)) {
                continue; // Doctor doesn't work at this time, skip
            }

            // C. Check if the doctor already has a booking at this time and date
            const existingBooking = await Appointment.findOne({
                doctor: doctor._id,
                date,
                timeSlot: time,
                status: 'scheduled'
            });

            // If no booking exists, the doctor is free!
            if (!existingBooking) {
                availableDoctors.push(doctor);
            }
        }

        return availableDoctors;
    } catch (error) {
        console.error('Error searching doctors:', error);
        return [];
    }
};

export { searchDoctors };
