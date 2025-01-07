// app/api/getAllSessions/route.ts

import { NextResponse } from 'next/server';
import { redisClient } from '@/lib/redis';

export async function GET() {
  try {
    // Fetch all keys that match 'session:*'
    const sessionKeys = await redisClient.keys('session:*');

    const sessions: unknown[] = [];

    for (const key of sessionKeys) {
      // Exclude keys like 'session:123:slides' or 'session:123:votes'
      if (key.split(':').length === 2) {
        const sessionData = await redisClient.hGetAll(key);
        sessions.push({
          id: key.split(':')[1],
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
      }
    }

    return NextResponse.json({ success: true, sessions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching all voting sessions:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}