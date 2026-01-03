// controllers/unitImportController.js
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

const normalizeShift = (value) => {
  if (!value) return null;
  const v = String(value).trim().toLowerCase();
  if (v === "morning") return "morning";
  if (v === "afternoon") return "afternoon";
  return v; // fallback; will still be checked by constraint
};

const normalizeBudgetVersion = (value) => {
  if (!value) return null;
  const v = String(value).trim().toLowerCase();
  if (v === "v1" || v === "1" || v === "version 1" || v === "original") return "original";
  if (v === "v2" || v === "2" || v === "version 2" || v === "revised") return "revised";
  return null; // will skip budget insert if invalid
};

exports.importUnits = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const filePath = req.file.path;

  let client;
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rows.length) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    // ---- HEADER VALIDATION ----
    const requiredHeaders = [
      "unit_id",
      "semis_no",
      "dcf_no",
      "nmms_no",
      "scholarship_code",
      "first_grant_in_aid_year",
      "type_of_management",
      "school_jurisdiction",
      "competent_authority_name",
      "authority_number",
      "authority_zone",
      "kendrashala_name",
      "info_authority_name",
      "appellate_authority_name",
      "midday_meal_org_name",
      "midday_meal_org_contact",
      "standard_range",
      "headmistress_name",
      "headmistress_phone",
      "headmistress_email",
      "school_shift"
    ];

    const rowKeys = Object.keys(rows[0] || {});
    const missingHeaders = requiredHeaders.filter(
      (h) => !rowKeys.includes(h)
    );
    if (missingHeaders.length > 0) {
      return res.status(400).json({
        message: "Excel headers are invalid.",
        missingHeaders
      });
    }

    console.log("First UNIT row from Excel:", rows[0]);

    client = await pool.connect();
    await client.query("BEGIN");

    let importedCount = 0;

    for (const row of rows) {
      console.log("UNIT row:", row);

      const {
        // unit table
        unit_id,
        semis_no,
        dcf_no,
        nmms_no,
        scholarship_code,
        first_grant_in_aid_year,
        type_of_management,
        school_jurisdiction,
        competent_authority_name,
        authority_number,
        authority_zone,
        kendrashala_name,
        info_authority_name,
        appellate_authority_name,
        midday_meal_org_name,
        midday_meal_org_contact,
        standard_range,
        headmistress_name,
        headmistress_phone,
        headmistress_email,
        school_shift,

        // budget-related columns
        budget_fiscal_year,
        budget_version,
        budget_income,
        budget_expenses,
        budget_surplus,

        // case-related
        case_description,

        // bank-related
        bank_name,
        bank_purpose,

        // payments-related
        payments_fiscal_year,
        payments_category,
        payments_amount
      } = row;

      // basic required validation for unit itself
      if (!unit_id || !semis_no) {
        // you can tighten this later
        continue;
      }

      // ---- Insert into unit ----
      await client.query(
        `INSERT INTO unit
         (unit_id, semis_no, dcf_no, nmms_no, scholarship_code,
          first_grant_in_aid_year, type_of_management, school_jurisdiction,
          competent_authority_name, authority_number, authority_zone,
          kendrashala_name, info_authority_name, appellate_authority_name,
          midday_meal_org_name, midday_meal_org_contact, standard_range,
          headmistress_name, headmistress_phone, headmistress_email, school_shift)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
         ON CONFLICT (unit_id) DO UPDATE SET
           semis_no = EXCLUDED.semis_no,
           dcf_no = EXCLUDED.dcf_no,
           nmms_no = EXCLUDED.nmms_no,
           scholarship_code = EXCLUDED.scholarship_code,
           first_grant_in_aid_year = EXCLUDED.first_grant_in_aid_year,
           type_of_management = EXCLUDED.type_of_management,
           school_jurisdiction = EXCLUDED.school_jurisdiction,
           competent_authority_name = EXCLUDED.competent_authority_name,
           authority_number = EXCLUDED.authority_number,
           authority_zone = EXCLUDED.authority_zone,
           kendrashala_name = EXCLUDED.kendrashala_name,
           info_authority_name = EXCLUDED.info_authority_name,
           appellate_authority_name = EXCLUDED.appellate_authority_name,
           midday_meal_org_name = EXCLUDED.midday_meal_org_name,
           midday_meal_org_contact = EXCLUDED.midday_meal_org_contact,
           standard_range = EXCLUDED.standard_range,
           headmistress_name = EXCLUDED.headmistress_name,
           headmistress_phone = EXCLUDED.headmistress_phone,
           headmistress_email = EXCLUDED.headmistress_email,
           school_shift = EXCLUDED.school_shift`,
        [
          Number(unit_id),
          String(semis_no).trim(),
          dcf_no ? String(dcf_no).trim() : null,
          nmms_no ? String(nmms_no).trim() : null,
          scholarship_code ? String(scholarship_code).trim() : null,
          first_grant_in_aid_year || null,
          type_of_management ? String(type_of_management).trim() : null,
          school_jurisdiction ? String(school_jurisdiction).trim() : null,
          competent_authority_name
            ? String(competent_authority_name).trim()
            : null,
          authority_number ? String(authority_number).trim() : null,
          authority_zone ? String(authority_zone).trim() : null,
          kendrashala_name ? String(kendrashala_name).trim() : null,
          info_authority_name ? String(info_authority_name).trim() : null,
          appellate_authority_name
            ? String(appellate_authority_name).trim()
            : null,
          midday_meal_org_name
            ? String(midday_meal_org_name).trim()
            : null,
          midday_meal_org_contact
            ? String(midday_meal_org_contact).trim()
            : null,
          standard_range ? String(standard_range).trim() : null,
          headmistress_name ? String(headmistress_name).trim() : null,
          headmistress_phone ? String(headmistress_phone).trim() : null,
          headmistress_email ? String(headmistress_email).trim() : null,
          school_shift ? normalizeShift(school_shift) : null
        ]
      );

      // ---- Insert into unit_budgets (optional) ----
      const hasBudget =
        budget_fiscal_year !== "" ||
        budget_version !== "" ||
        budget_income !== "" ||
        budget_expenses !== "" ||
        budget_surplus !== "";

      if (hasBudget) {
        await client.query(
          `INSERT INTO unit_budgets
           (unit_id, fiscal_year, version, income, expenses, surplus)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            Number(unit_id),
            budget_fiscal_year ? String(budget_fiscal_year).trim() : null,
            normalizeBudgetVersion(budget_version),
            budget_income !== "" && budget_income !== null
              ? Number(budget_income)
              : null,
            budget_expenses !== "" && budget_expenses !== null
              ? Number(budget_expenses)
              : null,
            budget_surplus !== "" && budget_surplus !== null
              ? Number(budget_surplus)
              : null
          ]
        );
      }

      // ---- Insert into unit_cases (optional) ----
      if (case_description && String(case_description).trim() !== "") {
        await client.query(
          `INSERT INTO unit_cases (unit_id, description) VALUES ($1,$2)`,
          [Number(unit_id), String(case_description).trim()]
        );
      }

      // ---- Insert into unit_banks (optional) ----
      const hasBank = bank_name || bank_purpose;
      if (hasBank) {
        await client.query(
          `INSERT INTO unit_banks (unit_id, bank_name, bank_purpose)
           VALUES ($1,$2,$3)`,
          [
            Number(unit_id),
            bank_name ? String(bank_name).trim() : null,
            bank_purpose ? String(bank_purpose).trim() : null
          ]
        );
      }

      // ---- Insert into unit_payments (optional) ----
      const hasPayment =
        payments_fiscal_year !== "" ||
        payments_category !== "" ||
        payments_amount !== "";
      if (hasPayment) {
        await client.query(
          `INSERT INTO unit_payments
           (unit_id, fiscal_year, category, amount)
           VALUES ($1,$2,$3,$4)`,
          [
            Number(unit_id),
            payments_fiscal_year
              ? String(payments_fiscal_year).trim()
              : null,
            payments_category ? String(payments_category).trim() : null,
            payments_amount !== "" && payments_amount !== null
              ? Number(payments_amount)
              : null
          ]
        );
      }

      importedCount += 1;
    }

    await client.query("COMMIT");

    res.json({
      message: "Units imported successfully",
      importedCount
    });
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({
      message: "Error importing units",
      error: err.message
    });
  } finally {
    if (client) client.release();
    fs.unlink(filePath, () => {});
  }
};
