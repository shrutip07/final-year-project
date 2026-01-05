import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

// reuse admin UI building blocks
import AdminCard from "../../components/admin/AdminCard";
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
          te.full_name.toLowerCase().includes(val) ||
          (te.email && te.email.toLowerCase().includes(val)) ||
          (te.subject && te.subject.toLowerCase().includes(val)) ||
          (te.designation &&
            te.designation.toLowerCase().includes(val)) ||
          (te.phone && te.phone.toLowerCase().includes(val))
      )
    );
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">
            {t("loading_teachers")}...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger mt-3">{error}</div>;
  }

  return (
    // parent (PrincipalDashboard) already provides .page-inner + PageHeader
    <AdminCard
      header={t("teachers_directory")}
      className="section-card section-card--table"
    >
      {/* Search toolbar */}
      <div className="table-toolbar">
        <div className="toolbar-search" style={{ maxWidth: 420 }}>
          <input
            className="form-control"
            placeholder={
              t("search_by_teacher_details") ||
              "Search by name, email, phone, subject, or designation"
            }
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title={t("no_teachers") || "No teachers"}
          description={
            t("no_teachers_found") || "No teachers match your search."
          }
        />
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>{t("full_name")}</th>
                <th>{t("email")}</th>
                <th>{t("phone")}</th>
                <th>{t("qualification")}</th>
                <th>{t("designation")}</th>
                <th>{t("subject")}</th>
                <th>{t("joining_date")}</th>
                <th>{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((teacher) => (
                <tr key={teacher.staff_id}>
                  <td>{teacher.full_name}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.phone || "-"}</td>
                  <td>{teacher.qualification || "-"}</td>
                  <td>{teacher.designation || "-"}</td>
                  <td>{teacher.subject || "-"}</td>
                  <td>
                    {teacher.joining_date
                      ? new Date(
                          teacher.joining_date
                        ).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        teacher.status === "active"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {t(teacher.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminCard>
  );
}
