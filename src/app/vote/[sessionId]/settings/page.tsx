// app/vote/[sessionId]/settings/page.tsx

import { notFound } from "next/navigation";
import VotingSessionForm from "../../components/VotingSessionForm";
import { VotingSession, Vote } from "@/types"; // Import the VotingSession and Vote types

type VotingSessionData = {
  session: VotingSession;
  slides: string[];
  votes: Vote[]; // Properly typed votes
};

// Data-fetching function to get a specific session
async function getVotingSession(sessionId: string): Promise<VotingSessionData | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getSession/${sessionId}`, {
    // Adjust the base URL as needed
    cache: 'no-store',
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  if (data.success) {
    return {
      session: data.session,
      slides: data.slides,
      votes: data.votes,
    };
  }

  return null;
}

export default async function VoteSettingsPage({ params }: { params: { sessionId: string } }) {
  const { sessionId } = params;
  const sessionData = await getVotingSession(sessionId);

  if (!sessionData) {
    notFound(); // Triggers Next.js 404 page
  }

  const { session, slides, votes } = sessionData!;

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Session: {session.title}</h1>
      <VotingSessionForm session={session} slides={slides} votes={votes} />
    </main>
  );
}