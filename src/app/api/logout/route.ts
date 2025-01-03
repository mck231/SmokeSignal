// app/api/logout/route.ts
import { NextResponse } from 'next/server';
import { redisClient } from '@/lib/redis';
import { serialize } from 'cookie';

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Parse cookies
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map((v) => v.split('='))
    );
    const sessionId = cookies['sessionId'];

    if (sessionId) {
      // Delete session from Redis
      await redisClient.del(sessionId);
    }

    // Clear the cookie
    const cookie = serialize('sessionId', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0),
    });

    return new NextResponse(
      JSON.stringify({ success: true, message: 'Logged out successfully.' }),
      {
        status: 200,
        headers: {
          'Set-Cookie': cookie,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Logout Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
