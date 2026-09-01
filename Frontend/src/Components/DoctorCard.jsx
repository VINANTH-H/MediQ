import { useDispatch,useSelector } from "react-redux"
import { proceedWithDoctor } from "../Slices/chatSlice"

export default function DoctorCard({doctor}){
    
    const dispatch = useDispatch()
    const proceedLoading = useSelector((state)=>{
      return state.chat.proceedLoading
    })

    const handleProceed =()=>{
      console.log(doctor.id)
      dispatch(proceedWithDoctor(doctor.id))
    }
  return (
        <div>
            
          <h3>{doctor.name}</h3>

          <p>{doctor.specialization}</p>

          <p>{doctor.hospital}</p>

          <p>{doctor.experience} years experience</p>

          <p>₹{doctor.fee}</p>

          <p>⭐ {doctor.rating}</p>
        <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${doctor.hospital}, ${doctor.address}`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
      >📍 View On Map
      </a>
          <button
  onClick={handleProceed}
  disabled={proceedLoading}
>
  {proceedLoading ? "Proceeding..." : "Proceed"}
</button>
        </div>
        
    )
}