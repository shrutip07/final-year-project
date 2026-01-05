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

  const handleLangToggle = () => {
    const newLng = i18n.language === "en" ? "mr" : "en";
    i18n.changeLanguage(newLng);
    localStorage.setItem("appLanguage", newLng);
  };

  return (
    <div className="app-wrapper">
      <button className="lang-toggle" onClick={handleLangToggle}>
        <i className="fas fa-globe mr-2"></i>
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
        {/* Full background video */}
        <div className="background-video-container">
          <video autoPlay loop muted playsInline>
            <source src={sideVideo} type="video/mp4" />
          </video>
        </div>

        {/* Login Card */}
        <div className="login-section">
          <h2>{isRegister ? t("register") : t("login")}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <i className="fas fa-envelope input-icon"></i>
              <input
                type="email"
                placeholder={t("email")}
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                title={t("email_valid_title")}
              />
            </div>

            <div className="form-group">
              <i className="fas fa-lock input-icon"></i>
              <input
                type="password"
                placeholder={t("password")}
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                title={t("password_requirements")}
              />
            </div>

            {isRegister && (
              <div className="form-group">
                <i className="fas fa-user-tag input-icon"></i>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="teacher">{t("teacher")}</option>
                  <option value="admin">{t("admin")}</option>
                  <option value="principal">{t("principal")}</option>
                  <option value="clerk">{t("clerk")}</option>
                </select>
              </div>
            )}

            <button type="submit" className="login-button">
              {isRegister ? t("register") : t("login")}
            </button>

            {error && <div className="form-error"><i className="fas fa-exclamation-circle mr-2"></i> {error}</div>}
          </form>

          <div className="toggle-link-container">
            {isRegister ? t("already_have_account") : t("dont_have_account")}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? t("login") : t("register")}
            </button>
          </div>
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
            <p><strong>{t("mksss_name")}</strong></p>
            <p>{t("mksss_address")}</p>
            <p><i className="fas fa-phone mr-2"></i> {t("phone1")}</p>
            <p><i className="fas fa-phone mr-2"></i> {t("phone2")}</p>
            <p><i className="fas fa-hand-holding-heart mr-2"></i> {t("donation")}</p>
            <p><i className="fas fa-envelope mr-2"></i> {t("email")}</p>
            <div className="social-icons">
              <a href="https://www.facebook.com/maharshikarvestreeshikshansamsthapune/" target="_blank" rel="noreferrer">
                <i className="fa-brands fa-facebook"></i>
              </a>
              <a href="https://x.com/MKarveSamstha" target="_blank" rel="noreferrer">
                <i className="fa-brands fa-x-twitter"></i>
              </a>
              <a href="https://www.instagram.com/mkssspune/" target="_blank" rel="noreferrer">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="https://www.linkedin.com/in/mksss-pune-44bbb2157/" target="_blank" rel="noreferrer">
                <i className="fa-brands fa-linkedin"></i>
              </a>
              <a href="https://www.youtube.com/@mkssspune6029" target="_blank" rel="noreferrer">
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
