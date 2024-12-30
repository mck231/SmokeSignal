// app/vote/VotingSessionCard.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cog } from "lucide-react";

type VotingSession = {
  id: string;
  title: string;
  status: "ongoing" | "ended";
  createdAt: string;
};

interface VotingSessionCardProps {
  session: VotingSession;
}

export function VotingSessionCard({ session }: VotingSessionCardProps) {
  // Handler for Cog icon click
  const handleCogClick = () => {
    // Implement your settings modal or navigation here
    console.log(`Cog clicked for session: ${session.id}`);
    // Example: Open a settings modal
    // setIsModalOpen(true);
  };

  return (
    <div
      className="
        rounded-md border border-gray-200 bg-white p-4 shadow-sm
        flex flex-col justify-between
        relative
      "
    >
      {/* Top Row: Title and Cog Icon */}
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold text-gray-800 flex-1 break-words">
          {session.title}
        </h2>
        {/* Cog Icon Button */}
        <button
          onClick={handleCogClick}
          className="ml-4 p-2 rounded-md hover:bg-gray-100 focus:outline-none"
          aria-label={`Settings for ${session.title}`}
        >
          <Cog className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Session Details */}
      <div className="mt-2">
        <p className="text-sm text-gray-600">Status: {session.status}</p>
        <p className="text-sm text-gray-600">
          Created At: {new Date(session.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* View Session Button */}
      <Link href={`/vote/${session.id}`} className="mt-4">
        <Button className="bg-blue-100 text-blue-800 hover:bg-blue-300">
          View Session
        </Button>
      </Link>
    </div>
  );
}
