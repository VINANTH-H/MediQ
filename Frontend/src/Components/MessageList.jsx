import DoctorCarousel from "./DoctorCarousel";
import BookingInvoice from "./BookingInvoice";


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

          {message.uiComponent?.type === "booking_invoice" && (
            <BookingInvoice data={message.uiComponent.data}/>
          )}

        </div>
      ))}
    </div>
  );
}

export default MessageList;