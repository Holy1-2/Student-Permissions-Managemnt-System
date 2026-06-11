const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mipc-gate',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'local', // Use local system timezone for accurate timestamps
});

// Test connection on startup
pool.getConnection()
  .then((conn) => {
    console.log('[DB] MySQL connection pool established successfully.');
    conn.release();
  })
  .catch((err) => {
    console.error('[DB] Failed to connect to MySQL:', err.message);
    process.exit(1);
  });

module.exports = pool;
