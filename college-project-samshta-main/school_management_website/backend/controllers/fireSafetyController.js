const pool = require('../config/db');

exports.getFireSafetyInfo = async (req, res) => {
  const userId = req.user.id;
  const { rows: unitRows } = await pool.query('SELECT unit_id FROM clerks WHERE user_id = $1', [userId]);
  const unit_id = unitRows[0]?.unit_id;
  if (!unit_id) return res.status(404).json({ error: "No unit assigned" });

  // Get fire safety settings
  const { rows: safetyRows } = await pool.query('SELECT * FROM fire_safety WHERE unit_id = $1', [unit_id]);
  // Last drill, drills count, and participation
  // Fetch only drills in last 12 months for the current unit
const drills = await pool.query(
  `SELECT * FROM fire_drill 
   WHERE unit_id = $1 AND drill_date >= NOW() - INTERVAL '12 months'
   ORDER BY drill_date DESC`,
  [unit_id]
);

  const lastDrill = drills.rows[0];
  res.json({
    safety: safetyRows[0] || null,
    lastDrill: lastDrill || null,
    totalDrills: drills.rowCount,
    allDrills: drills.rows
  });
};

exports.updateFireSafetyInfo = async (req, res) => {
  const userId = req.user.id;
  const { rows: unitRows } = await pool.query('SELECT unit_id FROM clerks WHERE user_id = $1', [userId]);
  const unit_id = unitRows[0]?.unit_id;
  if (!unit_id) return res.status(404).json({ error: "No unit assigned" });
  const { extinguisher_count, extinguisher_locations, extinguisher_last_inspection,
          evacuation_routes_marked, assembly_points } = req.body;

  // Upsert fire safety info for this unit
  const { rows } = await pool.query(
    `INSERT INTO fire_safety (unit_id, extinguisher_count, extinguisher_locations, extinguisher_last_inspection, evacuation_routes_marked, assembly_points, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        ON CONFLICT (unit_id)
        DO UPDATE SET
          extinguisher_count = $2,
          extinguisher_locations = $3,
          extinguisher_last_inspection = $4,
          evacuation_routes_marked = $5,
          assembly_points = $6,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *`,
    [unit_id, extinguisher_count, extinguisher_locations, extinguisher_last_inspection, evacuation_routes_marked, assembly_points]
  );
  res.json(rows[0]);
};

exports.addFireDrill = async (req, res) => {
  const userId = req.user.id;
  const { rows: unitRows } = await pool.query('SELECT unit_id FROM clerks WHERE user_id = $1', [userId]);
  const unit_id = unitRows[0]?.unit_id;
  if (!unit_id) return res.status(404).json({ error: "No unit assigned" });
  const { drill_date, participants_students, participants_staff, evacuation_time_seconds } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO fire_drill (unit_id, drill_date, participants_students, participants_staff, evacuation_time_seconds)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [unit_id, drill_date, participants_students, participants_staff, evacuation_time_seconds]
  );
  res.status(201).json(rows[0]);
};
