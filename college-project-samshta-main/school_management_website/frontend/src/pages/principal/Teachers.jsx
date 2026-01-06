import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import PrincipalLayout from "../../components/principal/PrincipalLayout";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import Toolbar from "../../components/admin/Toolbar";
import EmptyState from "../../components/admin/EmptyState";
import ChatWidget from "../../components/ChatWidget";

export default function Teachers({ isSubComponent = false }) {
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

  const content = (
    <div className={isSubComponent ? "" : "p-4"}>
      {loading ? (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <div className="spinner-grow text-primary" role="status"></div>
          <span className="mt-3 text-muted fw-bold">Syncing Staff Directory...</span>
        </div>
      ) : error ? (
        <div className="alert alert-danger shadow-sm border-0 d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
          <div>{error}</div>
        </div>
      ) : (
        <AdminCard 
          header={
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-people-fill text-primary fs-4"></i>
              <span className="fw-bold">Teaching & Administrative Staff</span>
            </div>
          }
          className="shadow-sm border-0"
        >
          <TableContainer
            toolbar={
              <Toolbar
                left={
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-search text-muted"></i>
                    <input
                      type="text"
                      className="form-control form-control-sm border-0 bg-light"
                      placeholder="Search by name, ID, email, or subject..."
                      value={search}
                      onChange={handleSearchChange}
                      style={{ minWidth: '350px', fontWeight: '500' }}
                    />
                  </div>
                }
              />
            }
          >
            {filtered.length === 0 ? (
              <EmptyState
                title={t("no_teachers") || "No teachers"}
                description={t("no_teachers_found") || "No teachers match your search."}
              />
            ) : (
              <div className="table-responsive professional-table">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th className="text-uppercase small fw-bold text-muted">Staff ID</th>
                      <th className="text-uppercase small fw-bold text-muted">Full Name</th>
                      <th className="text-uppercase small fw-bold text-muted">Contact Info</th>
                      <th className="text-uppercase small fw-bold text-muted">Credentials</th>
                      <th className="text-uppercase small fw-bold text-muted">Role & Subject</th>
                      <th className="text-uppercase small fw-bold text-muted">Joining Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((teacher) => (
                      <tr key={teacher.staff_id}>
                        <td>
                          <span className="fw-bold text-dark">#{teacher.staff_id}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="avatar-circle shadow-sm" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                              {teacher.full_name ? teacher.full_name.charAt(0).toUpperCase() : "T"}
                            </div>
                            <span className="fw-semibold text-dark">{teacher.full_name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-column">
                            <a href={`mailto:${teacher.email}`} className="text-primary small text-decoration-none fw-medium">
                              <i className="bi bi-envelope me-1"></i>
                              {teacher.email}
                            </a>
                            <span className="text-muted small mt-1">
                              <i className="bi bi-telephone me-1"></i>
                              {teacher.phone || "-"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="erp-badge badge-qualification px-2 py-1">
                            {teacher.qualification || "-"}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <span className="badge bg-primary-subtle text-primary border-0 text-start" style={{ width: 'fit-content' }}>
                              {teacher.designation || "-"}
                            </span>
                            <span className="badge bg-light text-muted border text-start" style={{ width: 'fit-content' }}>
                              {teacher.subject || "General"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="text-muted small fw-medium">
                            {teacher.joining_date
                              ? new Date(teacher.joining_date).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TableContainer>
        </AdminCard>
      )}
    </div>
  );

  if (isSubComponent) {
    return content;
  }

  return (
    <PrincipalLayout activeSidebarTab="teachers">
      {content}
      <ChatWidget />
    </PrincipalLayout>
  );
}

