/**
 * Database Connection Module (PostgreSQL)
 * Menggunakan pg Pool murni tanpa ORM Prisma
 */

const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load .env.local first (from Neon), fallback to .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

let connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL;

// Bersihkan parameter channel_binding yang tidak didukung node-postgres agar koneksi ke Neon mulus
if (connectionString) {
  connectionString = connectionString.replace(/([?&])channel_binding=[^&]*(&|$)/, '$1').replace(/[?&]$/, '');
}

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'siladik_db',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  // Connected successfully
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
