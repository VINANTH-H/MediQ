import { useState } from "react";
import MessageInput from "../Components/MessageInput";
import MessageList from "../Components/MessageList";

export default function ChatPage(){
     const [input, setInput] = useState("");
      const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! How can I help you today?",
    },
  ]);
  const [conversationId, setConversationId] = useState(null);
  
   const handleSend = () => {
  if (input.trim() === "") {
    return;
  }

  const newMessage = {
    sender: "user",
    text: input,
  };

  const botMessage = {
    sender: "bot",
    text: "I'll help you find the appropriate doctor.",
  };

  setMessages((previousMessages) => [
    ...previousMessages,
    newMessage,
    botMessage,
  ]);

  setInput("");
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