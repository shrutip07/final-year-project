import React, { useState } from "react";

export default function AdminUnitImport() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showFullFormat, setShowFullFormat] = useState(false);

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (!file) {
      setMessage("Please select an Excel file (.xlsx or .xls).");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:5000/api/units/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        let msg = data.message || "Failed to import units.";
        if (Array.isArray(data.missingHeaders) && data.missingHeaders.length) {
          msg += " Missing headers: " + data.missingHeaders.join(", ");
        }
        throw new Error(msg);
      }

      setMessage(
        data.importedCount != null
          ? `Imported ${data.importedCount} unit(s) successfully.`
          : "Units imported successfully."
      );
      setFile(null);
      e.target.reset();
    } catch (err) {
      setMessage(err.message || "Failed to import units.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-import-container mb-5">
      <div className="admin-import-card">
        <div className="row g-0">
          {/* Left Column: Upload */}
          <div className="col-lg-7 p-4 border-end">
            <div className="d-flex align-items-center gap-2 mb-4">
              <div className="import-icon-box">
                <i className="bi bi-file-earmark-spreadsheet-fill text-primary"></i>
              </div>
              <div>
                <h4 className="mb-0 fw-bold">Import Units from Excel</h4>
                <p className="text-muted small mb-0">Bulk upload your institutional data efficiently</p>
              </div>
            </div>

            {message && (
              <div className={`alert ${message.includes("successfully") ? "alert-success" : "alert-info"} py-2 mb-4 d-flex align-items-center gap-2`}>
                <i className={`bi ${message.includes("successfully") ? "bi-check-circle-fill" : "bi-info-circle-fill"}`}></i>
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="upload-zone mb-4">
                <label className="form-label fw-semibold text-dark mb-2">Select Excel File (.xlsx or .xls)</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-upload text-muted"></i>
                  </span>
                  <input
                    type="file"
                    className="form-control border-start-0 ps-0"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <button
                  type="submit"
                  className="btn btn-primary px-4 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cloud-arrow-up-fill"></i>
                      <span>Import Units</span>
                    </>
                  )}
                </button>
                <button type="button" className="btn btn-outline-secondary px-3 py-2 fw-semibold d-flex align-items-center gap-2">
                  <i className="bi bi-download"></i>
                  <span>Sample Template</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Instructions */}
          <div className="col-lg-5 p-4 bg-light-subtle">
            <div className="instructions-box">
              <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-info-circle-fill text-info"></i>
                Quick Guide
              </h6>
              
              <ul className="instruction-list mb-4">
                <li>Ensure column names match the required format exactly.</li>
                <li>Avoid empty rows or merged cells in your Excel sheet.</li>
                <li>The first row must contain the headers listed below.</li>
              </ul>

              <div className="requirement-summary mb-3">
                <p className="small fw-bold text-muted mb-2 text-uppercase letter-spacing-1">Important Headers</p>
                <div className="d-flex flex-wrap gap-2">
                  {['unit_id', 'semis_no', 'kendrashala_name', 'headmistress_name', 'standard_range'].map(col => (
                    <span key={col} className="badge bg-white border text-dark fw-normal">{col}</span>
                  ))}
                </div>
              </div>

              <button 
                type="button" 
                className="btn btn-link btn-sm p-0 text-decoration-none d-flex align-items-center gap-1"
                onClick={() => setShowFullFormat(!showFullFormat)}
              >
                <span>{showFullFormat ? 'Hide full format' : 'View full Excel format'}</span>
                <i className={`bi bi-chevron-${showFullFormat ? 'up' : 'down'}`}></i>
              </button>

              {showFullFormat && (
                <div className="full-format-details mt-3 p-3 bg-white border rounded shadow-sm">
                  <p className="x-small text-muted mb-2">Required Columns (Must match exactly):</p>
                  <code className="d-block small text-break mb-3">
                    unit_id, semis_no, dcf_no, nmms_no, scholarship_code, first_grant_in_aid_year, type_of_management, school_jurisdiction, competent_authority_name, authority_number, authority_zone, kendrashala_name, info_authority_name, appellate_authority_name, midday_meal_org_name, midday_meal_org_contact, standard_range, headmistress_name, headmistress_phone, headmistress_email, school_shift
                  </code>
                  <p className="x-small text-muted mb-2">Optional Related Columns:</p>
                  <code className="d-block small text-break">
                    budget_fiscal_year, budget_version, budget_income, budget_expenses, budget_surplus, case_description, bank_name, bank_purpose, payments_fiscal_year, payments_category, payments_amount
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
