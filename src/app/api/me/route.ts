// app/api/me/route.ts
import { NextResponse } from 'next/server';
import { redisClient } from '@/lib/redis';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Parse cookies
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map((v) => v.split('='))
    );
    const sessionId = cookies['sessionId'];

    if (!sessionId) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Fetch session data
    const session = await redisClient.hGetAll(sessionId);
    if (!session || !session.userId) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Fetch user data
    const userData = await redisClient.hGetAll(session.userId);
    if (!userData || Object.keys(userData).length === 0) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = {
      userId: session.userId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      email: userData.email,
    };

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
