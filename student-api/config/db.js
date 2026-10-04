/**
 * MongoDB Atlas Connection Configuration
 * Uses Mongoose driver with IPv4 preference & error details
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  const connStr = process.env.MONGODB_URI;

  try {
    const targetUri = connStr || 'mongodb://127.0.0.1:27017/student_db';
    const conn = await mongoose.connect(targetUri, {
      family: 4 // Use IPv4 for network resolution on Windows
    });
    console.log(`🍃 MongoDB Atlas Connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.warn(`⚠️ Could not connect to MongoDB database (${error.message}).`);
    console.log('🔄 REST API is running in fallback mode.');
  }
};

module.exports = connectDB;
