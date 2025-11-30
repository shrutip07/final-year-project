import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ChatWidget from "../../components/ChatWidget";
import "../teacher/Dashboard.scss";

export default function TeacherOnboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    qualification: "",
    designation: "",
    subject: "",
    unit_id: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/teacher/units", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnits(response.data);
        setLoading(false);
      } catch (err) {
        setError(t("failed_load_schools"));
        setLoading(false);
      }
    };
    fetchUnits();
    // eslint-disable-next-line
  }, [t]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.full_name || !form.unit_id || !form.phone || !form.email || !form.qualification || !form.designation || !form.subject) {
      return setError(t("all_fields_required"));
    }
    try {
      await axios.post(
        "http://localhost:5000/api/teacher/onboard",
        {
          ...form,
          staff_type: "teaching"
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      navigate("/teacher");
    } catch (err) {
      setError(err.response?.data?.message || t("onboarding_failed"));
    }
  };

  if (loading) {
    return (
      <>
        <div className="loading-state">{t("loading")}...</div>
        <ChatWidget />
      </>
    );
  }

  return (
    <div className="teacher-onboarding-page">
      <div className="teacher-main-content" style={{ maxWidth: 700, margin: "0 auto" }}>
      <div className="page-header">
        <h2>{t("complete_teacher_profile")}</h2>
      </div>
      {error && <div className="error-state">{error}</div>}
      <div className="teacher-profile-card">
        <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">{t("full_name")}</label>
          <input
            type="text"
            className="form-control"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">{t("email")}</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">{t("phone")}</label>
          <input
            type="tel"
            className="form-control"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            pattern="[0-9]{10}"
            title={t("valid_phone_title")}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">{t("qualification")}</label>
          <input
            type="text"
            className="form-control"
            name="qualification"
            value={form.qualification}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">{t("designation")}</label>
          <select
            className="form-select"
            name="designation"
            value={form.designation}
            onChange={handleChange}
            required
          >
            <option value="">{t("select_designation")}</option>
            <option value="Teacher">{t("designation_teacher")}</option>
            <option value="Senior Teacher">{t("designation_senior_teacher")}</option>
            <option value="Head Teacher">{t("designation_head_teacher")}</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">{t("subject")}</label>
          <input
            type="text"
            className="form-control"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">{t("select_school")}</label>
          <select
            className="form-select"
            name="unit_id"
            value={form.unit_id}
            onChange={handleChange}
            required
          >
            <option value="">{t("select_a_school")}</option>
            {units.map(unit => (
              <option key={unit.unit_id} value={unit.unit_id}>
                {unit.kendrashala_name} ({unit.semis_no})
              </option>
            ))}
          </select>
          {error && <div className="text-danger mt-1">{error}</div>}
        </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">
              {t("complete_registration")}
            </button>
          </div>
        </form>
      </div>
      </div>
      <ChatWidget />
    </div>
  );
}
