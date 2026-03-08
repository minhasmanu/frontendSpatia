import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import { Sky } from "three/examples/jsm/objects/Sky";
import "./VRViewer.css";

export default function VRViewer({ modelURL }) {
  const mountRef = useRef(null);
  const rendererRef = useRef();
  const cameraRef = useRef();
  const modelRef = useRef();

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    // slightly lighter base to avoid overly dark rooms in VR
    

    // realistic sky with sun
    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;
    skyUniforms["turbidity"].value = 10;
    skyUniforms["rayleigh"].value = 2;
    skyUniforms["mieCoefficient"].value = 0.005;
    skyUniforms["mieDirectionalG"].value = 0.8;

    const sun = new THREE.Vector3();
    const phi = THREE.MathUtils.degToRad(60);
    const theta = THREE.MathUtils.degToRad(180);
    sun.setFromSphericalCoords(1, phi, theta);
    sky.material.uniforms["sunPosition"].value.copy(sun);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Create a rig for first-person locomotion in VR
    const rig = new THREE.Group();
    scene.add(rig);
    
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0.4, 0); // eye height
    rig.add(camera);
    rig.position.set(0, -1, 5);
    cameraRef.current = camera;
    // expose rig for VR movement
    cameraRef.current.rig = rig;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.xr.enabled = true;
    // optimize pixel ratio for VR performance (especially Meta Quest)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    // tone mapping and lighting for realistic appearance
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);

    // expose renderer so parent can open a session programmatically if needed
    // this is a simple workaround; in a more elaborate setup you might
    // forward a ref or provide a callback prop instead
    window.spatiaRenderer = renderer;

    // add VR button inside the mounted container
    const vrBtn = VRButton.createButton(renderer);
    vrBtn.style.position = "absolute";
    vrBtn.style.bottom = "16px";
    vrBtn.style.right = "16px";
    mountRef.current.style.position = "relative";
    mountRef.current.appendChild(vrBtn);

    // Create exit VR button (hidden by default)
    const exitVRBtn = document.createElement("button");
    exitVRBtn.textContent = "Exit VR";
    exitVRBtn.style.position = "absolute";
    exitVRBtn.style.top = "16px";
    exitVRBtn.style.left = "16px";
    exitVRBtn.style.padding = "8px 16px";
    exitVRBtn.style.backgroundColor = "#ed23cf";
    exitVRBtn.style.color = "white";
    exitVRBtn.style.border = "none";
    exitVRBtn.style.borderRadius = "6px";
    exitVRBtn.style.cursor = "pointer";
    exitVRBtn.style.display = "none";
    exitVRBtn.style.zIndex = "1000";
    exitVRBtn.onclick = () => {
      const session = renderer.xr.getSession();
      if (session) session.end();
    };
    mountRef.current.appendChild(exitVRBtn);

    // Create joystick visual indicators
    const joystickCanvas = document.createElement("canvas");
    joystickCanvas.width = width;
    joystickCanvas.height = height;
    joystickCanvas.style.display = "none";
    joystickCanvas.style.position = "absolute";
    joystickCanvas.style.bottom = "0";
    joystickCanvas.style.left = "0";
    joystickCanvas.style.zIndex = "998";
    joystickCanvas.style.pointerEvents = "none";
    mountRef.current.appendChild(joystickCanvas);
    const joystickCtx = joystickCanvas.getContext("2d");

    rendererRef.current = renderer;

    // realistic indoor architectural lighting
    // base ambient for overall brightness
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    // hemisphere light to simulate indirect sky/ground lighting
    const hemi = new THREE.HemisphereLight(0xccccff, 0x444422, 1);
    scene.add(hemi);

    // main directional (sun) light with shadows enabled
    const mainDir = new THREE.DirectionalLight(0xffffff, 1.0);
    mainDir.position.set(10, 20, 10);
    mainDir.castShadow = true;
    // configure shadow properties for softness and quality
    mainDir.shadow.mapSize.width = 2048;
    mainDir.shadow.mapSize.height = 2048;
    mainDir.shadow.camera.near = 1;
    mainDir.shadow.camera.far = 100;
    mainDir.shadow.camera.left = -20;
    mainDir.shadow.camera.right = 20;
    mainDir.shadow.camera.top = 20;
    mainDir.shadow.camera.bottom = -20;
    scene.add(mainDir);

    // secondary directional light as a soft fill
    const fillDir = new THREE.DirectionalLight(0xffffff, 0.3);
    fillDir.position.set(-10, 10, -10);
    scene.add(fillDir);

    // enable shadow map on renderer
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // orbit controls for desktop navigation
    const controls = new OrbitControls(camera, renderer.domElement);

    // Setup VR controllers for locomotion
    const controller0 = renderer.xr.getController(0);
    const controller1 = renderer.xr.getController(1);
    scene.add(controller0);
    scene.add(controller1);

    const controllerData = {
      left: { gamepad: null, axes: [0, 0] },
      right: { gamepad: null, axes: [0, 0] },
    };

    controller0.addEventListener("connected", (event) => {
      controllerData.left.gamepad = event.data.gamepad;
    });
    controller0.addEventListener("disconnected", () => {
      controllerData.left.gamepad = null;
    });

    controller1.addEventListener("connected", (event) => {
      controllerData.right.gamepad = event.data.gamepad;
    });
    controller1.addEventListener("disconnected", () => {
      controllerData.right.gamepad = null;
    });

    // Handle VR session start/end
    renderer.xr.addEventListener("sessionstart", () => {
      exitVRBtn.style.display = "block";
      joystickCanvas.style.display = "block";
      controls.enabled = false;
    });
    renderer.xr.addEventListener("sessionend", () => {
      exitVRBtn.style.display = "none";
      joystickCanvas.style.display = "none";
      controls.enabled = true;
    });

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
              child.castShadow = true;
              child.receiveShadow = true;
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

    function drawJoysticks() {
      if (!joystickCtx || !renderer.xr.isPresenting) return;
      joystickCtx.clearRect(0, 0, joystickCanvas.width, joystickCanvas.height);

      const radius = 40;
      const deadzone = 0.1;
      const controllers = [
        { data: controllerData.left, x: 80, y: joystickCanvas.height - 80 },
        { data: controllerData.right, x: joystickCanvas.width - 80, y: joystickCanvas.height - 80 },
      ];

      controllers.forEach(({ data, x, y }) => {
        // background circle
        joystickCtx.fillStyle = "rgba(255, 255, 255, 0.2)";
        joystickCtx.beginPath();
        joystickCtx.arc(x, y, radius, 0, Math.PI * 2);
        joystickCtx.fill();

        // joystick position
        const ax = data.axes[0];
        const ay = data.axes[1];
        const magnitude = Math.sqrt(ax * ax + ay * ay);
        if (magnitude > deadzone) {
          const nx = (ax / Math.max(magnitude, 1)) * radius * 0.7;
          const ny = (ay / Math.max(magnitude, 1)) * radius * 0.7;
          joystickCtx.fillStyle = "rgba(237, 35, 207, 0.8)";
          joystickCtx.beginPath();
          joystickCtx.arc(x + nx, y + ny, 15, 0, Math.PI * 2);
          joystickCtx.fill();
        } else {
          joystickCtx.fillStyle = "rgba(255, 255, 255, 0.4)";
          joystickCtx.beginPath();
          joystickCtx.arc(x, y, 15, 0, Math.PI * 2);
          joystickCtx.fill();
        }
      });
    }

    // collision detection for wall avoidance
    const collisionRaycaster = new THREE.Raycaster();
    
    function checkCollision(position, movementDirection) {
      if (!modelRef.current) return false;

      const collisionBuffer = 0.3; // distance to keep from walls (in meters)
      const raycastDirections = [
        new THREE.Vector3(1, 0, 0),    // right
        new THREE.Vector3(-1, 0, 0),   // left
        new THREE.Vector3(0, 0, 1),    // forward
        new THREE.Vector3(0, 0, -1),   // back
        new THREE.Vector3(0.7, 0, 0.7),   // diagonal forward-right
        new THREE.Vector3(-0.7, 0, 0.7),  // diagonal forward-left
        new THREE.Vector3(0.7, 0, -0.7),  // diagonal back-right
        new THREE.Vector3(-0.7, 0, -0.7), // diagonal back-left
      ];

      // add movement direction for direct wall detection
      if (movementDirection) {
        raycastDirections.push(movementDirection.clone());
      }

      // raise ray origin slightly above floor for better detection
      const origin = position.clone();
      origin.y += 1;

      for (const direction of raycastDirections) {
        collisionRaycaster.set(origin, direction.normalize());
        const intersects = collisionRaycaster.intersectObject(modelRef.current, true);

        if (intersects.length > 0) {
          const distance = intersects[0].distance;
          if (distance < collisionBuffer) {
            return true; // collision detected
          }
        }
      }

      return false; // no collision
    }

    function animate() {
      renderer.setAnimationLoop(() => {
        // Only rotate model on desktop (not in VR)
        if (!renderer.xr.isPresenting && modelRef.current && modelRef.current.userData.autoRotate !== false) {
          modelRef.current.rotation.y += 0.003;
        }

        // Handle VR controller locomotion
        if (renderer.xr.isPresenting && cameraRef.current && cameraRef.current.rig) {
          const moveSpeed = 0.05;
          const rig = cameraRef.current.rig;

          // Use right controller for movement (axis 0 = strafe, axis 1 = forward)
          const session = renderer.xr.getSession();

        if (session) {

            for (const source of session.inputSources) {

                if (source.gamepad && source.handedness === "right") {

                    const axes = source.gamepad.axes || [];
                    if (axes.length < 2) continue;

                    const strafeAxis = axes[2] ?? axes[0];
                    const forwardAxis = axes[3] ?? axes[1];

                    const deadzone = 0.15;

                    if (Math.abs(strafeAxis) > deadzone || Math.abs(forwardAxis) > deadzone) {

                        const forward = new THREE.Vector3();
                        camera.getWorldDirection(forward);
                        forward.y = 0;
                        forward.normalize();

                        const sideways = new THREE.Vector3(-forward.z, 0, forward.x);

                        // calculate new position with cloned vectors to avoid mutation
                        const newPosition = rig.position.clone();
                        const movementDir = forward.clone().multiplyScalar(-forwardAxis).add(sideways.clone().multiplyScalar(strafeAxis));
                        newPosition.add(forward.clone().multiplyScalar(-forwardAxis * moveSpeed));
                        newPosition.add(sideways.clone().multiplyScalar(strafeAxis * moveSpeed));

                        // check for collision before moving, including movement direction
                        if (!checkCollision(newPosition, movementDir)) {
                          rig.position.copy(newPosition);
                        }

                    }

                 }

            }

        }

          // Draw joystick visuals
          drawJoysticks();
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
      // Clean up UI elements
      if (vrBtn && vrBtn.parentElement) vrBtn.parentElement.removeChild(vrBtn);
      if (exitVRBtn && exitVRBtn.parentElement) exitVRBtn.parentElement.removeChild(exitVRBtn);
      if (joystickCanvas && joystickCanvas.parentElement) joystickCanvas.parentElement.removeChild(joystickCanvas);
    };
  }, [modelURL]);

  return <div ref={mountRef} className="vrViewerCanvas" />;
}
