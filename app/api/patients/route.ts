import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set. Please configure .env.local with your database connection string.');
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
      const result = await client.query(
        'SELECT * FROM patients ORDER BY date DESC'
      );
      return NextResponse.json(
        {
          success: true,
          data: result.rows
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get patients error:', error);
    return NextResponse.json(
      { success: false, message: 'خرابی سێرڤەر' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Domain validation for development only
    const isDevelopment = process.env.NODE_ENV === 'development';
    const host = request.headers.get('host') || '';
    
    if (isDevelopment) {
      const isAllowed = host.includes('.en.local') || host.includes('localhost');
      if (!isAllowed) {
        return NextResponse.json(
          { success: false, message: 'ئەم ڕێگایە دەستگیری کراوە' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { name, phone, treatment, total_amount, paid_amount, status } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'ناوی نەخۆش پێویست دەکەن' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO patients (name, phone, treatment, total_amount, paid_amount, status) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, phone, treatment, total_amount || 0, paid_amount || 0, status || 'pending']
      );
      return NextResponse.json(
        {
          success: true,
          message: 'نەخۆش زیادکرا',
          data: result.rows[0]
        },
        { status: 201 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Add patient error:', error);
    return NextResponse.json(
      { success: false, message: 'خرابی سێرڤەر' },
      { status: 500 }
    );
  }
}
