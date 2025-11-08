
// // // // const express = require('express');
// // // // const cors = require('cors');
// // // // require('dotenv').config();
// // // // const app = express();
// // // // const { verify } = require('./controllers/authController');
// // // // app.get('/api/verify', verify);

// // // // app.use(cors({
// // // //   origin: 'http://localhost:3000',
// // // //   credentials: true,
// // // //   allowedHeaders: ['Content-Type', 'Authorization']
// // // // }));
// // // // app.use(express.json());
// // // // const adminRoutes = require('./routes/adminRoutes');
// // // // const authRoutes = require('./routes/authRoutes');
// // // // const teacherRoutes = require('./routes/teacherRoutes');
// // // // const principalRoutes = require('./routes/principalRoutes');
// // // // const notificationRoutes = require("./routes/notificationRoutes"); // ✅ Fixed


// // // // const formRoutes = require('./routes/formRoutes');
// // // // app.use('/api/forms', formRoutes);

// // // // app.use(cors());
// // // // app.use(express.json());
// // // // // ✅ Notification API before role-based routes
// // // // app.use("/api/notifications", notificationRoutes);

// // // // // ✅ Other API routes
// // // // // Auth, Admin, Teacher, Principal API
// // // // app.use('/api/auth', authRoutes);
// // // // app.use('/api/admin', adminRoutes);
// // // // app.use('/api/teacher', teacherRoutes);
// // // // app.use('/api/principal', principalRoutes);

// // // // const PORT = process.env.PORT || 5000;
// // // // app.listen(PORT, () => {
// // // //   console.log(`🚀 Server running on port ${PORT}`);
// // // // });
// // // const express = require('express');
// // // const cors = require('cors');
// // // require('dotenv').config();
// // // const app = express();

// // // // CORS middleware should appear ONCE before everything else
// // // app.use(cors({
// // //   origin: 'http://localhost:3000',
// // //   credentials: true,
// // //   allowedHeaders: ['Content-Type', 'Authorization']
// // // }));
// // // app.use(express.json()); // This can come after CORS

// // // const adminRoutes = require('./routes/adminRoutes');
// // // const authRoutes = require('./routes/authRoutes');
// // // const teacherRoutes = require('./routes/teacherRoutes');
// // // const principalRoutes = require('./routes/principalRoutes');
// // // const notificationRoutes = require("./routes/notificationRoutes");
// // // const formRoutes = require('./routes/formRoutes');

// // // // All API routes as normal
// // // app.use('/api/forms', formRoutes);
// // // app.use("/api/notifications", notificationRoutes);
// // // app.use('/api/auth', authRoutes);
// // // app.use('/api/admin', adminRoutes);
// // // app.use('/api/teacher', teacherRoutes);
// // // app.use('/api/principal', principalRoutes);

// // // const PORT = process.env.PORT || 5000;
// // // app.listen(PORT, () => {
// // //   console.log(`🚀 Server running on port ${PORT}`);
// // // });

// // const express = require('express');
// // const cors = require('cors');
// // require('dotenv').config();
// // const app = express();

// // const adminRoutes = require('./routes/adminRoutes');
// // const authRoutes = require('./routes/authRoutes');
// // const teacherRoutes = require('./routes/teacherRoutes');
// // const principalRoutes = require('./routes/principalRoutes');
// // const notificationRoutes = require("./routes/notificationRoutes");
// // const formRoutes = require('./routes/formRoutes');
// // const { verify } = require('./controllers/authController'); // <-- Import this!

// // // CORS middleware - only ONCE, at the top
// // app.use(cors({
// //   origin: 'http://localhost:3000',
// //   credentials: true,
// //   allowedHeaders: ['Content-Type', 'Authorization']
// // }));
// // app.use(express.json());

// // // Add this route for frontend compatibility!
// // app.get('/api/verify', verify);

// // app.use('/api/forms', formRoutes);
// // app.use("/api/notifications", notificationRoutes);
// // app.use('/api/auth', authRoutes);
// // app.use('/api/admin', adminRoutes);
// // app.use('/api/teacher', teacherRoutes);
// // app.use('/api/principal', principalRoutes);

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running on port ${PORT}`);
// // });
// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();
// const app = express();

// const adminRoutes = require('./routes/adminRoutes');
// const authRoutes = require('./routes/authRoutes');
// const teacherRoutes = require('./routes/teacherRoutes');
// const principalRoutes = require('./routes/principalRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');
// const formRoutes = require('./routes/formRoutes');
// const { verify } = require('./controllers/authController'); // <-- Import this!

// // CORS middleware
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
// app.use(express.json());

// // Add this route for frontend compatibility!
// app.get('/api/verify', verify);
// app.use('/api/admin', require('./routes/adminRoutes'));

// app.use('/api/forms', formRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/teacher', teacherRoutes);
// app.use('/api/principal', principalRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const principalRoutes = require('./routes/principalRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const formRoutes = require('./routes/formRoutes');
const chatRoutes = require("./routes/chat");
const { verify } = require('./controllers/authController'); // <-- Import this!

// CORS middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
