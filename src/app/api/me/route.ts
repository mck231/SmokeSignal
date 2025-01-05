// app/api/me/route.ts
import { NextResponse } from 'next/server';
import { redisClient } from '@/lib/redis';
import { parse } from 'cookie'; // Import the 'cookie' library

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    console.log('Cookie Header:', cookieHeader);
    
    if (!cookieHeader) {
      console.log('No cookies found.');
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Parse cookies using the 'cookie' library for accurate parsing and decoding
    const cookies = parse(cookieHeader);
    const rawSessionId = cookies['sessionId'];
    console.log('Parsed sessionId (raw):', rawSessionId);

    if (!rawSessionId) {
      console.log('No sessionId cookie found.');
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Decode the sessionId to get the correct key
    const sessionId = decodeURIComponent(rawSessionId);
    console.log('Decoded sessionId:', sessionId);

    // Fetch session data using the decoded sessionId
    const session = await redisClient.hGetAll(sessionId);
    console.log('Fetched session data:', session);

    if (!session || !session.userId) {
      console.log('Session data invalid or missing userId.');
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Fetch user data using the correct key format
    const userData = await redisClient.hGetAll(`user:${session.userId}`);
    console.log('Fetched user data:', userData);

    if (!userData || Object.keys(userData).length === 0) {
      console.log('User data not found.');
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = {
      userId: session.userId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      email: userData.email,
    };

    console.log('Returning user data:', user);

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
