import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import "./Keyfeature.css";

gsap.registerPlugin(ScrollTrigger);

function Keyfeature() {
  const keyRef = useRef(null);

  useEffect(() => {
    // Title animation
    gsap.fromTo('.keyf', 
      { y: -100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "back.out(1.7)"
      }
    );

    // Feature boxes animation
    const keys = document.querySelectorAll('.key');
    keys.forEach((key, index) => {
      gsap.fromTo(key,
        { 
          y: 100,
          opacity: 0,
          scale: 0.8
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: index * 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: key,
            start: "top bottom-=100",
            end: "top center",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Continuous glow animation for headings
    gsap.to('.key h3', {
      textShadow: '0 0 15px rgba(0, 255, 102, 0.7)',
      repeat: -1,
      yoyo: true,
      duration: 1.5
    });

  }, []);

  return (
    <div className="keyfeature" ref={keyRef}>
      <h1 className='keyf'>Smart <span id='feature'>Inventory</span></h1>
      
      <div className="key-section">
        <div className='key'>
          <h3>AI-Powered Vision</h3>
          <p>Computer vision technology that can identify and track ingredients without barcodes or RFID tags.</p>
        </div>

        <div className='key'>
          <h3>Smart Analytics</h3>
          <p>Detailed reporting on waste patterns, cost analysis, and environmental impact metrics.</p>
        </div>

        <div className='key'>
          <h3>Menu Optimization</h3>
          <p>AI suggestions for menu changes based on inventory levels and waste reduction opportunities.</p>
        </div>
      </div>
    </div>
  );
}

export default Keyfeature;