// app/api/getSession/[sessionId]/route.ts

import { NextResponse } from 'next/server';
import { redisClient } from '@/lib/redis';
import { z } from 'zod';

// Define the expected response structure using Zod
const sessionDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  status: z.enum(["ongoing", "ended"]),
  slideIds: z.array(z.string()),
  assignedGroupIds: z.array(z.string()),
  createdAt: z.string(),
});

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;

  try {
    const sessionKey = `session:${sessionId}`;
    const sessionData = await redisClient.hGetAll(sessionKey);

    if (Object.keys(sessionData).length === 0) {
      // If session does not exist, return 404
      return NextResponse.json(
        { success: false, message: 'Voting session not found.' },
        { status: 404 }
      );
    }

    // Validate and structure the session data
    const parsedSession = sessionDetailSchema.safeParse({
      id: sessionId,
      title: sessionData.title,
      description: sessionData.description,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      status: sessionData.status,
      slideIds: sessionData.slideIds ? sessionData.slideIds.split(',') : [],
      assignedGroupIds: sessionData.assignedGroupIds
        ? sessionData.assignedGroupIds.split(',')
        : [],
      createdAt: sessionData.createdAt,
    });

    if (!parsedSession.success) {
      console.log('Session data validation failed:', parsedSession.error.errors);
      return NextResponse.json(
        { success: false, message: 'Invalid session data.' },
        { status: 500 }
      );
    }

    // Fetch slides
    const slides = await redisClient.lRange(`session:${sessionId}:slides`, 0, -1);

    // Fetch votes
    const votesRaw = await redisClient.lRange(`session:${sessionId}:votes`, 0, -1);
    const votes = votesRaw.map((vote) => JSON.parse(vote));

    return NextResponse.json(
      { success: true, session: parsedSession.data, slides, votes },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error fetching voting session ${sessionId}:`, error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}