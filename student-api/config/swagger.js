/**
 * Swagger / OpenAPI Configuration
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Student Management REST API',
      version: '1.0.0',
      description:
        'RESTful Web Service built with Express.js and MongoDB Atlas for DA-IICT Web Services & SOA Lab 4 assignment. Exposes resource-oriented CRUD operations for Student entities with validation, error handling, and interactive Swagger UI.',
      contact: {
        name: 'DA-IICT Web Services & SOA Lab'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Express Server'
      }
    ]
  },
  apis: ['./routes/*.js', './server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
