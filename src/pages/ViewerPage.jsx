import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useNavigate } from "react-router-dom";

export default function ViewerPage(){

  const mountRef = useRef(null);
  const nav = useNavigate();
  let renderer, camera;

  useEffect(()=>{

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#111");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    camera = new THREE.PerspectiveCamera(60,width/height,0.1,1000);
    camera.position.set(5,5,10);

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(width,height);
    mountRef.current.appendChild(renderer.domElement);

    // lights
    const ambient = new THREE.AmbientLight(0xffffff,2);
    scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff,2);
    dir.position.set(5,10,7);
    scene.add(dir);

    const controls = new OrbitControls(camera,renderer.domElement);

    const loader = new GLTFLoader();
    const modelURL = localStorage.getItem("modelURL");

    let model; // declare above loader
    
    loader.load(modelURL,(gltf)=>{
      const model = gltf.scene;
        
      model.traverse((child)=>{
        if(child.isMesh){
          child.material.metalness = 0;
          child.material.roughness = 1;
        }
      });

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      scene.add(model);
    });

    function animate(){
      requestAnimationFrame(animate);
        if(model){
            model.rotation.y += 0.003; // rotation speed
        }
        renderer.render(scene,camera);
    }
    animate();

  },[]);

  // 🔽 buttons
  const downloadGLB = ()=>{
    const url = localStorage.getItem("modelURL");
    const a = document.createElement("a");
    a.href = url;
    a.download = "model.glb";
    a.click();
  }

  const fullScreen = ()=>{

      const elem = mountRef.current;

     if(elem.requestFullscreen){
     elem.requestFullscreen();
    }

    setTimeout(()=>{
     const width = window.innerWidth;
     const height = window.innerHeight;

    renderer.setSize(width,height);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
    },500);
  }


  return(
    <div style={{padding:"20px",textAlign:"center"}}>

      <h2>3D Model Preview</h2>

      {/* 3D VIEWER BOX */}
      <div
        ref={mountRef}
        style={{
          width:"800px",
          height:"500px",
          margin:"auto",
          border:"2px solid gray",
          borderRadius:"10px"
        }}
      />

      {/* BUTTONS */}
      <div style={{marginTop:"20px",display:"flex",gap:"15px",justifyContent:"center"}}>
        
        <button onClick={downloadGLB}>Download GLB</button>

        <button onClick={()=>alert("FBX coming soon")}>
          Download FBX
        </button>

        <button onClick={fullScreen}>Full Screen</button>
        <button onClick={()=>document.exitFullscreen()}>Exit Fullscreen</button>

        <button onClick={()=>nav("/dashboard")}>
          Back
        </button>

      </div>

    </div>
  );
}
