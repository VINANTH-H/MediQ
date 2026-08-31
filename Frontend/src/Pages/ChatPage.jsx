import { useState } from "react";
import axios from 'axios'

import { useDispatch,useSelector } from "react-redux";
import { addMessage,setConversationId } from "../Slices/chatSlice";

import MessageInput from "../Components/MessageInput";
import MessageList from "../Components/MessageList";

export default function  ChatPage(){

     const dispatch = useDispatch()
     const messages = useSelector((state)=>{
      return state.chat.messages
     })

       const conversationId = useSelector((state)=>{
      return state.chat.conversationId
     })
     const [input, setInput] = useState("");
   
  

   const handleSend = async() => {
  if (input.trim() === "") {
    return;
  }

  const userMessage = {
    sender: "user",
    text: input,
  };
dispatch(addMessage(userMessage));
 


  const requestBody = {
    message: input,
  };

  if (conversationId) {
    requestBody.conversationId = conversationId;
  }
 
  setInput("");
  try {
    const response = await axios.post(
      "http://localhost:5000/api/rag/chat",
      requestBody
    );
    console.log(response.data);
    dispatch(setConversationId(response.data.conversationId))

    const botMessage = {
        sender:"bot",
        text: response.data.message,
        uiComponent: response.data.uiComponent 
    }

    dispatch(addMessage(botMessage))

} catch(err){
    console.log("Error : ",err)
}
};

    return (
        <div className="p-10">
        <h2 className="text-4xl font-bold">Chat Page</h2>
           
        <MessageList messages={messages} />

        <MessageInput
        input={input}
        setInput={setInput}
        onSend={handleSend}
      />
       

        
        </div>
    )
}