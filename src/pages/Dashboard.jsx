import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [navigate]);

  const upload = async () => {
    if (!file) {
      alert("Select a floorplan image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);

      const res = await axios.post(
        "http://51.20.208.173:8081/",
        formData,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(res.data);
      localStorage.setItem("modelURL", url);

      navigate("/viewer");
    } catch (err) {
      alert("Upload failed");
      console.log(err);
    } finally {
      setLoading(false);
    }
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
