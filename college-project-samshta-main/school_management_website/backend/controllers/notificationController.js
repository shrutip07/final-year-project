

const pool = require("../config/db.js");

// Create notification
exports.createNotification = async (req, res) => {
  try {
    const { title, message, receiver_role, sender_role, receiver_id = null } = req.body;

    if (!title || !message || !receiver_role || !sender_role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO notifications (title, message, sender_role, receiver_role, receiver_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, message, sender_role, receiver_role, receiver_id]
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

// Get notifications for any role (with optional targeting by id)
exports.getNotifications = async (req, res) => {
  try {
    const { role } = req.query;
    const userId = req.user ? req.user.id : null;

    if (!role) {
      return res.status(400).json({ error: "Missing role query parameter" });
    }
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: user not found in request" });
    }

    const query = `
      SELECT * FROM notifications 
      WHERE receiver_role = $1 
      AND (receiver_id IS NULL OR receiver_id = $2)
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [role, userId]);
    return res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({
      message: 'Error fetching notifications',
      error: err.message
    });
  }
};

// Get principal notifications
exports.getPrincipalNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT * FROM notifications 
       WHERE (receiver_role = 'principal' AND (receiver_id = $1 OR receiver_id IS NULL))
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get teacher notifications
exports.getTeacherNotifications = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const result = await pool.query(
      `SELECT * FROM notifications 
       WHERE receiver_role = 'teacher' AND (receiver_id IS NULL OR receiver_id = $1)
       ORDER BY created_at DESC`,
      [teacherId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching teacher notifications:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Mark notification as read
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
