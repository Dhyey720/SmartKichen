import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); // Store user info
      navigate("/");
      window.location.reload(); // Refresh to update UI
    } else {
      alert(data.error);
    }
  };
  

  return (
    <>
    <div className="login">
      <h1 className="loginh2">SmartKitchen</h1>
      <div className="logo">
        <img src="./images/cspit.webp" alt="" />
      </div>
      <div className="mainuser">
        <div className="limg">
          <img src="./images/LOGO.png" alt="" />
          <h2>Login</h2>
        </div>

      <form onSubmit={handleLogin} className="user">
        
        <input
          type="email"
          placeholder="Email"   //&#xf406;
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          />
        <button type="submit">Login</button>
      </form>
      <Link className="forgot" to="/forgot-password">Forgot Password</Link>
      <p>
        Don't have an account : <Link id="signup" to="/register">Sign Up</Link>
      </p>
      </div>
    </div>
  </>
  );
};

export default Login;