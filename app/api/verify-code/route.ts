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

export async function POST(request: NextRequest) {
  let client;
  try {
    const body = await request.json();
    const code = body?.code;

    console.log('========== CODE LOGIN REQUEST ==========');
    console.log('1. Received code:', code);
    console.log('2. Code type:', typeof code);
    console.log('3. Code length:', code?.length);

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { success: false, message: 'کۆد دەبێت ٦ ژمارە بێت' },
        { status: 400 }
      );
    }

    client = await pool.connect();
    console.log('4. Database connected successfully');
    
    // Get all codes from database
    const allCodesResult = await client.query(
      'SELECT id, code, LENGTH(code) as code_length FROM logincode'
    );
    console.log('5. All codes in database with details:', allCodesResult.rows.map((r: any) => ({
      id: r.id,
      code: r.code,
      length: r.code_length,
      codeChars: r.code.split('').map((c: string) => c.charCodeAt(0))
    })));

    // Try multiple comparison methods
    let result = await client.query(
      `SELECT * FROM logincode 
       WHERE 
        code = $1 
        OR CAST(code AS TEXT) = $1 
        OR CAST(code AS TEXT) = LPAD($1, 6, '0')
        OR code = CAST($2 AS TEXT)`,
      [code, parseInt(code, 10)]
    );

    console.log('6. Query result for code "' + code + '":', result.rows);

    if (result.rows.length > 0) {
      console.log('✓ SUCCESS: Code found!');
      const loginRecord = result.rows[0];
      
      const response = NextResponse.json(
        { 
          success: true, 
          message: 'کۆد تێپەڕ کرد',
          user: {
            id: loginRecord.id,
            code: loginRecord.code
          }
        },
        { status: 200 }
      );
      
      // Set authentication cookie
      response.cookies.set('userEmail', 'Code Login', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      
      return response;
    } else {
      console.log('✗ FAILED: Code not found in database');
      return NextResponse.json(
        { success: false, message: 'کۆد هەڵە یە' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('========== DATABASE ERROR ==========');
    console.error('Error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خرابی سێرڤەر: ' + errorMsg
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.release();
      console.log('7. Database connection released');
    }
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
