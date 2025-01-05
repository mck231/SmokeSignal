// app/api/login/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redisClient } from '@/lib/redis';
import { serialize } from 'cookie'; 
import { v4 as uuidv4 } from 'uuid'; // Optional: For sessionId generation

const loginSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('Login attempt:', body.username);

    // Validate the incoming data
    const parsedData = loginSchema.safeParse(body);
    if (!parsedData.success) {
      console.log('Login validation failed:', parsedData.error.errors);
      return NextResponse.json(
        { success: false, errors: parsedData.error.errors },
        { status: 400 }
      );
    }

    let { username, password } = parsedData.data;

    // Normalize username to lowercase
    username = username.trim().toLowerCase();

    password = password.trim();

    // Implement rate limiting based on username or IP (optional but recommended)
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `rate-limit:login:${ip}`;
    const attempts = await redisClient.get(rateLimitKey);
    if (attempts && parseInt(attempts) >= 10) { // Lowered to 5 for security
      console.log('Rate limit exceeded for IP:', ip);
      return NextResponse.json(
        { success: false, message: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Increment login attempts
    await redisClient.incr(rateLimitKey);
    if (!attempts) {
      await redisClient.expire(rateLimitKey, 60 * 15); // 15 minutes
    }

    // Fetch the userId using the username
    const userId = await redisClient.get(`user:username:${username}`);
    console.log('Fetched userId:', userId);
    if (!userId) {
      console.log('User not found for username:', username);
      return NextResponse.json(
        { success: false, message: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    // Fetch user data
    const userData = await redisClient.hGetAll(`user:${userId}`);
    console.log('User data:', userData);
    if (!userData || Object.keys(userData).length === 0) {
      console.log('No user data found for userId:', userId);
      return NextResponse.json(
        { success: false, message: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    console.log('Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      console.log('Password mismatch for userId:', userId);
      return NextResponse.json(
        { success: false, message: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    // Create a session token (for simplicity, using a UUID)
    const sessionId = `session:${uuidv4()}`; // Using UUID for sessionId

    console.log('Created sessionId:', sessionId);

    // Store session data in Redis with expiration (e.g., 1 hour)
    await redisClient.hSet(sessionId, { userId });
    await redisClient.expire(sessionId, 3600); // 1 hour
    console.log('Stored session in Redis:', sessionId);

    // Serialize the cookie
    const cookie = serialize('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600, // 1 hour in seconds
    });
    console.log('Serialized cookie:', cookie);

    // Return the response with the cookie set
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
