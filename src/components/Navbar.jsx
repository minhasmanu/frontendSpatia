import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from './Navbar.module.css';
import logo from '../assets/spatia-Logo-cropped.svg';

export default function Navbar(){
  const navigate = useNavigate();
  const location = useLocation();

  const handleAboutClick = () => {
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
      </div>

      <div className={styles.authButtons}>
        <button className={styles.authButton} onClick={() => navigate("/login")}>Log in</button>
        <button className={`${styles.authButton} ${styles.primary}`} onClick={() => navigate("/signup")}>Sign up</button>
      </div>
    </>
  )
}
