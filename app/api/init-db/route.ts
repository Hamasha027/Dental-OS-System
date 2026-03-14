import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set. Please create .env.local with your database connection string.');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
});

export async function GET(request: NextRequest) {
  try {
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

      console.log('✓ Patients table created successfully');

      // Add sample data if table is empty
      const countResult = await client.query('SELECT COUNT(*) FROM patients');
      const count = parseInt(countResult.rows[0].count, 10);

      if (count === 0) {
        await client.query(`
          INSERT INTO patients (name, phone, treatment, total_amount, paid_amount, status) VALUES
            ('محمد علی', '07701234567', 'تریتمنت تەلی', 1000000, 300000, 'pending'),
            ('نالیا حسن', '07709876543', 'پوليش', 500000, 200000, 'pending'),
            ('فاتیمە محمود', '07705555555', 'روانکاری', 750000, 750000, 'completed')
        `);
        console.log('✓ Sample data inserted');
      }

      return NextResponse.json(
        {
          success: true,
          message: 'جێگاسازی بنکەی داتا سەرکەوتۆی بووی! ' + (count === 0 ? 'نمونە داتا زیادکرا' : 'ڕستەی داتا بەجێ مایی'),
          data: {
            table_created: true,
            sample_data_added: count === 0,
            total_patients: count + (count === 0 ? 3 : 0)
          }
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خرابی جێگاسازی: ' + (error instanceof Error ? error.message : String(error))
      },
      { status: 500 }
    );
  }
}
