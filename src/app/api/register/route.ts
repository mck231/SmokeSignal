// app/api/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redisClient } from '@/lib/redis';
import { v4 as uuidv4 } from 'uuid'; // Install UUID for better userId generation

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
      console.log('Registration validation failed:', parsedData.error.errors);
      return NextResponse.json(
        { success: false, errors: parsedData.error.errors },
        { status: 400 }
      );
    }


    let {  username, email } = parsedData.data;
    const { firstName, lastName, password} = parsedData.data;
    // Normalize username to lowercase to prevent case-sensitive issues
    username = username.trim().toLowerCase();

    // Normalize email if provided
    if (email) {
      email = email.trim().toLowerCase();
    }

    // Check if the username already exists using 'get' instead of 'hGetAll'
    const existingUser = await redisClient.get(`user:username:${username}`);
    if (existingUser) {
      console.log('Username already exists:', username);
      return NextResponse.json(
        { success: false, message: 'Username already exists.' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique user ID using UUID
    const userId = uuidv4(); // No 'user:' prefix

    console.log(`Generated userId: ${userId}`);

    // Store user data in Redis
    await redisClient.hSet(`user:${userId}`, {
      firstName,
      lastName,
      username,
      email: email || '',
      password: hashedPassword,
    });

    console.log(`Stored user data in Redis under key: user:${userId}`);

    // Map username to userId for quick lookup during login
    await redisClient.set(`user:username:${username}`, userId);

    console.log(`Mapped username '${username}' to userId '${userId}'`);

    return NextResponse.json({ success: true, userId }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

