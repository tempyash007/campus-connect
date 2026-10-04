/**
 * Main Server Entry Point
 * DA-IICT Web Services & SOA - Lab 4 Assignment
 * RESTful Student Management Web Service (Express.js + MongoDB Atlas)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB Database
connectDB();

// Enable CORS and JSON body parsing middleware
app.use(cors());
app.use(express.json());

// Configure Swagger UI Documentation
try {
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./config/swagger');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('📄 Swagger UI documentation mounted at http://localhost:' + PORT + '/api-docs');
} catch (err) {
  console.warn('⚠️ Swagger UI dependency warning:', err.message);
}

// Base welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Student Management REST API (Express.js & MongoDB Atlas - Lab 4)',
    endpoints: {
      documentation: `http://localhost:${PORT}/api-docs`,
      students: `http://localhost:${PORT}/students`
    }
  });
});

// Mount Student Resource Routes
app.use('/students', studentRoutes);

// Register 404 Not Found & 500 Global Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Student REST API Server running at http://localhost:${PORT}`);
    console.log(`📚 Interactive Swagger API Docs: http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
