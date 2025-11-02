/*const pool = require("../config/db.js"); // ✅ ensure correct DB import

exports.createNotification = async (req, res) => {
  try {
    const { title, message, recipient_type } = req.body;

    // ✅ temporary response until DB logic added
    return res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: { title, message, recipient_type },
    });

  } catch (err) {
    console.error("Notification Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};*/
const pool = require("../config/db.js");

exports.createNotification = async (req, res) => {
  try {
    const { title, message, receiver_role, sender_role } = req.body;

    if (!title || !message || !receiver_role || !sender_role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO notifications (title, message, sender_role, receiver_role)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, message, sender_role, receiver_role]
    );

    return res.status(201).json({
      success: true,
      message: "Notification created successfully ✅",
      notification: result.rows[0],
    });
  } catch (err) {
    console.error("Error creating notification:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { role } = req.query;
    const userId = req.user.id;

    console.log('Fetching notifications:', { role, userId }); // Debug log

    const query = `
      SELECT * FROM notifications 
      WHERE receiver_role = $1 
      AND (receiver_id IS NULL OR receiver_id = $2)
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [role, userId]);
    
    console.log(`Found ${result.rows.length} notifications`); // Debug log

    return res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({
      message: 'Error fetching notifications',
      error: err.message
    });
  }
};

exports.getPrincipalNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from auth token

    const result = await pool.query(
      `SELECT * FROM notifications 
       WHERE (receiver_role = 'principal' AND (receiver_id = $1 OR receiver_id IS NULL))
       ORDER BY created_at DESC`,
      [userId]
    );

    console.log('Fetched notifications:', result.rows); // Debug log
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// ✅ Principal Notifications
/*exports.getPrincipalNotifications = async (req, res) => {
  try {
    const principalId = req.user.user_id;

    const result = await db.query(
      `SELECT * FROM notifications 
       WHERE receiver_role = 'principal'
       ORDER BY created_at DESC`,
      [principalId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Server error" });
  }
};*/






exports.getTeacherNotifications = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const result = await pool.query(
      "SELECT * FROM notifications WHERE recipient_role = 'teacher' ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching teacher notifications:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE id = $1`,
      [id]
    );

    return res.json({ success: true, message: "Marked as read ✅" });
  } catch (err) {
    console.error("Error marking read:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
