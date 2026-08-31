import DoctorCarousel from "./DoctorCarousel";



function MessageList({ messages }) {
  return (
    <div>
      {messages.map((message, index) => (
        <div key={index}>

          <p>
            {message.sender}: {message.text}
          </p>

          {message.uiComponent?.type === "doctor_carousel" && (
            <DoctorCarousel
              doctors={message.uiComponent.data}
            />
          )}

        </div>
      ))}
    </div>
  );
}

export default MessageList;