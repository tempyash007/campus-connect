const mongoose = require('mongoose');

const connectDB = async () => {
  const connStr = process.env.MONGODB_URI;
  if (!connStr) {
    console.log('ℹ️ MONGODB_URI not provided. Product Service operating with seed/in-memory storage.');
    return;
  }
  try {
    const conn = await mongoose.connect(connStr, { family: 4 });
    console.log(`🍃 Product Service MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.warn(`⚠️ Could not connect to Product DB (${error.message}). Operating in fallback mode.`);
  }
};

module.exports = connectDB;
