// app/vote/[sessionId]/page.tsx

import VotingClient from "./VotingClient";

export default async function VotingSessionPage({
  params,
}: {params: Promise<{ sessionId: string }>}) {  
  const session = (await params).sessionId;
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Voting Session {session}
      </h1>
      <VotingClient sessionId={session} />
    </main>
  );
}
