// app/vote/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VotingSessionCard } from "./VotingSessionCard"; // Import the Client Component

type VotingSession = {
  id: string;
  title: string;
  status: "ongoing" | "ended";
  createdAt: string;
};

// Simulated data-fetching function
async function getAllVotingSessions(): Promise<VotingSession[]> {
  // Replace this with your actual data-fetching logic, e.g., fetching from an API or database
  return [
    {
      id: "123",
      title: "Best Pizza Topping",
      status: "ongoing",
      createdAt: "2024-01-01",
    },
    {
      id: "456",
      title: "Favorite Programming Language",
      status: "ended",
      createdAt: "2024-01-02",
    },
    // Add more sessions as needed
  ];
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
