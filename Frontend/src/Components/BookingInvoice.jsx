import { bookAppointment } from "../Slices/chatSlice";
import { useDispatch , useSelector} from "react-redux";

export default function BookingInvoice({ data }) {
    const dispatch = useDispatch()
    const { bookingLoading, bookingStatus, bookingError } = useSelector(
  (state) => state.chat
);

    const handleBookAppointment =()=>{
        dispatch(bookAppointment())
    }
  return (
    <div>
      <h2>Booking Invoice</h2>

      <h3>{data.doctorName}</h3>
      <p>{data.specialization}</p>

      <p>Date: {data.date}</p>
      <p>Time: {data.timeSlot}</p>

      <p>Patient: {data.patientName}</p>
      <p>Phone: {data.patientPhone}</p>

      <hr />

      <p>Consultation Fee: ₹{data.fee}</p>
      <p>Tax: ₹{data.tax}</p>
      <p>Total: ₹{data.total}</p>

     {bookingStatus === "booked" ? (
  <p>✅ Appointment Booked</p>
) : (
  <>
  {bookingError && (
      <p>{bookingError.message || bookingError}</p>
    )}
  <button
    onClick={handleBookAppointment}
    disabled={bookingLoading}
  >
    {bookingLoading ? "Booking..." : "Book Appointment"}
  </button>
  </>
)}
    </div>
  )
}