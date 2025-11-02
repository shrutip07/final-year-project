const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const notificationController = require("../controllers/notificationController");

// Get notifications with role filter
router.get(
  "/",
  authenticateToken,
  notificationController.getNotifications
);

// Get principal-specific notifications
router.get(
  "/principal",
  authenticateToken,
  notificationController.getPrincipalNotifications
);

// Mark as read
router.put(
  "/:id/read",
  authenticateToken,
  notificationController.markAsRead
);

module.exports = router;
