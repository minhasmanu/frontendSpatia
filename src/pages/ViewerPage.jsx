import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/spatia-Logo-cropped.svg";
import VRViewer from "../components/VRViewer";
import "./ViewerPage.css";

export default function ViewerPage() {
  const navigate = useNavigate();
  // keep some state refs for utilities that may be used by helpers
  let autoRotate = true; // used in old click handler (mostly legacy)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    // legacy three logic has been moved to VRViewer component
    // nothing needed here when using VRViewer
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
    const elem = document.querySelector(".vrViewerCanvas");
    if (elem && elem.requestFullscreen) {
      elem.requestFullscreen();
    }
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
          <div className="viewerCanvas">
            <VRViewer modelURL={localStorage.getItem("modelURL")} />
          </div>
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
            <div className="viewerButtonRow">
              <button
                type="button"
                className="viewerButton"
                onClick={() => {
                  const rend = window.spatiaRenderer;
                  if (navigator.xr && rend) {
                    navigator.xr
                      .requestSession("immersive-vr", {
                        optionalFeatures: ["local-floor", "bounded-floor"],
                      })
                      .then((session) => {
                        rend.xr.setSession(session);
                      })
                      .catch((err) => console.error(err));
                  } else {
                    alert("WebXR not available");
                  }
                }}
              >
                View in VR
              </button>
            </div>
          </div>

          <div className="viewerMeta">
            Use the mouse to rotate, zoom, and pan around your generated model.
          You can also tap "View in VR" on a compatible headset (Meta Quest) to enter WebXR mode.
          </div>
        </aside>
      </main>
    </div>
  );
}
