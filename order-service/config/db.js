const mongoose = require('mongoose');

const connectDB = async () => {
  const connStr = process.env.MONGODB_URI;
  if (!connStr) {
    console.log('ℹ️ MONGODB_URI not provided. Order Service operating with in-memory storage.');
    return;
  }
  try {
    const conn = await mongoose.connect(connStr, { family: 4 });
    console.log(`🍃 Order Service MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.warn(`⚠️ Could not connect to Order DB (${error.message}). Operating in fallback mode.`);
  }
};

module.exports = connectDB;
