import React, { useState } from "react";

export default function AdminUnitImport() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
      formData.append("file", file); // must match uploadExcel.single('file')

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
    <div className="admin-unit-import section-card mt-4">
      <div className="section-card__header">
        <h3 className="section-card__title">Import Units from Excel</h3>
      </div>

      <div className="section-card__body">
        {message && (
          <div className="alert alert-info py-2 mb-3">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row align-items-end">
            <div className="col-md-6 mb-3">
              <label className="form-label">Excel File (.xlsx or .xls)</label>
              <input
                type="file"
                className="form-control"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
            </div>
            <div className="col-md-3 mb-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Importing..." : "Import Units"}
              </button>
            </div>
          </div>

          <p className="text-muted" style={{ fontSize: "0.85rem" }}>
  The Excel sheet must use these exact column names in the header row
  (spelling and underscores must match exactly):
  <br />
  <strong>
    unit_id, semis_no, dcf_no, nmms_no, scholarship_code,
    first_grant_in_aid_year, type_of_management, school_jurisdiction,
    competent_authority_name, authority_number, authority_zone,
    kendrashala_name, info_authority_name, appellate_authority_name,
    midday_meal_org_name, midday_meal_org_contact, standard_range,
    headmistress_name, headmistress_phone, headmistress_email,
    school_shift
  </strong>
  .
  <br />
  Optional extra columns (also must match names exactly) to fill related
  tables:
  <br />
  <strong>
    budget_fiscal_year, budget_version, budget_income, budget_expenses,
    budget_surplus, case_description, bank_name, bank_purpose,
    payments_fiscal_year, payments_category, payments_amount
  </strong>
  .
</p>

        </form>
      </div>
    </div>
  );
}
