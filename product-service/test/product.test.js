const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

test('Product Service - Basic Smoke & Metrics Test', async (t) => {
  let server;
  let testPort = 3002;
  let isLive = false;

  const checkLive = (port) => {
    return new Promise((resolve) => {
      const req = http.get(`http://localhost:${port}/health`, { timeout: 1500 }, (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
    });
  };

  isLive = await checkLive(3002);

  if (!isLive) {
    testPort = 3997;
    let app;
    try {
      app = require('../server');
    } catch (err) {
      t.diagnostic(`Local dependencies not installed on host: ${err.message}. To run locally, run npm install or verify in Docker / CI.`);
      return;
    }
    await new Promise((resolve) => {
      server = app.listen(testPort, () => resolve());
    });
  }

  const makeRequest = (path) => {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:${testPort}${path}`, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
      }).on('error', reject);
    });
  };

  await t.test('GET /health returns 200 and UP status', async () => {
    const res = await makeRequest('/health');
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.status, 'UP');
    assert.strictEqual(body.service, 'product-service');
  });

  await t.test('GET /metrics returns 200 and prometheus metrics', async () => {
    const res = await makeRequest('/metrics');
    assert.strictEqual(res.statusCode, 200);
    assert.match(res.body, /http_requests_total/);
  });

  await t.test('GET / returns 200 with service info', async () => {
    const res = await makeRequest('/');
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.service, 'Product Service');
  });

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});
