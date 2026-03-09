import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    }

    if (location.state?.autoUploadFloorplan) {
      const floorplanImage = localStorage.getItem("floorplanImage");

      if (floorplanImage) {
        try {
          const mimeMatch = floorplanImage.match(/^data:([^;]+)/);
          const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
          const fileName =
            mimeType === "image/jpeg" ? "floorplan.jpg" : "floorplan.png";

          const dataUrlParts = floorplanImage.split(",");
          const bstr = atob(dataUrlParts[1]);
          const n = bstr.length;
          const u8arr = new Uint8Array(n);

          for (let i = 0; i < n; i++) {
            u8arr[i] = bstr.charCodeAt(i);
          }

          const blob = new Blob([u8arr], { type: mimeType });
          const file = new File([blob], fileName, { type: mimeType });

          setFile(file);

          localStorage.removeItem("floorplanImage");

          setTimeout(() => {
            uploadFloorplan(file);
          }, 200);
        } catch (error) {
          console.error("Error processing floorplan image:", error);
          alert("Error processing floorplan image.");
          localStorage.removeItem("floorplanImage");
        }
      }
    }
  }, [navigate, location]);

  const uploadFloorplan = async (fileToUpload) => {
    if (!fileToUpload) {
      alert("Select a floorplan image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", fileToUpload);

    try {
      setLoading(true);

      console.log("Uploading:", fileToUpload.name);

      const res = await axios.post(
        "https://spatia.co.in/",
        formData,
        { 
          responseType: "blob"
        }
      );

      console.log("Backend response:", res.data);

      const modelFile = res.data.model;

      const modelURL = `https://spatia.co.in/outputs/${modelFile}`;;

      localStorage.setItem("modelURL", modelURL);

      navigate("/viewer");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const upload = () => {
    uploadFloorplan(file);
  };

  const handleFileChange = (event) => {
    const selected = event.target.files && event.target.files[0];
    if (selected) {
      setFile(selected);
    }
  };

  return (
    <div className="dashboardPage">
      <section className="dashboardMain">
        <header className="dashboardHeader">
          <h1 className="dashboardTitle">Upload floorplan</h1>
          <p className="dashboardSubtitle">
            Transform your 2D floorplan into an interactive 3D building.
          </p>
        </header>

        <div className="uploadCard">
          <label className="uploadLabel">
            <span className="uploadLabelTitle">Drop your floorplan here</span>
            <span className="uploadLabelHint">
              Or click to browse image files from your device.
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hiddenFileInput"
            />
          </label>

          <div className="fileInfo">
            {file ? `Selected: ${file.name}` : "No file selected yet."}
          </div>

          <div className="primaryActions">
            <button
              type="button"
              className="primaryButton"
              onClick={upload}
              disabled={loading}
            >
              {loading ? "Generating 3D model..." : "Generate 3D model"}
            </button>

            <button
              type="button"
              className="secondaryButton"
              onClick={() => navigate("/draw-floorplan")}
            >
              Draw Plan
            </button>
              <button
                type="button"
                className="secondaryButton"
                onClick={() => navigate("/history")}
          >
                History
             </button>
          </div>

          <p className="secondaryText">
            Supported: PNG, JPG and similar formats.
          </p>

          {loading && (
            <div className="loadingMessage">
              Processing floorplan... please wait.
            </div>
          )}
        </div>
      </section>

      <aside className="dashboardSide">
        <div>
          <h2 className="sideSectionTitle">Tips for best results</h2>
          <p className="sideSectionText">
            Use clear floorplans with visible walls and room boundaries.
          </p>
        </div>

        <div>
          <h2 className="sideSectionTitle">What happens next?</h2>
          <p className="sideSectionText">
            We analyze your layout, generate a 3D model, and open it in the
            viewer.
          </p>
        </div>
      </aside>
    </div>
  );
}