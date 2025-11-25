
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
// CORS middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const principalRoutes = require('./routes/principalRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const formRoutes = require('./routes/formRoutes');
const chatRoutes = require("./routes/chat");
const reportRoutes = require('./routes/reportRoutes'); // Report Route
const { verify } = require('./controllers/authController'); // <-- Import this!
const clerkRoutes = require('./routes/clerkRoutes');
app.use('/api/clerk', clerkRoutes);


// Register routes
app.use('/api/clerk', clerkRoutes);
// Add this route for frontend compatibility!
app.get('/api/verify', verify);

// -- REGISTER EACH ROUTE ONLY ONCE! --
app.use('/api/admin', adminRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/principal', principalRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/report', reportRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
