import React from 'react';
import './Footer.css';
import footerImg from '../assets/footer.png';

export default function Footer() {
  return (
    <div className="footerPage">
      <div className="footerContainer">
        <img src={footerImg} alt="Footer" className="footerImage" />
      </div>
    </div>
  );
}
