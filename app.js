const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabling for simpler local web frontend development with Tailwind CDN
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Basic health route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Mini AI LinkedIn API is running' });
});

// Import Routes
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

module.exports = app;
