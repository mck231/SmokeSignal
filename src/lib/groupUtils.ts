// src/lib/groupUtils.ts

import { redisClient } from '@/lib/redis';
import { DEFAULT_GROUP_ID, DEFAULT_GROUP_NAME, DEFAULT_GROUP_DESCRIPTION } from '@/config/defaultGroup';

export async function ensureDefaultGroupExists() {
  try {
    const existingGroup = await redisClient.hGetAll(`group:${DEFAULT_GROUP_ID}`);
    if (Object.keys(existingGroup).length === 0) {
      // Create the default group
      await redisClient.hSet(`group:${DEFAULT_GROUP_ID}`, {
        groupName: DEFAULT_GROUP_NAME,
        description: DEFAULT_GROUP_DESCRIPTION,
      });
      console.log(`Default group created with ID: ${DEFAULT_GROUP_ID}`);
    } else {
      console.log(`Default group with ID ${DEFAULT_GROUP_ID} already exists.`);
    }
  } catch (error) {
    console.error('Error ensuring default group exists:', error);
    throw error; // Propagate the error to handle it upstream
  }
}

export async function ensureGroupsExist(groupIds: string[]) {
  try {
    for (const groupId of groupIds) {
      const existingGroup = await redisClient.hGetAll(`group:${groupId}`);
      if (Object.keys(existingGroup).length === 0) {
        // Create the group (you might need to pass group details)
        await redisClient.hSet(`group:${groupId}`, {
          groupName: `Group ${groupId}`,
          description: 'Automatically created group for voting session',
        });
        console.log(`Group created with ID: ${groupId}`);
      } else {
        console.log(`Group with ID ${groupId} already exists.`);
      }
    }
  } catch (error) {
    console.error('Error ensuring groups exist:', error);
    throw error;
  }
}