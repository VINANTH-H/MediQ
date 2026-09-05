import { useDispatch, useSelector } from "react-redux";
import { bookAppointment } from "../Slices/appointmentSlice";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const BookingModal = ({
  isModalOpen,
  setIsModalOpen,
  selectedDoctor,
  modalDate,
  setModalDate,
  slots,
  slotsLoading,
  slotsError,
  selectedSlot,
  setSelectedSlot,
  setSymptoms,
  symptoms
}) => {
    const dispatch = useDispatch();
    const { bookingLoading, bookingError,bookingSuccess } = useSelector(
  (state) => state.appointment
);
const navigate = useNavigate();
useEffect(() => {
  if (bookingSuccess) {
    navigate("/user/appointments");
  }
}, [bookingSuccess, navigate]);

  if (!isModalOpen) {
    return null;
  }
  

  const handleConfirmBooking = ()=>{
    if (!modalDate || !selectedSlot) {
    return;
  }

  dispatch(
    bookAppointment({
      doctorId: selectedDoctor._id,
      date: modalDate,
      timeSlot: selectedSlot,
      symptoms,
    })
  );
  }

  return (
    <div>
      <div>
        <h2>Book Appointment</h2>

        <p>
          Booking with {selectedDoctor.name}
        </p>

        <div>
          <label>Select Date</label>

          <input
            type="date"
            value={modalDate}
            onChange={(e) => setModalDate(e.target.value)}
          />
        </div>

        <div>
          <h3>Select Time Slot</h3>

          {!modalDate && (
            <p>Select a date to view available slots.</p>
          )}

          {modalDate && slotsLoading && (
            <p>Loading slots...</p>
          )}

          {modalDate && slotsError && (
            <p>
              {slotsError.error ||
                slotsError.message ||
                slotsError}
            </p>
          )}

          {modalDate &&
            !slotsLoading &&
            !slotsError &&
            slots.length === 0 && (
              <p>No slots available for this date.</p>
            )}

          {modalDate &&
            !slotsLoading &&
            slots.length > 0 && (
              <div>
                {slots.map((slot) => (
                  <button
                    key={slot.timeSlot}
                    disabled={slot.isBooked}
                    onClick={() =>
                      setSelectedSlot(slot.timeSlot)
                    }
                    className={
                      selectedSlot === slot.timeSlot
                        ? "selected-slot"
                        : ""
                    }
                  >
                    {slot.timeSlot}
                  </button>
                ))}
              </div>
            )}
        </div>
        <div>
            <br />
  <label>Symptoms</label><br />

  <textarea
    value={symptoms}
    onChange={(e) => setSymptoms(e.target.value)}
    placeholder="Describe your symptoms"
  />
</div>

        {bookingError && (
  <p>
    {bookingError.error ||
      bookingError.message ||
      bookingError}
  </p>
)}

<button
  onClick={handleConfirmBooking}
  disabled={!modalDate || !selectedSlot || bookingLoading}
>
  {bookingLoading ? "Booking..." : "Confirm Booking"}
</button>

<button onClick={() => setIsModalOpen(false)}>
  Cancel
</button>
      </div>
    </div>
  );
};

export default BookingModal;