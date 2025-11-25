import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import mksssLogo from "../assets/mksss-logo.png";
import sideVideo from "../assets/background.mp4";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../App.scss";
import ChatWidget from "../components/ChatWidget";

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("http://localhost:5000/api/verify", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.valid) {
          handleRedirect(token);
        } else {
          localStorage.removeItem("token");
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
      });
    // eslint-disable-next-line
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // ✅ Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError(t("please_valid_email"));
      return;
    }

    // ✅ Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(t("password_requirements"));
      return;
    }

    try {
      if (isRegister) {
        // Register user
        const registerRes = await axios.post(
          "http://localhost:5000/api/auth/register",
          {
            email,
            password,
            role,
          }
        );

        const token = registerRes.data.token;
        localStorage.setItem("token", token);

        if (role === "teacher") {
          navigate("/teacher/onboarding");
        } else {
          handleRedirect(token);
        }
      } else {
        // Login
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email,
          password,
        });

        const token = res.data.token;
        localStorage.setItem("token", token);
        handleRedirect(token);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError(t("user_exists"));
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            t("something_wrong")
        );
      }
    }
  }

  function handleRedirect(token) {
    try {
      const decoded = jwtDecode(token);
      if (decoded.role === "admin") navigate("/admin");
      else if (decoded.role === "principal") navigate("/principal");
      else if (decoded.role === "teacher") navigate("/teacher");
      else if (decoded.role === "clerk") navigate("/clerk");
      else navigate("/");
    } catch {
      navigate("/");
    }
  }

  // Toggle language between English and Marathi
 const handleLangToggle = () => {
  const newLng = i18n.language === "en" ? "mr" : "en";
  i18n.changeLanguage(newLng);
  localStorage.setItem("appLanguage", newLng);
};


  return (
    <div className="app-wrapper">
      {/* Language toggle button */}
      <button
        onClick={handleLangToggle}
        style={{ position: "absolute", top: 10, right: 10, zIndex: 1000 }}
      >
        {i18n.language === "en" ? "मराठी" : "English"}
      </button>

      {/* ===== HEADER ===== */}
      <header className="top-bar">
        <div className="logo-title">
          <img src={mksssLogo} alt="MKSSS Logo" className="logo" />
          <h1 className="org-name">
            Maharshi Karve Stree Shikshan Samstha (MKSSS)
          </h1>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-section">
        {/* Left: Login/Signup Form */}
        <div className="login-section">
          <h2>{isRegister ? t("register") : t("login")}</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder={t("email")}
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", margin: "8px 0", padding: "8px" }}
              pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
              title={t("email_valid_title")}
            />

            <input
              type="password"
              placeholder={t("password")}
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", margin: "8px 0", padding: "8px" }}
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
              title={t("password_requirements")}
            />

            {isRegister && (
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: "100%", margin: "8px 0", padding: "8px" }}
              >
                <option value="teacher">{t("teacher")}</option>
                <option value="admin">{t("admin")}</option>
                <option value="principal">{t("principal")}</option>
                 <option value="clerk">{t("clerk")}</option> 
              </select>
            )}

            <button type="submit" style={{ width: "100%", padding: "8px" }}>
              {isRegister ? t("register") : t("login")}
            </button>

            {error && <div style={{ color: "red", marginTop: "8px" }}>{error}</div>}
          </form>

          <div style={{ marginTop: 12, textAlign: "center" }}>
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              style={{
                background: "none",
                color: "blue",
                border: "none",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              {isRegister
                ? t("already_have_account")
                : t("dont_have_account")}
            </button>
          </div>
        </div>

        {/* Right: Video */}
        <div className="side-video">
          <video autoPlay loop muted playsInline>
            <source src={sideVideo} type="video/mp4" />
            {t("video_not_supported")}
          </video>
        </div>
      </main>

      {/* ===== ORG INFO ===== */}
      <section className="org-info">
        <p>{t("org_info_text")}</p>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-columns">
          <div>
            <h4>{t("important_links")}</h4>
            <ul>
              <li>{t("home")}</li>
              <li>{t("founder")}</li>
              <li>{t("history")}</li>
              <li>{t("secretary_desk")}</li>
              <li>{t("mksss_at_glance")}</li>
            </ul>
          </div>
          <div>
            <h4>{t("quick_links")}</h4>
            <ul>
              <li>{t("management_committee")}</li>
              <li>{t("higher_education")}</li>
              <li>{t("school_education")}</li>
              <li>{t("teachers_training")}</li>
              <li>{t("skill_development")}</li>
            </ul>
          </div>
          <div>
            <h4>{t("contact_us")}</h4>
            <p>{t("mksss_name")}</p>
            <p>{t("mksss_address")}</p>
            <p>{t("phone1")}</p>
            <p>{t("phone2")}</p>
            <p>{t("donation")}</p>
            <p>{t("email")}</p>
            <div className="social-icons">
              <a href="https://www.facebook.com/maharshikarvestreeshikshansamsthapune/">
                <i className="fa-brands fa-facebook"></i>
              </a>
              <a href="https://x.com/MKarveSamstha">
                <i className="fa-brands fa-x-twitter"></i>
              </a>
              <a href="https://www.instagram.com/mkssspune/">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="https://www.linkedin.com/in/mksss-pune-44bbb2157/">
                <i className="fa-brands fa-linkedin"></i>
              </a>
              <a href="https://www.youtube.com/@mkssspune6029">
                <i className="fa-brands fa-youtube"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          {t("copyright")}
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}
