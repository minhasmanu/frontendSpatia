


import { useState, useEffect } from 'react';
import SpatiaLogo from '../assets/spatia-Logo.svg';
import './Loader.css';

export default function Loader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if loader was already shown in this session
    const loaderShown = sessionStorage.getItem('loaderShown');
    
    if (loaderShown) {
      setIsVisible(false);
      return;
    }

    // Mark loader as shown for this session
    sessionStorage.setItem('loaderShown', 'true');

    // Simulate app loading time and fade out (4s loading + 0.8s fade-out)
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-content">
        <div className="logo-container">
          <img 
            src={SpatiaLogo}
            alt="Spatia Logo"
            className="loader-logo"
          />
        </div>
      </div>
    </div>
  );
}
