import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard(){
  const [file,setFile] = useState(null);
  const [loading,setLoading] = useState(false);
  const nav = useNavigate();

  const upload = async ()=>{
    if(!file){
      alert("Select image first");
      return;
    }

    const formData = new FormData();
    formData.append("image",file);

    try{
      setLoading(true);

      const res = await axios.post(
        "http://51.20.208.173:8081/",
        formData,
        { responseType:"blob" }
      );

      const url = window.URL.createObjectURL(res.data);
      localStorage.setItem("modelURL",url);

      nav("/viewer");

    }catch(err){
      alert("Upload failed");
      console.log(err);
    }finally{
      setLoading(false);
    }
  }

  return(
    <div style={{textAlign:"center",marginTop:"100px"}}>
      <h2>Upload Floorplan</h2>

      <input type="file" onChange={(e)=>setFile(e.target.files[0])}/>

      <br/><br/>

      <button onClick={upload}>Generate 3D</button>

      {loading && <h3>Generating 3D Model...</h3>}
    </div>
  )
}
