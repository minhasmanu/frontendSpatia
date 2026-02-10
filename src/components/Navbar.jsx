import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import styles from './Navbar.module.css';
import logo from '../assets/spatia-Logo-cropped.svg';

export default function Navbar(){
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleAboutClick = () => {
    setMenuOpen(false);
    if (location.pathname === '/') {
      // Scroll smoothly to about-section
      const element = document.getElementById('about-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home and pass state
      navigate('/', { state: { scrollToAbout: true } });
    }
  };

  const handleFooterClick = () => {
    setMenuOpen(false);
    if (location.pathname === '/') {
      // Scroll smoothly to footer-section
      const element = document.getElementById('footer-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home and pass state
      navigate('/', { state: { scrollToFooter: true } });
    }
  };

  const handleNavClick = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return(
    <>
      <div className={styles.container}>
        <div className={styles.brand}>
          <img src={logo} alt="Spatia Logo" className={styles.logo} />
          <h2>SPATIA</h2>
        </div>

        <div className={styles.links}>
          <Link to="/" className={styles.link}>Home</Link>
          <div onClick={handleAboutClick} className={styles.link} style={{ cursor: 'pointer' }}>About</div>
          <div onClick={handleFooterClick} className={styles.link} style={{ cursor: 'pointer' }}>Footer</div>
        </div>

        <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/" className={styles.mobileMenuLink} onClick={() => setMenuOpen(false)}>Home</Link>
          <div onClick={handleAboutClick} className={styles.mobileMenuLink}>About</div>
          <div onClick={handleFooterClick} className={styles.mobileMenuLink}>Footer</div>
          <div className={styles.mobileMenuDivider}></div>
          <button className={`${styles.mobileAuthButton} ${styles.primary}`} onClick={() => handleNavClick("/login")}>Log in</button>
        </div>
      )}

      <div className={styles.authButtons}>
        <button className={`${styles.authButton} ${styles.primary}`} onClick={() => navigate("/login")}>Log in</button>
      </div>
    </>
  )
}
