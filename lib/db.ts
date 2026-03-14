import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set. Please create .env.local with your database connection string.');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create patients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        treatment VARCHAR(255),
        total_amount DECIMAL(10, 2) DEFAULT 0,
        paid_amount DECIMAL(10, 2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Patients table created or already exists');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
}

export default pool;
