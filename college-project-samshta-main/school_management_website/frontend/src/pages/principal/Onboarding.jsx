import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ChatWidget from "../../components/ChatWidget";

export default function PrincipalOnboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [units, setUnits] = useState([]);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    qualification: "",
    unit_id: "",
    joining_date: "",
    tenure_start_date: "",
    tenure_end_date: "",
    status: "active",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // redirect if no token
  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  // fetch units
  useEffect(() => {
    async function fetchUnits() {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/teacher/units",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUnits(res.data);
      } catch {
        setUnits([]);
        setError(t("failed_load_units"));
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
      !form.qualification
    ) {
      return setError(t("all_fields_required"));
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/principal/onboard",
        { ...form },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        navigate("/principal", { replace: true });
      } else {
        setError(t("onboarding_failed"));
      }
    } catch (err) {
      setError(
        err.response?.data?.message || t("onboarding_failed_default")
      );
    }
  }

  if (loading) {
    return (
      <div className="principal-onboarding-page">
        <div className="onboarding-shell">
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">
                {t("loading")}...
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
            {"Principal Onboarding"}
          </h1>
          <p className="onboarding-subtitle">
            {              "Add your details so we can set up your principal account."}
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
                  {t("select_school")}
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

              <div className="col-12">
                <label className="form-label">
                  {t("joining_date")}
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
                  {t("tenure_start_date")}
                </label>
                <input
                  className="form-control"
                  name="tenure_start_date"
                  type="date"
                  value={form.tenure_start_date}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label">
                  {t("tenure_end_date")}
                </label>
                <input
                  className="form-control"
                  name="tenure_end_date"
                  type="date"
                  value={form.tenure_end_date}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label">
                  {t("status")}
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
                  <option value="on-leave">
                    {t("on_leave") || "On Leave"}
                  </option>
                </select>
              </div>
            </div>

            <div className="form-actions mt-4">
              <button
                type="submit"
                className="save-btn w-100"
              >
                {t("submit") || "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
