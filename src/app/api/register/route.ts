// app/api/register/route.ts

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redisClient } from '@/lib/redis';
import { v4 as uuidv4 } from 'uuid';
import { ensureDefaultGroupExists } from '@/lib/groupUtils';
import { DEFAULT_GROUP_ID } from '@/config/defaultGroup';

// Define the expected request body using Zod
const registerSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First name must be at least 2 characters.',
  }),
  lastName: z.string().min(2, {
    message: 'Last name must be at least 2 characters.',
  }),
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  email: z.string().email('Invalid email address.').optional(),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
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

    let { username, email } = parsedData.data;
    const { firstName, lastName, password } = parsedData.data;

    // Normalize username to lowercase to prevent case-sensitive issues
    username = username.trim().toLowerCase();

    // Normalize email if provided
    if (email) {
      email = email.trim().toLowerCase();
    }

    // Check if the username already exists
    const existingUsername = await redisClient.get(`user:username:${username}`);
    if (existingUsername) {
      console.log('Username already exists:', username);
      return NextResponse.json(
        { success: false, message: 'Username already exists.' },
        { status: 409 }
      );
    }

    // Check if the email already exists (if provided)
    if (email) {
      const existingEmail = await redisClient.get(`user:email:${email}`);
      if (existingEmail) {
        console.log('Email already exists:', email);
        return NextResponse.json(
          { success: false, message: 'Email already exists.' },
          { status: 409 }
        );
      }
    }

    // Ensure the default group exists
    await ensureDefaultGroupExists();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique user ID using UUID
    const userId = uuidv4();

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

    // If email is provided, map email to userId
    if (email) {
      await redisClient.set(`user:email:${email}`, userId);
      console.log(`Mapped email '${email}' to userId '${userId}'`);
    }

    // Set isAdmin flag to "false" by default
    await redisClient.set(`user:${userId}:isAdmin`, 'false');
    console.log(`Set isAdmin flag to "false" for userId '${userId}'`);

    // Assign the user to the default group
    await redisClient.sAdd(`group:${DEFAULT_GROUP_ID}:users`, userId);
    console.log(`Added userId '${userId}' to group '${DEFAULT_GROUP_ID}'`);

    await redisClient.sAdd(`user:${userId}:groups`, DEFAULT_GROUP_ID);
    console.log(`Added group '${DEFAULT_GROUP_ID}' to userId '${userId}'`);

    return NextResponse.json({ success: true, userId }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}