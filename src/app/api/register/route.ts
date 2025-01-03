// app/api/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redisClient } from '@/lib/redis';

// Define the expected request body using Zod
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters.'),
  username: z.string().min(2, 'Username must be at least 2 characters.'),
  email: z.string().email('Invalid email address.').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the incoming data
    const parsedData = registerSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { success: false, errors: parsedData.error.errors },
        { status: 400 }
      );
    }

    const { firstName, lastName, username, email, password } = parsedData.data;

    // Check if the username already exists
    const existingUser = await redisClient.hGetAll(`user:username:${username}`);
    if (existingUser && Object.keys(existingUser).length > 0) {
      return NextResponse.json(
        { success: false, message: 'Username already exists.' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique user ID (you might want to use a more robust method)
    const userId = `user:${Date.now()}`;

    // Store user data in Redis
    await redisClient.hSet(`user:${userId}`, {
      firstName,
      lastName,
      username,
      email: email || '',
      password: hashedPassword,
    });

    // Also map username to userId for quick lookup during login
    await redisClient.set(`user:username:${username}`, userId);

    return NextResponse.json({ success: true, userId }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
