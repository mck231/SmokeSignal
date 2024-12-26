// app/vote/page.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button" 

type VotingSession = {
  id: string
  title: string
  status: "ongoing" | "ended"
  createdAt: string
}

async function getAllVotingSessions(): Promise<VotingSession[]> {
  // Replace with your actual data-fetching logic
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
  ]
}

export default async function VoteDashboardPage() {
  const sessions = await getAllVotingSessions()
  return (
    <main className="min-h-screen w-full bg-gray-50 p-6">
      {/* A responsive container that grows up to a certain max width */}
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Voting Dashboard</h1>

          {/* Button to create a new voting session */}
          <Link href="/vote/new">
            <Button className="bg-green-100 text-green-800 hover:bg-green-300">New Voting Session</Button>
          </Link>
        </header>

        {/* A responsive grid for the voting session “cards” */}
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
                <div
                key={session.id}
                className="
                  rounded-md border border-gray-200 bg-white p-4 shadow-sm
                  flex flex-col justify-between
                "
              >
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {session.title}
                  </h2>
                  <p>Status: {session.status}</p>
                  <p>Created At: {session.createdAt}</p>
                </div>
              
                <Link href={`/vote/${session.id}`} className="mt-4">
                  <Button className="bg-blue-100 text-blue-800 hover:bg-blue-300">
                    View Session
                  </Button>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No voting sessions found.</p>
          )}
        </section>
      </div>
    </main>
  )
}
