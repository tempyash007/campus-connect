try { require('dotenv').config(); } catch (e) {}
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

// Prometheus Metrics Instrumentation
let register, httpRequestDurationMicroseconds, httpRequestsTotal;
try {
  const promClient = require('prom-client');
  register = new promClient.Registry();
  register.setDefaultLabels({ app: 'api-gateway' });
  promClient.collectDefaultMetrics({ register });

  httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests processed by API Gateway',
    labelNames: ['method', 'route', 'status'],
    registers: [register]
  });

  httpRequestDurationMicroseconds = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 1.5, 2, 5],
    registers: [register]
  });
} catch (e) {
  // Graceful fallback metrics counter if prom-client is not yet installed locally
  const requestCounts = {};
  httpRequestsTotal = {
    inc: ({ method, route, status }) => {
      const key = `${method}_${route}_${status}`;
      requestCounts[key] = (requestCounts[key] || 0) + 1;
    }
  };
  httpRequestDurationMicroseconds = {
    startTimer: () => () => {}
  };
  register = {
    metrics: async () => {
      let out = '# HELP http_requests_total Total number of HTTP requests processed\n# TYPE http_requests_total counter\n';
      for (const [key, val] of Object.entries(requestCounts)) {
        const [method, route, status] = key.split('_');
        out += `http_requests_total{method="${method}",route="${route}",status="${status}"} ${val}\n`;
      }
      out += 'up 1\n';
      return out;
    },
    contentType: 'text/plain; version=0.0.4; charset=utf-8'
  };
}

// Request Timing & Metrics Middleware
app.use((req, res, next) => {
  const endTimer = httpRequestDurationMicroseconds.startTimer ? httpRequestDurationMicroseconds.startTimer() : null;
  res.on('finish', () => {
    const route = req.baseUrl || req.path || req.originalUrl || 'unknown';
    const status = res.statusCode ? res.statusCode.toString() : 'unknown';
    if (httpRequestsTotal && httpRequestsTotal.inc) {
      httpRequestsTotal.inc({ method: req.method, route, status });
    }
    if (endTimer) {
      endTimer({ method: req.method, route, status });
    }
  });
  next();
});

// Prometheus Scrape Endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.setHeader('Content-Type', register.contentType || 'text/plain; version=0.0.4; charset=utf-8');
    const metrics = await register.metrics();
    res.send(metrics);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🌐 API Gateway running on port ${PORT}`);
    console.log(`📍 Service Registry Mappings:`);
    console.log(`   - /users    -> ${USER_SERVICE_URL}`);
    console.log(`   - /products -> ${PRODUCT_SERVICE_URL}`);
    console.log(`   - /orders   -> ${ORDER_SERVICE_URL}`);
  });
}

module.exports = app;
