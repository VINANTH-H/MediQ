import { useEffect,useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctors } from "../Slices/doctorSlice";

const DoctorsPage = () => {
  const dispatch = useDispatch();

  const { doctors, loading, error } = useSelector(
    (state) => state.doctor
  );

  const [specialization ,setSpecialization]=  useState("All")

  useEffect(() => {
    dispatch(fetchDoctors(specialization));
  }, [dispatch,specialization]);

  console.log("Doctors:", doctors);

  if (loading) {
    return <p>Loading doctors...</p>;
  }

  if (error) {
    return <p>{error.message || error.error || error}</p>;
  }

  return (
    <div>
      <h1>Doctors</h1>


        <select
  value={specialization}
  onChange={(e) => setSpecialization(e.target.value)}
>
  <option value="All">All Doctors</option>
  <option value="General Physician">General Physician</option>
  <option value="Cardiologist">Cardiologist</option>
  <option value="Dermatologist">Dermatologist</option>
  <option value="Neurologist">Neurologist</option>
</select>

      {doctors.map((doctor) => (
        <div key={doctor._id}>
          <h2>{doctor.name}</h2>
          <p>{doctor.specialization}</p>
        </div>
      ))}
    </div>
  );
};

export default DoctorsPage;