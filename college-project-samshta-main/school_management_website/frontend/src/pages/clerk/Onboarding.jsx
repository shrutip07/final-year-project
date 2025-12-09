import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ChatWidget from "../../components/ChatWidget";

export default function ClerkOnboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [units, setUnits] = useState([]);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    qualification: "",
    joining_date: "",
    retirement_date: "",
    status: "active",
    address: "",
    gender: "",
    unit_id: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // redirect if no token
  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  // fetch units – same pattern as PrincipalOnboarding
  useEffect(() => {
    async function fetchUnits() {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/teacher/units",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUnits(res.data);
      } catch (err) {
        console.error("Failed to load units:", err);
        setUnits([]);
        setError(t("failed_load_units") || "Failed to load school units.");
      } finally {
        setLoading(false);
      }
    }
    fetchUnits();
    // eslint-disable-next-line
  }, [token, t]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (
      !form.full_name ||
      !form.unit_id ||
      !form.phone ||
      !form.email ||
      !form.qualification ||
      !form.address ||
      !form.gender
    ) {
      return setError(t("all_fields_required") || "All fields are required.");
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/clerk/onboard",
        { ...form },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        navigate("/clerk", { replace: true });
      } else {
        setError(t("onboarding_failed") || "Onboarding failed.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          t("onboarding_failed_default") ||
          "Failed to save details."
      );
    }
  }

  // Loading state (same shell as principal)
  if (loading) {
    return (
      <div className="principal-onboarding-page">
        <div className="onboarding-shell">
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">
                {t("loading") || "Loading"}...
              </span>
            </div>
          </div>
        </div>
        <ChatWidget />
      </div>
    );
  }

  return (
    <div className="principal-onboarding-page">
      <div className="onboarding-shell">
        {/* Back to Login */}
        <button
          type="button"
          className="back-to-login-btn"
          onClick={() => navigate("/")}
        >
          ← {t("back_to_login") || "Back to Login"}
        </button>

        {/* Header */}
        <header className="onboarding-header">
          <h1 className="onboarding-title">
            {t("clerk_onboarding_title") || "Clerk Onboarding"}
          </h1>
          <p className="onboarding-subtitle">
            {t("clerk_onboarding_subtitle") ||
              "Add your details so we can set up your clerk account."}
          </p>
        </header>

        {error && (
          <div className="alert alert-danger mb-3">{error}</div>
        )}

        {/* Card */}
        <div className="teacher-profile-card">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">{t("full_name")}</label>
                <input
                  className="form-control"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">{t("email")}</label>
                <input
                  className="form-control"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">{t("phone")}</label>
                <input
                  className="form-control"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">
                  {t("qualification")}
                </label>
                <input
                  className="form-control"
                  name="qualification"
                  value={form.qualification}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">
                  {t("joining_date") || "Joining Date"}
                </label>
                <input
                  className="form-control"
                  name="joining_date"
                  type="date"
                  value={form.joining_date}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label">
                  {t("retirement_date") || "Retirement Date"}
                </label>
                <input
                  className="form-control"
                  name="retirement_date"
                  type="date"
                  value={form.retirement_date}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label">
                  {t("address") || "Address"}
                </label>
                <input
                  className="form-control"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">
                  {t("gender") || "Gender"}
                </label>
                <input
                  className="form-control"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">
                  {t("status") || "Status"}
                </label>
                <select
                  className="form-select"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="active">
                    {t("active") || "Active"}
                  </option>
                  <option value="retired">
                    {t("retired") || "Retired"}
                  </option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">
                  {t("select_school") || "Select School/Unit"}
                </label>
                <select
                  className="form-select"
                  name="unit_id"
                  value={form.unit_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    {t("select_option") || "Select..."}
                  </option>
                  {units.map((unit) => (
                    <option
                      key={unit.unit_id}
                      value={unit.unit_id}
                    >
                      {unit.kendrashala_name || unit.unit_name} (
                      {unit.semis_no || unit.unit_id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions mt-4">
              <button
                type="submit"
                className="save-btn w-100"
              >
                {t("save") || "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
