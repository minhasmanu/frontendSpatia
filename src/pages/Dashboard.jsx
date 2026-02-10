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

    // Check if there's a floorplan image from DrawFloorplanPage
    if (location.state?.autoUploadFloorplan) {
      const floorplanImage = localStorage.getItem("floorplanImage");
      
      if (floorplanImage) {
        try {
          // Extract mime type from data URL (e.g., "data:image/jpeg;base64,..." -> "image/jpeg")
          const mimeMatch = floorplanImage.match(/^data:([^;]+)/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const fileName = mimeType === 'image/jpeg' ? 'floorplan.jpg' : 'floorplan.png';

          // Convert data URL to blob
          const dataUrlParts = floorplanImage.split(',');
          const bstr = atob(dataUrlParts[1]);
          const n = bstr.length;
          const u8arr = new Uint8Array(n);
          for (let i = 0; i < n; i++) {
            u8arr[i] = bstr.charCodeAt(i);
          }
          const blob = new Blob([u8arr], { type: mimeType });
          const file = new File([blob], fileName, { type: mimeType });
          
          setFile(file);

          // Clear the stored image
          localStorage.removeItem("floorplanImage");

          // Auto-trigger upload
          setTimeout(() => {
            uploadFloorplan(file);
          }, 200);
        } catch (error) {
          console.error("Error processing floorplan image:", error);
          alert("Error processing floorplan image. Please try uploading a file manually.");
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
      console.log("Uploading file:", fileToUpload.name, fileToUpload.size, "bytes");

      const res = await axios.post(
        "http://51.20.208.173:8081/",
        formData,
        { 
          responseType: "blob"
        }
      );

      const url = window.URL.createObjectURL(res.data);
      localStorage.setItem("modelURL", url);

      navigate("/viewer");
    } catch (err) {
      console.error("Upload error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        type: err.response?.type,
        contentType: err.response?.headers?.['content-type'],
        message: err.message,
        fullError: err
      });

      // Try to read error response
      if (err.response?.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          console.error("Response body:", reader.result);
          alert("Upload failed: Backend Error (Check console for details)");
        };
        reader.readAsText(err.response.data);
      } else {
        alert("Upload failed: " + (err.response?.status || err.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const upload = async () => {
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
            Transform your 2D floorplan into an interactive 3D building in
            moments.
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
          </div>

          <p className="secondaryText">
            Supported: common image formats (PNG, JPG and similar).
          </p>

          {loading && (
            <div className="loadingMessage">
              This may take a moment while we process your floorplan.
            </div>
          )}
        </div>
      </section>

      <aside className="dashboardSide">
        <div>
          <h2 className="sideSectionTitle">Tips for best results</h2>
          <p className="sideSectionText">
            Use clear, high-resolution floorplans with visible walls and room
            boundaries. Avoid noisy backgrounds where possible.
          </p>
        </div>

        <div>
          <h2 className="sideSectionTitle">What happens next?</h2>
          <p className="sideSectionText">
            We analyze your layout, generate a 3D model, and open it in the
            viewer so you can inspect, orbit and export your building.
          </p>
        </div>
      </aside>
    </div>
  );
}
