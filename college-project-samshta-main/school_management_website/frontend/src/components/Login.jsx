// src/components/Login.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./AuthForm.scss";
import loginIcon from "../assets/login-icon.png";

function Login() {
  const { setAuthData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "/api/login", // ✅ no localhost:4000",
        { email, password, role },
        { withCredentials: true }
      );

      setAuthData(res.data.accessToken, res.data.user);
      setMsg("Login successful");

      // Navigate based on role
      switch (role) {
        case "admin":
          navigate("/admin");
          break;
        case "teacher":
          navigate("/teacher");
          break;
        case "principal":
          navigate("/principal");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setMsg("Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      console.log("Attempting registration with:", { email, role }); // Debug log

      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          email,
          password,
          role,
        }
      );

      console.log("Registration response:", response.data); // Debug log

      localStorage.setItem("token", response.data.token);

      // Check if user needs to complete onboarding
      if (response.data.requiresOnboarding) {
        if (role === "teacher") {
          navigate("/teacher/onboarding");
        } else if (role === "principal") {
          navigate("/principal/onboarding");
        }
      } else {
        // Navigate based on role
        switch (role) {
          case "admin":
            navigate("/admin");
            break;
          case "teacher":
            navigate("/teacher");
            break;
          case "principal":
            navigate("/principal");
            break;
          default:
            navigate("/");
        }
      }
    } catch (err) {
      console.error("Registration error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-box">
      {/* Top Icon + Heading */}
      <img src={loginIcon} alt="Login Icon" className="auth-icon" />
      <h2>Login Here</h2>
      {/* Login Form */}

      <form onSubmit={handleLogin}>
        {/* Email Input*/}
        <div className="form-group">
          <i className="fas fa-user"></i>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password Input */}
        <div className="form-group">
          <i className="fas fa-lock"></i>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Login</button>
        {msg && <p className="form-msg">{msg}</p>}
      </form>
    </div>
  );
}

export default Login;
