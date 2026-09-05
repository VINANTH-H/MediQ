import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    slots: [],
    slotsLoading: false,
    slotsError: null,

    // booking modal
    bookingLoading: false,
    bookingError: null,
    bookingSuccess: false,


    //List Appointments realted state variables
    appointments: [],
    appointmentsLoading: false,
    appointmentsError: null,

};


// Fetch Available Slots
export const fetchAvailableSlots = createAsyncThunk(
    "appointment/fetchAvailableSlots",

    async ({ doctorId, date }, thunkAPI) => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/appointments/slots",
                {
                    params: {
                        doctorId,
                        date,
                    },
                }
            );
            console.log(response.data)
            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data || "Failed to fetch available slots"
            );
        }
    }
);

// Book Appointment
export const bookAppointment = createAsyncThunk(
    "appointment/bookAppointment",
    async ({ doctorId, date, timeSlot, symptoms }, thunkAPI) => {
        try {
            const response = await axios.post(
                "http://localhost:5000/api/appointments/book",
                {
                    doctorId,
                    date,
                    timeSlot,
                    symptoms,
                }
            );
            console.log("Appointmnet Booking final", response.data)
            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data || "Failed to book appointment"
            );
        }
    }
);

// Fetch Appointments
export const fetchMyAppointments = createAsyncThunk(
    "appointment/fetchMyAppointments",
    async (_, thunkAPI) => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/appointments/my-appointments"
            );

            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data || "Failed to fetch appointments"
            );
        }
    }
);



const appointmentSlice = createSlice({
    name: "appointment",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchAvailableSlots.pending, (state) => {
            state.slotsLoading = true;
            state.slotsError = null;
        }
        );

        builder.addCase(fetchAvailableSlots.fulfilled, (state, action) => {
            state.slotsLoading = false;
            state.slotsError = null;

            state.slots = action.payload.slots;
        }
        );

        builder.addCase(fetchAvailableSlots.rejected, (state, action) => {
            state.slotsLoading = false;
            state.slotsError = action.payload;
        }
        );

        builder.addCase(bookAppointment.pending, (state) => {
            state.bookingLoading = true;
            state.bookingError = null;
            state.bookingSuccess = false;
        });

        builder.addCase(bookAppointment.fulfilled, (state) => {
            state.bookingLoading = false;
            state.bookingError = null;
            state.bookingSuccess = true;
        });

        builder.addCase(bookAppointment.rejected, (state, action) => {
            state.bookingLoading = false;
            state.bookingError = action.payload;
            state.bookingSuccess = false;
        });

        builder.addCase(fetchMyAppointments.pending, (state) => {
            state.appointmentsLoading = true;
            state.appointmentsError = null;
        });

        builder.addCase(fetchMyAppointments.fulfilled, (state, action) => {
            state.appointmentsLoading = false;
            state.appointmentsError = null;
            state.appointments = action.payload.appointments;
        });

        builder.addCase(fetchMyAppointments.rejected, (state, action) => {
            state.appointmentsLoading = false;
            state.appointmentsError = action.payload;
        });

    }
});

export default appointmentSlice.reducer;