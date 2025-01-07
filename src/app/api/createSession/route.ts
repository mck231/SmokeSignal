// app/api/createSession/route.ts

import { NextResponse } from 'next/server';
import { redisClient } from '@/lib/redis';
import { ensureDefaultGroupExists, ensureGroupsExist } from '@/lib/groupUtils';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_GROUP_ID } from '@/config/defaultGroup';

// Define the expected request body using Zod
import { z } from 'zod';

const sessionSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start time.',
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end time.',
  }),
  assignedGroupIds: z.array(z.string()).optional(),
  slideIds: z.array(z.string()).min(1, { message: 'At least one slide is required.' }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the incoming data
    const parsedData = sessionSchema.safeParse(body);
    if (!parsedData.success) {
      console.log('Session creation validation failed:', parsedData.error.errors);
      return NextResponse.json(
        { success: false, errors: parsedData.error.errors },
        { status: 400 }
      );
    }

    const { title, description, startTime, endTime, assignedGroupIds, slideIds } = parsedData.data;

    // Ensure the default group exists
    await ensureDefaultGroupExists();

    // Ensure all assigned groups exist
    if (assignedGroupIds && assignedGroupIds.length > 0) {
      await ensureGroupsExist(assignedGroupIds);
    }

    // Generate a unique session ID
    const sessionId = uuidv4();

    // Store the voting session in Redis
    await redisClient.hSet(`session:${sessionId}`, {
      title,
      description,
      startTime,
      endTime,
      status: 'upcoming',
      slideIds: slideIds.join(','),
      assignedGroupIds: assignedGroupIds ? assignedGroupIds.join(',') : DEFAULT_GROUP_ID,
      createdAt: new Date().toISOString(),
    });

    // Initialize associated keys
    await redisClient.rPush(`session:${sessionId}:slides`, slideIds);
    await redisClient.lPush(`session:${sessionId}:votes`, JSON.stringify([])); // Initialize votes list

    return NextResponse.json({ success: true, sessionId }, { status: 201 });
  } catch (error) {
    console.error('Error creating voting session:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}