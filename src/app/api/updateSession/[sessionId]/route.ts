// app/api/updateSession/[sessionId]/route.ts

import { NextResponse } from 'next/server';
import { redisClient } from '@/lib/redis';
import { ensureGroupsExist } from '@/lib/groupUtils';
import { z } from 'zod';

const updateSessionSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start time.',
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end time.',
  }),
  assignedGroupIds: z.array(z.string()).optional(),
  slideIds: z.array(z.string()).min(1, { message: 'At least one slide ID is required.' }),
});

export async function PUT(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;

  try {
    const sessionKey = `session:${sessionId}`;
    const sessionExists = await redisClient.exists(sessionKey);

    if (!sessionExists) {
      return NextResponse.json(
        { success: false, message: 'Voting session not found.' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate the incoming data
    const parsedData = updateSessionSchema.safeParse(body);
    if (!parsedData.success) {
      console.log('Session update validation failed:', parsedData.error.errors);
      return NextResponse.json(
        { success: false, errors: parsedData.error.errors },
        { status: 400 }
      );
    }

    const { title, description, startTime, endTime, assignedGroupIds, slideIds } = parsedData.data;

    // Ensure all assigned groups exist
    if (assignedGroupIds && assignedGroupIds.length > 0) {
      await ensureGroupsExist(assignedGroupIds);
    }

    // Update the voting session in Redis
    await redisClient.hSet(`session:${sessionId}`, {
      title,
      description,
      startTime,
      endTime,
      assignedGroupIds: assignedGroupIds ? assignedGroupIds.join(',') : '',
    });

    // Update slides
    await redisClient.del(`session:${sessionId}:slides`); // Remove existing slides
    await redisClient.rPush(`session:${sessionId}:slides`, slideIds); // Add updated slides

    return NextResponse.json({ success: true, sessionId }, { status: 200 });
  } catch (error) {
    console.error(`Error updating voting session ${sessionId}:`, error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}