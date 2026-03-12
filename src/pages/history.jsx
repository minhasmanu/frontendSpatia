import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import "./history.css";

export default function History() {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const viewerCanvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("https://spatia.co.in/history")
      .then(res => setHistory(res.data))
      .catch(err => console.error(err));
  }, []);

  // Initialize three.js scene when selected item changes
  useEffect(() => {
    if (!selected || !viewerCanvasRef.current) return;

    // Setup scene, camera, renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    
    const width = viewerCanvasRef.current.clientWidth;
    const height = viewerCanvasRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    camera.position.set(0, 2, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    viewerCanvasRef.current.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 5;

    // Load model
    const loader = new GLTFLoader();
    const modelURL = `https://spatia.co.in${selected.model_url}`;
    
    loader.load(
      modelURL,
      (gltf) => {
        const model = gltf.scene;
        model.castShadow = true;
        model.receiveShadow = true;
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        scene.add(model);
        modelRef.current = model;

        // Center and fit model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        const distance = maxDim / 2 / Math.tan(fov / 2);
        camera.position.z = distance * 1.2;
        controls.target.set(0, 0, 0);
        controls.update();
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error);
      }
    );

    sceneRef.current = scene;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!viewerCanvasRef.current) return;
      const newWidth = viewerCanvasRef.current.clientWidth;
      const newHeight = viewerCanvasRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (viewerCanvasRef.current && renderer.domElement.parentNode === viewerCanvasRef.current) {
        viewerCanvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, [selected]);

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this model?")) return;

    try {
      await axios.delete(`https://spatia.co.in/delete/${id}`);
      setHistory(history.filter(item => item.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleViewInVR = () => {
    if (selected) {
      const modelURL = `https://spatia.co.in${selected.model_url}`;
      localStorage.setItem("modelURL", modelURL);
      navigate("/viewer");
    }
  };

  if (selected) {
    return (
      <div className="viewerContainer">
        <button className="backBtn" onClick={() => setSelected(null)}>
          ← Back
        </button>

        <div className="viewerGrid">
          <div className="imagePanel">
            <img
              className="floorplanFull"
              src={`https://spatia.co.in${selected.image_url}`}
              alt="Floorplan"
            />
          </div>

          <div className="modelPanel">
            <div className="modelViewer" ref={viewerCanvasRef}></div>
            <div className="modelActions">
              <button className="vrButton" onClick={handleViewInVR}>
                View in VR
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="historyPage">
      <h1 className="historyTitle">History</h1>

      <div className="historyGrid">
        {history.map((item, index) => (
          <div className="historyCard" key={index}>
            <img
              className="thumb"
              src={`https://spatia.co.in${item.image_url}`}
              alt="Thumbnail"
            />
            <div className="historyActions">
              <button
                className="viewBtn"
                onClick={() => setSelected(item)}
              >
                View
              </button>

              <button
                className="deleteBtn"
                onClick={() => deleteItem(item.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}