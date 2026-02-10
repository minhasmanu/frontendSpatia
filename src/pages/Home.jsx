import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="authButtons">
        <button className="authButton" onClick={() => navigate("/login")}>Log in</button>
        <button className="authButton primary" onClick={() => navigate("/signup")}>Sign up</button>
      </div>

      <div className="heroContent">
        <h1 className="heroTitle">
          Beyond Blueprints: Integrating Futuristic Concepts
          <span className="heroTitleLine2">
            Push the boundaries of design with advanced 3D modeling
          </span>
        </h1>
        <p className="heroSubtitle">
          Upload floorplan and generate 3D building instantly
        </p>
        <div className="heroCta">
          <button
            type="button"
            className="ctaButton"
            onClick={() => navigate("/login")}
          >
            Start Now
          </button>
        </div>
      </div>
    </section>
  );
}
