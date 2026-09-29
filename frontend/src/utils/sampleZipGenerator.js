import JSZip from 'jszip';

/**
 * Generate a realistic in-memory ZIP file of a microservices project
 * for hackathon testing and demo purposes.
 */
export async function createDemoProjectZip(projectName = 'payflow-microservices') {
  const zip = new JSZip();

  // Root files
  zip.file(
    'package.json',
    JSON.stringify(
      {
        name: projectName,
        version: '2.1.0',
        description: 'High-throughput payment and checkout services with Redis caching',
        main: 'server.js',
        scripts: {
          start: 'node server.js',
          test: 'jest',
        },
        dependencies: {
          express: '^4.19.2',
          pg: '^8.11.3',
          hikaricp: '^3.1.0',
          ioredis: '^5.3.2',
          jsonwebtoken: '^9.0.2',
        },
      },
      null,
      2
    )
  );

  zip.file(
    'docker-compose.yml',
    `version: '3.8'
services:
  api-gateway:
    build: ./services/gateway
    ports:
      - "8080:8080"
  payment-service:
    build: ./services/payment
    environment:
      - DB_POOL_MAX=50
      - DB_TIMEOUT=5000
  auth-service:
    build: ./services/auth
  postgres-db:
    image: postgres:15
    ports:
      - "5432:5432"
`
  );

  zip.file(
    'README.md',
    `# Payflow Microservices
Distributed transaction processing platform with telemetry and real-time incident monitoring hooks.
`
  );

  // Services folders
  const services = zip.folder('services');

  // Payment service
  const payment = services.folder('payment');
  payment.file(
    'worker.js',
    `// Payment processing worker
const express = require('express');
const { Pool } = require('pg');

const pool = new Pool({ max: 50, connectionTimeoutMillis: 5000 });

async function processCharge(req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query('INSERT INTO transactions (amount) VALUES ($1)', [req.body.amount]);
    res.json({ success: true, txId: result.rows[0].id });
  } catch (err) {
    console.error('Database connection pool exhausted:', err.message);
    res.status(503).json({ error: 'DB connection timeout' });
  } finally {
    client.release();
  }
}
`
  );
  payment.file(
    'config.json',
    JSON.stringify({ poolSize: 50, queueLimit: 150, timeoutMs: 5000 }, null, 2)
  );

  // Auth service
  const auth = services.folder('auth');
  auth.file(
    'tokenValidator.js',
    `// Auth token verification and JWKS key rotation
const jwt = require('jsonwebtoken');

function verifyToken(token) {
  // Key rotation cache
  return jwt.verify(token, process.env.PUBLIC_KEY);
}
`
  );

  // Gateway service
  const gateway = services.folder('gateway');
  gateway.file(
    'proxy.js',
    `// API Gateway reverse proxy and circuit breaker
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});
`
  );

  // Database migrations
  const db = zip.folder('database');
  db.file(
    'schema.sql',
    `CREATE TABLE transactions (id SERIAL PRIMARY KEY, amount NUMERIC, status VARCHAR(32));`
  );
  db.file('indexes.sql', `CREATE INDEX idx_tx_status ON transactions(status);`);

  // Generate real ZIP Blob / File
  const content = await zip.generateAsync({ type: 'blob' });
  const file = new File([content], `${projectName}.zip`, {
    type: 'application/zip',
  });

  return file;
}
