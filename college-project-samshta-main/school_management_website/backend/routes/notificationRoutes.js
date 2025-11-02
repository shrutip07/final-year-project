/*const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createNotification,
  getNotifications,
  markAsRead,
} = require("../controllers/notificationController");

router.post("/", protect, createNotification);
router.get("/", protect, getNotifications);
router.patch("/:id/read", protect, markAsRead);

module.exports = router;*/
const express = require("express");
const router = express.Router();

const {
  createNotification,
  getNotifications,
  markAsRead,
} = require("../controllers/notificationController");

const { authenticateToken } = require("../middleware/auth");

// ✅ Admin: Send notification
router.post(
  "/send",
  authenticateToken,
  createNotification   // Admin check is inside controller or can be added later
);

// ✅ Logged-in user: fetch notifications
router.get(
  "/",
  authenticateToken,
  getNotifications
);

// ✅ Mark notification as read
router.put(
  "/:id/read",
  authenticateToken,
  markAsRead
);

module.exports = router;
