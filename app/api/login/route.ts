import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

// Don't cache the pool - create new connection for each request
function getPool() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set. Please configure .env.local with your database connection string.');
  }
  
  console.log('Creating new pool connection to:', connectionString.split('@')[1]?.split('/')[0] || 'database');
  return new Pool({
    connectionString,
    max: 1,
  });
}

export async function POST(request: NextRequest) {
  try {
    const host = request.headers.get('host') || 'unknown';
    console.log('Login request from host:', host);
    
    const { email, password } = await request.json();
    console.log('Login attempt for email:', email);
    console.log('Email length:', email?.length, 'Password length:', password?.length);
    console.log('Email (trimmed):', email?.trim(), 'Password (trimmed):', password?.trim());

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'ئیمەیڵ و وشەی نهێنی پێویست دەکەن' },
        { status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    let client;
    let pool;
    try {
      pool = getPool();
      client = await pool.connect();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { success: false, message: 'خرابی پەیوەندیکردن بە بنکەدراوە' },
        { status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }
    
    try {
      // Query to find user with matching email and password (case-insensitive)
      const result = await client.query(
        'SELECT id, email FROM "Users" WHERE LOWER(email) = LOWER($1) AND password = $2',
        [email.trim(), password.trim()]
      );
      
      console.log('Query result rows:', result.rows.length);
      
      // Also check if email exists (for debugging)
      const emailCheck = await client.query(
        'SELECT id, email FROM "Users" WHERE LOWER(email) = LOWER($1)',
        [email.trim()]
      );
      console.log('Email found in DB:', emailCheck.rows.length > 0);
      if (emailCheck.rows.length > 0) {
        console.log('User found with email:', emailCheck.rows[0].email);
      }

      if (result.rows.length > 0) {
        const user = result.rows[0];
        console.log('Login successful for user:', user.email);
        
        const response = NextResponse.json(
          { 
            success: true, 
            message: 'سەرکەوتووانە لۆگین کرد',
            user: {
              id: user.id,
              email: user.email
            }
          },
          { status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
            }
          }
        );
        
        // Set secure cookie for authentication
        response.cookies.set('userEmail', user.email, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
        
        return response;
      } else {
        console.log('Login failed: invalid credentials');
        return NextResponse.json(
          { success: false, message: 'ئیمەیڵ یان وشەی نهێنی هەڵە' },
          { status: 401,
            headers: {
              'Access-Control-Allow-Origin': '*',
            }
          }
        );
      }
    } finally {
      if (client) {
        client.release();
      }
      if (pool) {
        await pool.end();
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: 'خرابی بڕوانامە: ' + errorMessage },
      { status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
