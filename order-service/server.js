try { require('dotenv').config(); } catch (e) {}
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

if (require.main === module) {
  connectDB();
}

app.use(cors());
app.use(express.json());

// Prometheus Metrics Setup
let register, httpRequestsTotal, httpRequestDurationSeconds;
try {
  const promClient = require('prom-client');
  register = new promClient.Registry();
  register.setDefaultLabels({ app: 'order-service' });
  promClient.collectDefaultMetrics({ register });
  httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests processed by Order Service',
    labelNames: ['method', 'route', 'status'],
    registers: [register]
  });
  httpRequestDurationSeconds = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 1.5, 2],
    registers: [register]
  });
} catch (e) {
  const counts = {};
  httpRequestsTotal = {
    inc: ({ method, route, status }) => {
      counts[`${method}_${route}_${status}`] = (counts[`${method}_${route}_${status}`] || 0) + 1;
    }
  };
  httpRequestDurationSeconds = {
    startTimer: () => () => {}
  };
  register = {
    metrics: async () => {
      let out = '# HELP http_requests_total Total number of HTTP requests\n# TYPE http_requests_total counter\n';
      for (const [k, v] of Object.entries(counts)) {
        const [method, route, status] = k.split('_');
        out += `http_requests_total{method="${method}",route="${route}",status="${status}"} ${v}\n`;
      }
      out += 'up 1\n';
      return out;
    },
    contentType: 'text/plain; version=0.0.4; charset=utf-8'
  };
}

app.use((req, res, next) => {
  const endTimer = httpRequestDurationSeconds.startTimer ? httpRequestDurationSeconds.startTimer() : null;
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

// Metrics and Health Endpoints
app.get('/metrics', async (req, res) => {
  try {
    res.setHeader('Content-Type', register.contentType || 'text/plain; version=0.0.4; charset=utf-8');
    res.send(await register.metrics());
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'order-service', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.status(200).json({
    service: 'Order Service',
    status: 'Running',
    port: PORT,
    dependencies: {
      userService: process.env.USER_SERVICE_URL || 'http://localhost:3001',
      productService: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002'
    },
    endpoints: {
      health: `http://localhost:${PORT}/health`,
      metrics: `http://localhost:${PORT}/metrics`,
      orders: `http://localhost:${PORT}/orders`
    }
  });
});

app.use('/orders', orderRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found on Order Service' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🛒 Order Service running on port ${PORT}`);
    console.log(`🔗 Target User Service URL: ${process.env.USER_SERVICE_URL || 'http://localhost:3001'}`);
    console.log(`🔗 Target Product Service URL: ${process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002'}`);
  });
}

module.exports = app;
