import { useEffect , useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchDoctorById } from "../Slices/doctorSlice";
import { fetchAvailableSlots } from "../Slices/appointmentSlice";

const DoctorProfilePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState("");

  // Doctor Details
  const {
    selectedDoctor,
    loading,
    error,
  } = useSelector((state) => state.doctor);

  // Appointment slots details
  const {
  slots,
  slotsLoading,
  slotsError
} = useSelector((state) => state.appointment);

  useEffect(() => {
    dispatch(fetchDoctorById(id));
  }, [dispatch, id]);

  useEffect(() => {
  if (!selectedDate) {
    return;
  }

  dispatch(
    fetchAvailableSlots({
      doctorId: id,
      date: selectedDate,
    })
  );
}, [dispatch, id, selectedDate]);


  if (loading) {
    return <p>Loading doctor...</p>;
  }

  if (error) {
    return <p>{error.message || error.error || error}</p>;
  }

  if (!selectedDoctor) {
    return <p>Doctor not found.</p>;
  }
console.log("Selected Date:", selectedDate);
console.log("Slots" , slots)
 return (
  <div>
    <h1>{selectedDoctor.name}</h1>

    <p>
      Specialization: {selectedDoctor.specialization}
    </p>

    <p>
      Experience: {selectedDoctor.experience} years
    </p>

    <p>
      Rating: ⭐ {selectedDoctor.rating}
    </p>

    <p>
      Hospital: {selectedDoctor.hospital}
    </p>

    <p>
      Address: {selectedDoctor.address}
    </p>
       <a
  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${selectedDoctor.hospital}, ${selectedDoctor.address}`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
>
  📍 Open in Maps
</a>

    <p>
      Consultation Fee: ₹{selectedDoctor.fee}
    </p>

    <p>
      Languages: {selectedDoctor.languages.join(", ")}
    </p>

    <p>
      About: {selectedDoctor.bio}
    </p>
    <div>
  <label>Select Date</label>

  <input
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
  />
</div>

{/* slots availabel */}
    <div>
  <h2>Available Slots</h2>

  {slotsLoading && <p>Loading slots...</p>}

  {slotsError && (
    <p>
      {slotsError.error || slotsError.message || slotsError}
    </p>
  )}

  {!slotsLoading && !slotsError && slots.length === 0 && (
    <p>No slots available for this date.</p>
  )}

  {!slotsLoading && slots.length > 0 && (
    <div>
      {slots.map((slot) => (
        <div key={slot.timeSlot}>
          <span>
            {slot.isBooked ? "🔴" : "🟢"}
          </span>

          <span>{slot.timeSlot}</span>

          <span>
            {slot.isBooked ? "Unavailable" : "Available"}
          </span>
        </div>
      ))}
    </div>
  )}
</div>
    <button>Book Appointment</button>    
  </div>
);
}
export default DoctorProfilePage;