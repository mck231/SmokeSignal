// app/vote/new/page.tsx

import { VotingSessionForm } from "../components/VotingSessionForm";


export default function NewVotingSessionPage() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Voting Session</h1>
      <VotingSessionForm isNew={true} />
    </main>
  );
}
