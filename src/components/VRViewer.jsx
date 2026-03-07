import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import "./VRViewer.css";

export default function VRViewer({ modelURL }) {
  const mountRef = useRef(null);
  const rendererRef = useRef();
  const cameraRef = useRef();
  const modelRef = useRef();

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#050107");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(5, 5, 10);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.xr.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // expose renderer so parent can open a session programmatically if needed
    // this is a simple workaround; in a more elaborate setup you might
    // forward a ref or provide a callback prop instead
    window.spatiaRenderer = renderer;

    // add VR button inside the mounted container so it stays next to the canvas
    const vrBtn = VRButton.createButton(renderer);
    vrBtn.style.position = "absolute";
    vrBtn.style.bottom = "16px";
    vrBtn.style.right = "16px";
    mountRef.current.style.position = "relative";
    mountRef.current.appendChild(vrBtn);

    rendererRef.current = renderer;

    // basic lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff, 2);
    dir.position.set(5, 10, 7);
    scene.add(dir);

    const hemi = new THREE.HemisphereLight(0x888877, 0x777788, 1);
    scene.add(hemi);

    // orbit controls for desktop navigation
    const controls = new OrbitControls(camera, renderer.domElement);

    const loader = new GLTFLoader();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    if (modelURL) {
      loader.load(
        modelURL,
        (gltf) => {
          const model = gltf.scene;
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
          modelRef.current = model;
        },
        undefined,
        (err) => {
          console.error("Failed to load model", err);
        }
      );
    }

    function handleClick(event) {
      if (!renderer || !cameraRef.current || !modelRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      mouse.set(x, y);
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObject(modelRef.current, true);
      if (intersects.length > 0) {
        // stop auto rotate if user interacts
        modelRef.current.userData.autoRotate = false;
      }
    }

    renderer.domElement.addEventListener("pointerdown", handleClick);

    function animate() {
      renderer.setAnimationLoop(() => {
        if (modelRef.current && modelRef.current.userData.autoRotate !== false) {
          modelRef.current.rotation.y += 0.003;
        }
        renderer.render(scene, camera);
      });
    }

    animate();

    function onResize() {
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    window.addEventListener("resize", onResize);

    return () => {
      renderer.domElement.removeEventListener("pointerdown", handleClick);
      window.removeEventListener("resize", onResize);
      if (renderer && renderer.domElement && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [modelURL]);

  return <div ref={mountRef} className="vrViewerCanvas" />;
}
