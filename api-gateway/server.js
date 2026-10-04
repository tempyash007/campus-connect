require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Service Discovery Configuration (Service Registry from env)
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

app.use(cors());

// Global Request Logging Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] GATEWAY REQUEST: ${req.method} ${req.url}`);
  next();
});

// Gateway Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    serviceRegistry: {
      userService: USER_SERVICE_URL,
      productService: PRODUCT_SERVICE_URL,
      orderService: ORDER_SERVICE_URL
    }
  });
});

// Gateway Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'CampusConnect API Gateway',
    status: 'Running',
    port: PORT,
    routes: {
      health: 'GET /health',
      users: '/users/*',
      products: '/products/*',
      orders: '/orders/*'
    }
  });
});

// Helper function to build reverse proxy options with centralized error handling & logging
const createGatewayProxy = (targetUrl, serviceName, pathPrefix) => {
  const errorHandler = (err, req, res) => {
    console.error(`[GATEWAY ERROR] Target service '${serviceName}' at ${targetUrl} is unreachable: ${err.message}`);
    if (!res.headersSent) {
      res.status(503).json({
        error: 'Service Unavailable',
        message: `The '${serviceName}' is currently unreachable or down.`,
        service: serviceName,
        targetUrl: targetUrl,
        statusCode: 503,
        timestamp: new Date().toISOString()
      });
    }
  };

  const proxyReqHandler = (proxyReq, req, res) => {
    console.log(`[GATEWAY PROXY] ${req.method} ${req.originalUrl} -> ${serviceName} (${targetUrl})`);
  };

  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: {
      [`^/`]: `${pathPrefix}/`
    },
    on: {
      error: errorHandler,
      proxyReq: proxyReqHandler
    },
    onError: errorHandler,
    onProxyReq: proxyReqHandler
  });
};

// Route Definitions mapped to downstream microservices
app.use('/users', createGatewayProxy(USER_SERVICE_URL, 'User Service', '/users'));
app.use('/products', createGatewayProxy(PRODUCT_SERVICE_URL, 'Product Service', '/products'));
app.use('/orders', createGatewayProxy(ORDER_SERVICE_URL, 'Order Service', '/orders'));

// Catch-all 404 for unhandled gateway paths
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `No route found on API Gateway for ${req.method} ${req.url}`,
    statusCode: 404
  });
});

app.listen(PORT, () => {
  console.log(`🌐 API Gateway running on port ${PORT}`);
  console.log(`📍 Service Registry Mappings:`);
  console.log(`   - /users    -> ${USER_SERVICE_URL}`);
  console.log(`   - /products -> ${PRODUCT_SERVICE_URL}`);
  console.log(`   - /orders   -> ${ORDER_SERVICE_URL}`);
});

module.exports = app;
