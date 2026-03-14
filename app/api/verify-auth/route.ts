import { NextRequest, NextResponse } from 'next/server'

/**
 * Verification endpoint - checks if user has valid authentication cookie
 * Used by protected pages to verify authentication on page load
 */
export async function GET(request: NextRequest) {
  try {
    // Get the userEmail cookie set during login
    const userEmail = request.cookies.get('userEmail')?.value

    if (!userEmail) {
      // No authentication cookie found
      return NextResponse.json(
        { authenticated: false, message: 'بڕوانامە نیە' },
        { status: 401 }
      )
    }

    // User is authenticated
    return NextResponse.json(
      {
        authenticated: true,
        email: userEmail,
        method: 'email'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Auth verification error:', error)
    return NextResponse.json(
      { authenticated: false, message: 'خرابی تستکردن' },
      { status: 500 }
    )
  }
}
