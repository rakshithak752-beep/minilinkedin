const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Start the server first, then attempt DB connection
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Attempt database connection (non-blocking)
connectDB().catch(err => {
  console.error('Failed to connect to database', err);
});
