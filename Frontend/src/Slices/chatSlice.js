import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  messages: [],
  conversationId: null,
  bookingDetails: null,
  bookingLoading: false,
  bookingError: null,
  bookingStatus: "idle",

  proceedLoading: false,
  proceedError: null,

};

export const proceedWithDoctor = createAsyncThunk(
  "chat/proceedWithDoctor",

  async (docId, thunkAPI) => {

    const state = thunkAPI.getState();

    const conversationId = state.chat.conversationId;
     if (!conversationId || !docId) {
      return thunkAPI.rejectWithValue(
        "Conversation ID is missing"
      );
    }


    try {
      const response = await axios.post(
        "http://localhost:5000/api/rag/chat",
        {

          conversationId: conversationId,
          message: "Proceed with booking",
          doctorId: docId,
        }
      );

      return response.data;
    }
    catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Something went wrong");
    }
  }
);


export const bookAppointment = createAsyncThunk(
  "chat/bookAppointment",

  async (_, thunkAPI) => {
    const state = thunkAPI.getState();

    const bookingDetails = state.chat.bookingDetails;
    try{
    const response = await axios.post("http://localhost:5000/api/appointments/book",
      {
        doctorId: bookingDetails.doctorId,
        date: bookingDetails.date,
        timeSlot: bookingDetails.timeSlot,
        symptoms: bookingDetails.symptoms,
      }
    );

    return response.data;
    }
    catch(err){
      return thunkAPI.rejectWithValue(err.response?.data || "smtg went wrong")
    }
  }
);

const chatSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    setConversationId: (state, action) => {
      state.conversationId = action.payload
    },

    setBookingDetails: (state, action) => {
      state.bookingDetails = action.payload;
    },
  },

  extraReducers: (builder) => {

    builder.addCase(proceedWithDoctor.fulfilled,(state, action) => {

        const response = action.payload;
        state.proceedLoading = false;
        state.proceedError = null;

        const botMessage = {
          sender: "bot",
          text: response.message,
          uiComponent: response.uiComponent,
        };

        state.messages.push(botMessage);

        state.conversationId = response.conversationId;

        state.bookingDetails = {
          ...state.bookingDetails,
          doctorId: response.state.slots.doctorId,
        };

      }
    )

    builder.addCase(proceedWithDoctor.pending,(state) => {
    state.proceedLoading = true;
    state.proceedError = null;
  }
);

builder.addCase(proceedWithDoctor.rejected,(state, action) => {

    state.proceedLoading = false;
    state.proceedError = action.payload;
  }
);

    // Booking Appointment
    builder.addCase(bookAppointment.pending, (state) => {
      state.bookingLoading = true;
      state.bookingError = null;
      state.bookingStatus = "booking"
    }
    );

    builder.addCase(bookAppointment.rejected, (state, action) => {
      state.bookingLoading = false;
       state.bookingStatus = "failed"
       state.bookingError = action.payload;
    }
    );

    builder.addCase(bookAppointment.fulfilled, (state, action) => {

      const response = action.payload;
      state.bookingLoading = false;
      state.bookingStatus = "booked"
      state.bookingError = null;
      const botMessage = {
        sender: "bot",
        text: response.message,
      };

      state.messages.push(botMessage);
    }
    );

  },

})
export const { addMessage, setConversationId, setBookingDetails } = chatSlice.actions;
export default chatSlice.reducer;