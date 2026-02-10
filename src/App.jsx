import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import ViewerPage from "./pages/ViewerPage";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import LiquidEther from "./components/LiquidEther";
import "./App.css";
import "./index.css";

function App() {
  return (
    <div className="appWrap">
      <div className="liquidEtherBg">
        <LiquidEther
          colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
          mouseForce={20}
          cursorSize={45}
          isViscous
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>
      <div className="appContent">
        <BrowserRouter>
          <Loader />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<About />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/viewer" element={<ViewerPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
