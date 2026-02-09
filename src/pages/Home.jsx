import { useNavigate } from "react-router-dom";

export default function Home(){
  const nav = useNavigate();

  return(
    <div style={{textAlign:"center",marginTop:"100px"}}>
      <h1>Beyond Blueprints: Integrating Futuristic Concepts
      Push the boundaries of design with advanced 3D modeling</h1>
      <p>Upload floorplan and generate 3D building instantly</p>

      <button onClick={()=>nav("/dashboard")}
      style={{padding:"15px",fontSize:"18px"}}>
        Start Now
      </button>
    </div>
  )
}
