// src/types/index.ts

export type VotingSessionStatus = "ongoing" | "ended";

export interface VotingSession {
  id: string;
  title: string;
  description: string;
  startTime: string; // ISO date string
  endTime: string;   // ISO date string
  status: VotingSessionStatus;
  slideIds: string[];
  assignedGroupIds: string[];
  createdAt: string; // ISO date string
}

// Optional: Define related types if needed

export interface Slide {
  id: string;
  content: string;
  // Add other properties as needed
}

export interface Vote {
  voterId: string;
  selectedOption: string;
  // Add other properties as needed
}