"use client";

import { useEffect } from 'react';

export default function VotingClient({ sessionId }: { sessionId: string }) {
  useEffect(() => {
    // Connect to WebSocket
    // Example: socket.emit('joinSession', sessionId);

    return () => {
      // socket.disconnect();
    };
  }, [sessionId]);

  const handleVote = (option: string) => {
    // socket.emit('castVote', { sessionId, option });
    console.warn(option)
  };

  return (
    <div>
      <p>Real-time voting interface for session {sessionId}</p>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        onClick={() => handleVote('Option A')}
      >
        Vote for A
      </button>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => handleVote('Option B')}
      >
        Vote for B
      </button>
      {/* etc. */}
    </div>
  );
}
