/**
 * scripts/generate-traffic.js
 * Lab 8 API Traffic Generator for Prometheus & Grafana Monitoring Demonstration
 *
 * Usage:
 *   node scripts/generate-traffic.js [gateway_base_url] [num_requests]
 *
 * Example:
 *   node scripts/generate-traffic.js http://localhost:3000 60
 *   node scripts/generate-traffic.js http://localhost:30080 100
 */

const http = require('node:http');

const GATEWAY_URL = process.argv[2] || process.env.GATEWAY_URL || 'http://localhost:3000';
const TOTAL_REQUESTS = parseInt(process.argv[3] || '60', 10);

const testEndpoints = [
  { path: '/health', method: 'GET', description: 'Gateway Health Check' },
  { path: '/', method: 'GET', description: 'Gateway Info Root' },
  { path: '/users', method: 'GET', description: 'User Service List' },
  { path: '/products', method: 'GET', description: 'Product Service List' },
  { path: '/orders', method: 'GET', description: 'Order Service List' },
  { path: '/users/invalid-endpoint-for-error-testing', method: 'GET', description: 'Controlled 404 Error Test' }
];

console.log(`🚀 Starting Lab 8 Traffic Generator`);
console.log(`📍 Target Gateway: ${GATEWAY_URL}`);
console.log(`📊 Total Requests to send: ${TOTAL_REQUESTS}`);
console.log(`─────────────────────────────────────────────`);

let sent = 0;
let success = 0;
let failed = 0;

const sendRequest = (endpoint) => {
  return new Promise((resolve) => {
    const url = `${GATEWAY_URL}${endpoint.path}`;
    const req = http.request(url, { method: endpoint.method, timeout: 3000 }, (res) => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          success++;
        } else {
          failed++;
        }
        console.log(`[${new Date().toLocaleTimeString()}] ${endpoint.method} ${endpoint.path} -> HTTP ${res.statusCode} (${endpoint.description})`);
        resolve();
      });
    });

    req.on('error', (err) => {
      failed++;
      console.log(`[${new Date().toLocaleTimeString()}] ⚠️ Request Error for ${endpoint.path}: ${err.message}`);
      resolve();
    });

    req.on('timeout', () => {
      req.destroy();
      failed++;
      console.log(`[${new Date().toLocaleTimeString()}] ⏱️ Request Timeout for ${endpoint.path}`);
      resolve();
    });

    req.end();
  });
};

async function run() {
  const startTime = Date.now();
  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    const endpoint = testEndpoints[i % testEndpoints.length];
    await sendRequest(endpoint);
    sent++;
    // Add small random delay (50ms - 150ms) to simulate realistic user traffic
    await new Promise(r => setTimeout(r, 50 + Math.random() * 100));
  }
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`─────────────────────────────────────────────`);
  console.log(`✅ Traffic Generation Complete!`);
  console.log(`📈 Summary: ${sent} requests in ${duration}s (${(sent / duration).toFixed(2)} req/s)`);
  console.log(`   - Successful (2xx/3xx): ${success}`);
  console.log(`   - Errors/Controlled 4xx/5xx: ${failed}`);
  console.log(`🔍 Check Prometheus (http://localhost:30090) and Grafana (http://localhost:30030) to see live dashboard changes!`);
}

run().catch(console.error);
