import Doctor from '../models/Doctor.js';

const searchDoctors = async ({ specialty, time }) => {
    try {
        const query = {};

        // Only return doctors that have been approved by Admin
        query.status = 'approved';

        if (specialty) {
            query.specialization = specialty;
        }

        if (time) {
            query.availableTime = time;
        }

        let doctors = await Doctor.find(query);

        // Fallback: if no doctors found for specific time, return doctors by specialty
        if (doctors.length === 0 && specialty) {
            doctors = await Doctor.find({ specialization: specialty, status: 'approved' });
        }

        return doctors;
    } catch (error) {
        console.error('Error searching doctors:', error);
        return [];
    }
};

export { searchDoctors };
