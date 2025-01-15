// app/vote/page.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VotingSessionCard } from "./VotingSessionCard"; // Client Component
import { VotingSession } from "@/types"; // Import the VotingSession type
import { redisClient } from "@/lib/redis";

async function getAllVotingSessions(): Promise<VotingSession[]> {
  try {
    const sessionsData = await redisClient.lRange('voting:sessions', 0, -1);
    
    const sessions: VotingSession[] = sessionsData.map(sessionStr => {
      const parsedSession = JSON.parse(sessionStr);

      return {
        ...parsedSession,
        assignedGroupIds: parsedSession.assignedGroupIds || [], // Default to empty array if undefined
      } as VotingSession;
    });

    return sessions;
  } catch (error) {
    console.error("Error fetching voting sessions:", error);
    throw new Error("Failed to fetch voting sessions");
  }
}

export default async function VoteDashboardPage() {
  const sessions = await getAllVotingSessions();

  return (
    <main className="min-h-screen w-full bg-gray-50 p-6">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Voting Dashboard</h1>
          <Link href="/vote/new">
            <Button className="bg-green-100 text-green-800 hover:bg-green-300">
              New Voting Session
            </Button>
          </Link>
        </header>

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <VotingSessionCard key={session.id} session={session} />
            ))
          ) : (
            <p className="text-gray-600">No voting sessions found.</p>
          )}
        </section>
      </div>
    </main>
  );
}
