import { Link } from "react-router-dom";

export default function Navbar(){
  return(
    <div style={{
      width:"100%",
      padding:"15px",
      background:"#0f172a",
      color:"white",
      display:"flex",
      justifyContent:"space-between",
      alignItems:"center"
    }}>
      <h2>Floorplan3D AI</h2>

      <div style={{display:"flex",gap:"20px"}}>
        <Link to="/" style={{color:"white"}}>Home</Link>
        <Link to="/dashboard" style={{color:"white"}}>Dashboard</Link>
      </div>
    </div>
  )
}
