import { Link } from "react-router-dom";
import styles from './Navbar.module.css';
import logo from '../assets/spatia-Logo-cropped.svg';

export default function Navbar(){
  return(
    <div className={styles.container}>
      <div className={styles.brand}>
        <img src={logo} alt="Spatia Logo" className={styles.logo} />
        <h2>SPATIA</h2>
      </div>

      <div className={styles.links}>
        <Link to="/" className={styles.link}>Home</Link>
      </div>
    </div>
  )
}
