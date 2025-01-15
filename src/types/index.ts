// src/types/index.ts

export type VotingSessionStatus = "ongoing" | "ended";

export interface VotingSession {
  id: string;
  title: string;
  description: string;
  startTime: string; // or Date, based on your preference
  endTime: string;   // or Date
  assignedGroupIds: string[];
  createdAt: string;
  slideIds: string[];
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