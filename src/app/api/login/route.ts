// app/api/login/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redisClient } from '@/lib/redis';
import { serialize } from 'cookie';

// Define the expected request body using Zod
const loginSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the incoming data
    const parsedData = loginSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { success: false, errors: parsedData.error.errors },
        { status: 400 }
      );
    }

    const { username, password } = parsedData.data;

    // Fetch the userId using the username
    const userId = await redisClient.get(`user:username:${username}`);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    // Fetch user data
    const userData = await redisClient.hGetAll(userId);
    if (!userData || Object.keys(userData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    // Create a session token (for simplicity, using a random string; consider using JWTs or UUIDs)
    const sessionId = `session:${Date.now()}`;

    // Store session data in Redis with an expiration time (e.g., 1 hour)
    await redisClient.hSet(sessionId, { userId });
    await redisClient.expire(sessionId, 3600); // 1 hour in seconds

    // Set a cookie with the session ID
    const cookie = serialize('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600, // 1 hour in seconds
    });

    return new NextResponse(
      JSON.stringify({ success: true, message: 'Login successful.' }),
      {
        status: 200,
        headers: {
          'Set-Cookie': cookie,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
