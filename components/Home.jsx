import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Home.css";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const svgRef = useRef(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }

        // Verify token with backend
        const response = await axios.get("http://localhost:5000/protected", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  useEffect(() => {
    // Animation setup (same as your original)
    gsap.set([".svg-line", ".hero-section", ".h1", "#p"], { opacity: 0 });
    
    const tl = gsap.timeline();
    
    tl.to(".hero-section", { 
      opacity: 1, 
      y: 0, 
      duration: 0.8, 
      ease: "power2.out" 
    })
    .fromTo(".h1", 
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" },
      "-=0.4"
    )
    .fromTo("#p", 
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, ease: "elastic.out(1, 0.8)" },
      "-=0.2"
    )
    .fromTo(".feature-button",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
      "-=0.5"
    );

    gsap.fromTo(".feature-card",
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".features-section",
          start: "top center+=100",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-page">
      <nav className="navbar">
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/inventory">Inventory</Link>
          <Link to="/about">About</Link>
        </div>
        <div className="button">
          {!isLoggedIn ? (
            <>
              <button className="btn btn-primary">
                <Link id="in" to="/login">Log in</Link>
              </button>
              <button id="sign1" className="btn btn-primary">
                <Link id="up" to="/register">Register</Link>
              </button>
            </>
          ) : (
            <button id="logout" className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </nav>

      <div className="home-container">
        <section className="hero-section">
          <h1 className="h1">Welcome to <span id="smart"> SmartKitchen</span></h1>
          <p id="p">AI-Powered Smart Kitchen & Waste Minimizer for Restaurants</p>
          
          <Link to="/inventory" className="feature-button">Check Inventory</Link>
        </section>

        <section className="features-section">
          <div className="feature-card" id="f1">
            <h2>Inventory Management</h2>
            <p>Track your kitchen ingredients in real-time</p>
          </div>

          <div className="feature-card" id="f2">
            <h2>Smart Tracking</h2>
            <p>Get alerts when items are running low</p>
          </div>

          <div className="feature-card" id="f3">
            <h2>Recipe Suggestions</h2>
            <p>Discover recipes based on your available ingredients</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;