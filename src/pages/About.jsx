import React from 'react';
import './About.css';
import flower from '../assets/Flower Glass Spectrum.png';
import group93 from '../assets/Group 93.png';

export default function About(){
  return (
    <div className="aboutPage">
      <div className="aboutContainer">
        <div className="aboutLeft">
          <img src={flower} alt="Flower Glass Spectrum" className="aboutImage leftImage" />
        </div>

        <div className="aboutRight">
          <img src={group93} alt="Group 93" className="aboutImage rightImage" />
          <p className="aboutParagraph">
            Already got your project planned? Let Spatia bring it to life<br/>
            with stunning 3D architectural models.<br/>
            Perfect for architects, builders and homeowners who want clarity<br/>
            and precision, without the hassle. We handle the details, you enjoy the vision.
          </p>
        </div>
      </div>
    </div>
  )
}
