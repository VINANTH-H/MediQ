import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedDoctor: null,
};

const doctorSlice = createSlice({
  name: "doctor",
  initialState,

  reducers: {
    setSelectedDoctor: (state, action) => {
      state.selectedDoctor = action.payload;
    },
  },
});

export const { setSelectedDoctor } = doctorSlice.actions;

export default doctorSlice.reducer;