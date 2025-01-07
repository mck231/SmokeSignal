// app/vote/page.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VotingSessionCard } from "./VotingSessionCard"; // Import the Client Component
import { VotingSession } from "@/types"; // Import the VotingSession type

async function getAllVotingSessions(): Promise<VotingSession[]> {
  console.log('API_BASE_URL:', process.env);
  console.log('API_BASE_URL:', process.env.API_BASE_URL);
  console.log('TEST_SERVER_VAR:', process);
  const baseUrl = process.env.__NEXT_PRIVATE_ORIGIN;
  if (!baseUrl) {
    throw new Error('API_BASE_URL is not defined');
  }

  const res = await fetch(`${baseUrl}/api/getAllSessions`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to fetch voting sessions');
  }

  const data = await res.json();
  return data.data || [];
}

export default async function VoteDashboardPage() {
  const sessions = await getAllVotingSessions();

  return (
    <main className="min-h-screen w-full bg-gray-50 p-6">
      {/* Responsive container */}
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <header className="mb-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Voting Dashboard</h1>

          {/* Button to create a new voting session */}
          <Link href="/vote/new">
            <Button className="bg-green-100 text-green-800 hover:bg-green-300">
              New Voting Session
            </Button>
          </Link>
        </header>

        {/* Grid for voting session cards */}
        <section
          className="
            grid 
            grid-cols-1 
            gap-6 
            sm:grid-cols-2 
            lg:grid-cols-3
          "
        >
          {sessions.length > 0 ? (
            sessions.map((session) => (
              // Render the Client Component for each session
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