// app/vote/[sessionId]/page.tsx

import VotingClient from "./VotingClient";

export default async function VotingSessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  // Possibly fetch session details
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Voting Session {params.sessionId}
      </h1>
      <VotingClient sessionId={params.sessionId} />
    </main>
  );
}
