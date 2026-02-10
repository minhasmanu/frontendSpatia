import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useNavigate } from "react-router-dom";
import logo from "../assets/spatia-Logo-cropped.svg";
import "./ViewerPage.css";

export default function ViewerPage() {
  const mountRef = useRef(null);
  const navigate = useNavigate();
  let renderer;
  let camera;
  let model;
  let autoRotate = true;

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#050107");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(5, 5, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff, 2);
    dir.position.set(5, 10, 7);
    scene.add(dir);

    // orbit controls
    // eslint-disable-next-line no-unused-vars
    const controls = new OrbitControls(camera, renderer.domElement);

    const loader = new GLTFLoader();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const modelURL = localStorage.getItem("modelURL");

    if (modelURL) {
      loader.load(modelURL, (gltf) => {
        model = gltf.scene;

        model.traverse((child) => {
          if (child.isMesh) {
            child.material.metalness = 0;
            child.material.roughness = 1;
          }
        });

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        scene.add(model);
      });
    }

    const handleClick = (event) => {
      if (!renderer || !camera || !model) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      mouse.set(x, y);
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObject(model, true);
      if (intersects.length > 0) {
        autoRotate = false;
      }
    };

    renderer.domElement.addEventListener("pointerdown", handleClick);

    function animate() {
      requestAnimationFrame(animate);
      if (model && autoRotate) {
        model.rotation.y += 0.003;
      }
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      if (renderer && renderer.domElement) {
        renderer.domElement.removeEventListener("pointerdown", handleClick);
      }
    };
  }, []);

  const downloadGLB = () => {
    const url = localStorage.getItem("modelURL");
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = "model.glb";
    a.click();
  };

  const fullScreen = () => {
    const elem = mountRef.current;

    if (elem && elem.requestFullscreen) {
      elem.requestFullscreen();
    }

    setTimeout(() => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (!renderer || !camera) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }, 500);
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  return (
    <div className="viewerPage">
      <header className="viewerHeader">
        <div className="viewerBrand">
          <img
            src={logo}
            alt="Spatia logo"
            className="viewerBrandLogo"
          />
          <span className="viewerBrandName">SPATIA</span>
        </div>
        <div className="viewerHeaderText">
          <h1>3D Model Preview</h1>
          <p>Inspect your generated 3D building and export in one click.</p>
        </div>
        <button
          type="button"
          className="viewerBackButton"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </header>

      <main className="viewerLayout">
        <section className="viewerCanvasSection">
          <div className="viewerCanvasHeader">
            <span>Interactive Preview</span>
            <span>Orbit • Pan • Zoom</span>
          </div>
          <div ref={mountRef} className="viewerCanvas" />
        </section>

        <aside className="viewerSidebar">
          <div>
            <h2 className="viewerSidebarTitle">Export options</h2>
            <p className="viewerSidebarSubtitle">
              Download your 3D model in popular formats.
            </p>
          </div>

          <div className="viewerButtonGroup">
            <div className="viewerButtonRow">
              <button
                type="button"
                className="viewerButton primary"
                onClick={downloadGLB}
              >
                Download GLB
              </button>
            </div>
            <div className="viewerButtonRow">
              <button
                type="button"
                className="viewerButton"
                onClick={() => alert("FBX coming soon")}
              >
                Download FBX
              </button>
              <button
                type="button"
                className="viewerButton"
                onClick={fullScreen}
              >
                Full Screen
              </button>
            </div>
            <div className="viewerButtonRow">
              <button
                type="button"
                className="viewerButton"
                onClick={exitFullscreen}
              >
                Exit Fullscreen
              </button>
            </div>
          </div>

          <div className="viewerMeta">
            Use the mouse to rotate, zoom, and pan around your generated model.
          </div>
        </aside>
      </main>
    </div>
  );
}
