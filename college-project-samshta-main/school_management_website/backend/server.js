const express = require('express');
const cors = require('cors');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const principalRoutes = require('./routes/principalRoutes');
const notificationRoutes = require("./routes/notificationRoutes"); // ✅ Fixed

const app = express();

app.use(cors());
app.use(express.json());
// ✅ Notification API before role-based routes
app.use("/api/notifications", notificationRoutes);

// ✅ Other API routes
// Auth, Admin, Teacher, Principal API
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/principal', principalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
