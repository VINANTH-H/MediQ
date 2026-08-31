import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  conversationId: null,
};

const chatSlice = createSlice({
    name:"chats",
    initialState,
    reducers:{
           addMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    setConversationId:(state,action)=>{
        state.conversationId = action.payload
    }
    }
})
export const { addMessage , setConversationId} = chatSlice.actions;
export default chatSlice.reducer;