import React, { useState } from "react";

export default function AdminUnitImport() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showFullFormat, setShowFullFormat] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setMessage("");
    setIsSuccess(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

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
      setIsSuccess(true);
      setFile(null);
      e.target.reset();
    } catch (err) {
      setMessage(err.message || "Failed to import units.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-import-container p-4">
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Bulk Data Import</h3>
        <p className="text-muted">Import multiple institutional units directly from your Excel files.</p>
      </div>

      {/* Main Card Container */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="row g-0">
          {/* Left Column: Upload */}
          <div className="col-lg-7 p-4 p-md-5">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                <i className="bi bi-file-earmark-spreadsheet text-primary fs-4"></i>
              </div>
              <div>
                <h5 className="mb-0 fw-bold">Import Units</h5>
                <p className="text-muted small mb-0">Select your prepared Excel file to begin</p>
              </div>
            </div>

            {message && (
              <div 
                className={`alert ${isSuccess ? "alert-success border-success-subtle" : "alert-danger border-danger-subtle"} d-flex align-items-center gap-2 py-3 rounded-3 mb-4`}
                role="alert"
              >
                <i className={`bi ${isSuccess ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
                <div className="small fw-medium">{message}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="upload-box p-4 border-2 border-dashed border-primary-subtle rounded-4 bg-light bg-opacity-50 mb-4 transition-all hover-shadow-sm">
                <label className="form-label d-block text-center mb-0 cursor-pointer">
                  <i className="bi bi-cloud-arrow-up text-primary fs-1 d-block mb-2"></i>
                  <span className="d-block fw-semibold text-dark">Click to upload or drag & drop</span>
                  <span className="d-block text-muted small">Only .xlsx or .xls files are supported</span>
                  <input
                    type="file"
                    className="d-none"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                  />
                </label>
                {file && (
                  <div className="mt-3 p-2 bg-white rounded-3 border d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2 overflow-hidden">
                      <i className="bi bi-file-earmark-excel text-success fs-5"></i>
                      <span className="text-truncate small fw-medium">{file.name}</span>
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-link btn-sm text-danger p-0"
                      onClick={() => setFile(null)}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                )}
              </div>

              <div className="d-flex align-items-center gap-3">
                <button
                  type="submit"
                  className="btn btn-primary px-5 py-2 fw-bold rounded-pill shadow-sm d-flex align-items-center gap-2"
                  disabled={loading || !file}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cloud-upload"></i>
                      <span>Import Units</span>
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary px-4 py-2 fw-semibold rounded-pill d-flex align-items-center gap-2"
                  onClick={() => alert("Sample template download triggered (UI only)")}
                >
                  <i className="bi bi-download"></i>
                  <span>Sample Template</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Instructions */}
          <div className="col-lg-5 p-4 p-md-5 bg-light border-start">
            <div className="instructions-container">
              <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-4">
                <i className="bi bi-info-circle-fill text-primary"></i>
                Import Instructions
              </h6>
              
              <div className="mb-4">
                <div className="d-flex gap-3 mb-3">
                  <div className="text-primary fw-bold">01</div>
                  <p className="small text-muted mb-0">Download the sample template to ensure correct column alignment.</p>
                </div>
                <div className="d-flex gap-3 mb-3">
                  <div className="text-primary fw-bold">02</div>
                  <p className="small text-muted mb-0">Fill in the unit details. Ensure <code className="text-primary">unit_id</code> and <code className="text-primary">semis_no</code> are unique.</p>
                </div>
                <div className="d-flex gap-3">
                  <div className="text-primary fw-bold">03</div>
                  <p className="small text-muted mb-0">Upload the completed file and click "Import Units" to process the data.</p>
                </div>
              </div>

              <div className="card border-0 bg-white p-3 rounded-3 shadow-sm mb-4">
                <p className="small fw-bold text-uppercase text-muted mb-3 letter-spacing-1" style={{ fontSize: '0.7rem' }}>Required Columns</p>
                <div className="d-flex flex-wrap gap-2">
                  {['unit_id', 'semis_no', 'kendrashala_name', 'headmistress_name', 'standard_range'].map(col => (
                    <span key={col} className="badge bg-light text-primary border-0 fw-medium px-2 py-1" style={{ fontSize: '0.75rem' }}>{col}</span>
                  ))}
                </div>
              </div>

              <button 
                type="button" 
                className="btn btn-link btn-sm p-0 text-decoration-none d-flex align-items-center gap-2 fw-bold"
                onClick={() => setShowFullFormat(!showFullFormat)}
              >
                <span>{showFullFormat ? 'Hide full format' : 'View full Excel format'}</span>
                <i className={`bi bi-chevron-${showFullFormat ? 'up' : 'down'}`}></i>
              </button>

              {showFullFormat && (
                <div className="mt-3 p-3 bg-white border rounded-3 small">
                  <div className="mb-3">
                    <p className="fw-bold text-dark mb-1">Required Headers:</p>
                    <code className="text-break bg-light p-2 d-block rounded border">
                      unit_id, semis_no, dcf_no, nmms_no, scholarship_code, first_grant_in_aid_year, type_of_management, school_jurisdiction, competent_authority_name, authority_number, authority_zone, kendrashala_name, info_authority_name, appellate_authority_name, midday_meal_org_name, midday_meal_org_contact, standard_range, headmistress_name, headmistress_phone, headmistress_email, school_shift
                    </code>
                  </div>
                  <div>
                    <p className="fw-bold text-dark mb-1">Optional Columns:</p>
                    <code className="text-break bg-light p-2 d-block rounded border text-muted">
                      budget_fiscal_year, budget_version, budget_income, budget_expenses, budget_surplus, case_description, bank_name, bank_purpose
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hover-shadow-sm:hover {
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          border-color: #0d6efd !important;
        }
        .letter-spacing-1 {
          letter-spacing: 0.05em;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .upload-box {
          transition: all 0.2s ease-in-out;
        }
      `}} />
    </div>
  );
}
