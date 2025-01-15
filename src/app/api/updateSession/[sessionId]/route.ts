// app/api/updateSession/[sessionId]/route.ts

import { redisClient } from '@/lib/redis';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define the Zod schema
const sessionSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  startTime: z.string(),
  endTime: z.string(),
  assignedGroupIds: z.array(z.string()).optional(),
});

export async function PUT(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId') || '';

  try {
    const body = await request.json();
    const parsed = sessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.errors }, { status: 400 });
    }

    // Prepare the payload by serializing assignedGroupIds if present
    const payload: Record<string, string> = {
      title: parsed.data.title,
      description: parsed.data.description,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
    };

    if (parsed.data.assignedGroupIds) {
      payload.assignedGroupIds = JSON.stringify(parsed.data.assignedGroupIds);
    }

    // Update the session in Redis
    await redisClient.hSet(`session:${sessionId}`, payload);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
