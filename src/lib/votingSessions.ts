// lib/votingSessions.ts

import { VotingSession } from '@/types';
import { redisClient } from './redis';

export async function getAllVotingSessions(): Promise<VotingSession[]> {
  try {
    // Assuming voting sessions are stored with keys like 'session:<id>'
    const keys = await redisClient.keys('session:*');
    const sessions: VotingSession[] = [];

    for (const key of keys) {
      const sessionData = await redisClient.hGetAll(key);
      
      // Parse assignedGroupIds if present
      if (sessionData.assignedGroupIds) {
        try {
          sessionData.assignedGroupIds = JSON.parse(sessionData.assignedGroupIds);
        } catch (e) {
          console.error(`Error parsing assignedGroupIds for ${key}:`, e);
          sessionData.assignedGroupIds = [];
        }
      }

      // Parse slideIds if present
      if (sessionData.slideIds) {
        try {
          sessionData.slideIds = JSON.parse(sessionData.slideIds);
        } catch (e) {
          console.error(`Error parsing slideIds for ${key}:`, e);
          sessionData.slideIds = [];
        }
      }

      // Optional: Parse startTime and endTime to Date objects if desired
      // sessionData.startTime = new Date(sessionData.startTime);
      // sessionData.endTime = new Date(sessionData.endTime);

      sessions.push(sessionData as unknown as VotingSession);
    }

    return sessions;
  } catch (error) {
    console.error("Error fetching voting sessions:", error);
    throw new Error("Failed to fetch voting sessions");
  }
}
