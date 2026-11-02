try { require('dotenv').config(); } catch (e) {}
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

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
  register.setDefaultLabels({ app: 'product-service' });
  promClient.collectDefaultMetrics({ register });
  httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests processed by Product Service',
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
  res.status(200).json({ status: 'UP', service: 'product-service', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.status(200).json({
    service: 'Product Service',
    status: 'Running',
    port: PORT,
    endpoints: {
      health: `http://localhost:${PORT}/health`,
      metrics: `http://localhost:${PORT}/metrics`,
      products: `http://localhost:${PORT}/products`
    }
  });
});

app.use('/products', productRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found on Product Service' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`📦 Product Service running on port ${PORT}`);
  });
}

module.exports = app;
