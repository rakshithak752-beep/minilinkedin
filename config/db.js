const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
      console.warn('MONGODB_URI is not defined or invalid. Skipping database connection. Set a valid MongoDB URI to enable database features.');
      return;
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.warn('Server will continue without database. API features requiring DB will not work.');
  }
};

module.exports = connectDB;
