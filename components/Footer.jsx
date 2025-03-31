import React from "react";
import { 
  FaFacebook, 
  FaInstagram, 
  FaTwitter, 
  FaYoutube, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt 
} from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Column */}
        <div className="footer-section">
          <h3 className="brand-title">SmartKitchen</h3>
          <p className="brand-description">
            Transforming dining experiences with innovative solutions for restaurants and food lovers.
          </p>
          <div className="social-links">
            <a href="#"><FaFacebook size={20} /></a>
            <a href="#"><FaInstagram size={20} /></a>
            <a href="#"><FaTwitter size={20} /></a>
            <a href="#"><FaYoutube size={20} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4 className="footer-title">Quick Links</h4>
          <ul className="footer-links">
            <li><a href="#">Home</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Products</a></li>
            <li><a href="#">Solutions</a></li>
            <li><a href="#">Careers</a></li>
          </ul>
        </div>

        {/* Products */}
        <div className="footer-section">
          <h4 className="footer-title">Our Products</h4>
          <ul className="footer-links">
            <li><a href="#">POS System</a></li>
            <li><a href="#">Inventory Management</a></li>
            <li><a href="#">Online Ordering</a></li>
            <li><a href="#">Customer App</a></li>
            <li><a href="#">Analytics Dashboard</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h4 className="footer-title">Contact Us</h4>
          <div className="contact-info">
            <div className="contact-item">
              <FaMapMarkerAlt />
              <p>123 Business Park, Sector 22, Gandhinagar, Gujarat, India</p>
            </div>
            <div className="contact-item">
              <FaPhoneAlt />
              <a href="tel:+919876543210">+91 98765 43210</a>
            </div>
            <div className="contact-item">
              <FaEnvelope />
              <a href="mailto:info@smartkitchen.com">info@smartkitchen.com</a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} SmartKitchen. All rights reserved.</p>
        <div className="bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Sitemap</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;