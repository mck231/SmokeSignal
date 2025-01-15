// app/api/createSession/route.ts

import { redisClient } from '@/lib/redis';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define the expected payload using Zod
const sessionSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start time.",
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end time.",
  }),
  assignedGroupIds: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = sessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.errors }, { status: 400 });
    }

    const sessionData = {
      ...parsed.data,
      id: crypto.randomUUID(), // Generate a unique ID for the session
      createdAt: new Date().toISOString(),
      slideIds: [], // Initialize with an empty array since slides are managed separately
    };

    // Serialize assignedGroupIds as JSON string if present
    const payload: Record<string, string> = {
      title: sessionData.title,
      description: sessionData.description,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      assignedGroupIds: sessionData.assignedGroupIds ? JSON.stringify(sessionData.assignedGroupIds) : '',
      createdAt: sessionData.createdAt,
      slideIds: JSON.stringify(sessionData.slideIds), // Serialize slideIds as JSON string
    };

    // Store the session in Redis (assuming you store sessions as hashes)
    await redisClient.hSet(`session:${sessionData.id}`, payload);

    return NextResponse.json({ success: true, sessionId: sessionData.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
