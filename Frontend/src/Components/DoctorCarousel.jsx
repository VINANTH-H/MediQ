import DoctorCard from "./DoctorCard";
function DoctorCarousel({ doctors }) {
  return (
    <div>
      {doctors.map((doctor) => (
        <DoctorCard key ={doctor.id} doctor={doctor}/>
      ))}
    </div>
  );
}

export default DoctorCarousel;