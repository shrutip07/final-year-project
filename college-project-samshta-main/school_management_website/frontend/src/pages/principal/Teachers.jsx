import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

import EmptyState from "../../components/admin/EmptyState";

export default function Teachers() {
  const { t } = useTranslation();
  const [teachers, setTeachers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/principal/teachers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTeachers(response.data || []);
        setFiltered(response.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || t("failed_load_teachers")
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  function handleSearchChange(e) {
    const val = e.target.value.toLowerCase();
    setSearch(e.target.value);

    setFiltered(
      teachers.filter(
        (te) =>
          te.full_name?.toLowerCase().includes(val) ||
          (te.email && te.email.toLowerCase().includes(val)) ||
          (te.subject && te.subject.toLowerCase().includes(val)) ||
          (te.designation &&
            te.designation.toLowerCase().includes(val)) ||
          (te.phone && te.phone.toLowerCase().includes(val)) ||
          (te.staff_id && te.staff_id.toString().includes(val))
      )
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t("loading")}...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger mt-3">{error}</div>;
  }

  return (
    <div className="directory-wrapper">
      <div className="directory-controls">
        <div className="search-box">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, ID, email, or subject..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="table-container">
        {filtered.length === 0 ? (
          <EmptyState
            title={t("no_teachers") || "No teachers"}
            description={t("no_teachers_found") || "No teachers match your search."}
          />
        ) : (
          <div className="custom-table-wrapper">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Qualification</th>
                  <th>Designation</th>
                  <th>Subject</th>
                  <th>Joining Date</th>
                  <th>Updated At</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((teacher) => (
                  <tr key={teacher.staff_id}>
                    <td className="fw-bold text-primary">#{teacher.staff_id}</td>
                    <td className="fw-semibold">{teacher.full_name}</td>
                    <td>
                      <a href={`mailto:${teacher.email}`} className="email-link">
                        {teacher.email}
                      </a>
                    </td>
                    <td className="text-muted">{teacher.phone || "-"}</td>
                    <td>
                      <span className="badge badge-qualification">
                        {teacher.qualification || "-"}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-designation">
                        {teacher.designation || "-"}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-subject">
                        {teacher.subject || "-"}
                      </span>
                    </td>
                    <td className="text-muted small">
                      {teacher.joining_date
                        ? new Date(teacher.joining_date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="text-muted small">
                      {teacher.updated_at
                        ? new Date(teacher.updated_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
