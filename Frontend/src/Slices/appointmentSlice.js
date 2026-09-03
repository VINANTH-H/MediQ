import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    slots: [],
    slotsLoading: false,
    slotsError: null,
};

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




const appointmentSlice = createSlice({
    name: "appointment",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(
            fetchAvailableSlots.pending,
            (state) => {
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
    }
});

export default appointmentSlice.reducer;