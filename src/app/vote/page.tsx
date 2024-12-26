// app/vote/page.tsx (Server Component by default)
import Link from 'next/link';

type VotingSession = {
  id: string;
  title: string;
  status: 'ongoing' | 'ended';
  createdAt: string;
};

async function getAllVotingSessions(): Promise<VotingSession[]> {
  // Replace with your actual data-fetching logic.
  // This could be a DB query or an API call.
  return [
    { id: '123', title: 'Best Pizza Topping', status: 'ongoing', createdAt: '2024-01-01' },
    { id: '456', title: 'Favorite Programming Language', status: 'ended', createdAt: '2024-01-02' },
  ];
}

export default async function VoteDashboardPage() {
  const sessions = await getAllVotingSessions();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Voting Dashboard</h1>
      <section className="space-y-4">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <div key={session.id} className="border p-4 rounded-md bg-white">
              <h2 className="text-xl font-semibold">{session.title}</h2>
              <p>Status: {session.status}</p>
              <p>Created At: {session.createdAt}</p>

              {/* Link to the specific session page */}
              <Link 
                href={`/vote/${session.id}`} 
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                View Session
              </Link>
            </div>
          ))
        ) : (
          <p>No voting sessions found.</p>
        )}
      </section>
    </main>
  );
}
