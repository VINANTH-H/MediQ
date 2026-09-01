import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./Slices/chatSlice"
import doctorReducer from "./Slices/doctorSlice";

const store = configureStore({
  reducer: {
    chat: chatReducer,
    doctor: doctorReducer
  },
});

export default store;