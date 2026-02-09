import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ViewerPage from "./pages/ViewerPage";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import './index.css';
function App() {
  return (
    <BrowserRouter>
      <Loader />
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/viewer" element={<ViewerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
