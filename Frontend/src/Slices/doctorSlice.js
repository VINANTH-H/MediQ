import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  doctors: [],
  loading: false,
  error: null,
  selectedCategory: "All Doctors",
  selectedDoctor: null,

};

export const fetchDoctors = createAsyncThunk(
  "doctor/fetchDoctors",

  async (specialization = "All", thunkAPI) => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/doctors",
        {
          params: {
            specialization: specialization,
          },
        }
      );

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Failed to fetch doctors"
      );
    }
  }
);

export const fetchDoctorById = createAsyncThunk(
  "doctor/fetchDoctorById",

  async (doctorId, thunkAPI) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/doctors/${doctorId}`
      );

      return response.data.doctor;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Failed to fetch doctor"
      );
    }
  }
);


const doctorSlice = createSlice({
  name: "doctor",
  initialState,

  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
  },

  extraReducers: (builder) => {
    // Fetch ALL doctors (Based on Category)
    builder.addCase(fetchDoctors.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(fetchDoctors.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;

      state.doctors = action.payload.doctors;
    });

    builder.addCase(fetchDoctors.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch Doctor By ID
    builder.addCase(fetchDoctorById.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.selectedDoctor = null;
    });

    builder.addCase(fetchDoctorById.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;

      state.selectedDoctor = action.payload;
    });

    builder.addCase(fetchDoctorById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { setSelectedCategory} = doctorSlice.actions;

export default doctorSlice.reducer;