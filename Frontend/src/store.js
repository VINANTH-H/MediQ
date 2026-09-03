import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./Slices/chatSlice"
import doctorReducer from "./Slices/doctorSlice";
import appointmentReducer from "./Slices/appointmentSlice";

const store = configureStore({
  reducer: {
    chat: chatReducer,
    doctor: doctorReducer,
    appointment:appointmentReducer
  },
});

export default store;