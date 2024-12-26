// app/vote/[sessionId]/settings/page.tsx
import { notFound } from 'next/navigation';
import { VotingSessionForm } from '../../components/VotingSessionForm';

type VotingSessionRecord = Record<
  string, 
  { title: string; startDate: string; endDate: string; options: string[] }
>;

async function getVotingSession(sessionId: string) {
  const mockDb: VotingSessionRecord = {
    '123': {
      title: 'Best Pizza Topping',
      startDate: '2025-01-01',
      endDate: '2025-01-05',
      options: ['Pepperoni', 'Mushroom', 'Pineapple'],
    },
  };

  return mockDb[sessionId] || null;
}


export default async function VoteSettingsPage({
  params
}: {
  params: { sessionId: string };
}) {
  const { sessionId } = params;

  const sessionData = await getVotingSession(sessionId);
  if (!sessionData) {
    notFound(); // Triggers Next.js 404 page
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Session {sessionId}</h1>
      <VotingSessionForm
        isNew={false}
        sessionId={sessionId}
        initialData={sessionData}
      />
    </main>
  );
}

