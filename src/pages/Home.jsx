import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import About from "./About";
import Footer from "./Footer";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollToAbout) {
      const aboutSection = document.getElementById("about-section");
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth" });
        window.history.replaceState({}, document.title);
      }
    } else if (location.state?.scrollToFooter) {
      const footerSection = document.getElementById("footer-section");
      if (footerSection) {
        footerSection.scrollIntoView({ behavior: "smooth" });
        window.history.replaceState({}, document.title);
      }
    }
  }, [location]);

  return (
    <>
      <section className="hero">
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
              onClick={() => navigate("/dashboard")}
            >
              Get Started
            </button>
          </div>
        </div>
      </section>
      <div id="about-section">
        <About />
      </div>
      <div id="footer-section">
        <Footer />
      </div>
    </>
  );
}
