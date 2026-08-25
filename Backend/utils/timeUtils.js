/**
 * Splits a time range (e.g., "08:00-12:00") into 1-hour slots.
 * @param {string} timeRange - e.g., "08:00-12:00"
 * @returns {string[]} Array of slots, e.g., ["08:00-09:00", "09:00-10:00", ...]
 */
export const generateHourlySlots = (timeRange) => {
    const [start, end] = timeRange.split('-');
    
    // Helper to parse HH:MM into total minutes from midnight
    const parseToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // Helper to convert total minutes back to HH:MM format
    const formatToTime = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
        const minutes = (totalMinutes % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    let current = parseToMinutes(start);
    const endMinutes = parseToMinutes(end);
    const slots = [];

    // Loop and increment by 60 minutes (1 hour)
    while (current + 60 <= endMinutes) {
        const slotStart = formatToTime(current);
        const slotEnd = formatToTime(current + 60);
        slots.push(`${slotStart}-${slotEnd}`);
        current += 60;
    }

    return slots;
};
