import { Link } from "react-router-dom";

const DoctorProfileCard = ({ doctor }) => {
  return (
    <div>
      <h2>{doctor.name}</h2>

      <p>{doctor.specialization}</p>

      <p>{doctor.hospital}</p>

      <button><Link to={`/user/doctors/${doctor._id}`}>
        View
      </Link>
      </button>
      
    </div>
  );
};

export default DoctorProfileCard;