import { createSlice ,  createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  doctors:[],
  loading:false,
  error: null,
  selectedCategory: "All Doctors",

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

const doctorSlice = createSlice({
  name: "doctor",
  initialState,

  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
  },

   extraReducers: (builder) => {
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
  },
});

export const { setSelectedCategory } = doctorSlice.actions;

export default doctorSlice.reducer;