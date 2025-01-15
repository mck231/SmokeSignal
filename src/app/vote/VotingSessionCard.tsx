// app/vote/VotingSessionCard.tsx

"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cog } from "lucide-react";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

const calculateStatus = (startTime: string, endTime: string): "ongoing" | "ended" => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now >= start && now <= end) {
    return "ongoing";
  } else {
    return "ended";
  }
};

type VotingSession = {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  slideIds: string[];
  assignedGroupIds: string[];
  createdAt: string;
};

const useSessionStatus = (startTime: string, endTime: string) => {
  const [status, setStatus] = useState<"ongoing" | "ended">(calculateStatus(startTime, endTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(calculateStatus(startTime, endTime));
    }, 60000); // Update status every minute

    return () => clearInterval(interval);
  }, [startTime, endTime]);

  return status;
};

interface VotingSessionCardProps {
  session: VotingSession;
}

export function VotingSessionCard({ session }: VotingSessionCardProps) {
  const router = useRouter();

  // Handler for Cog icon click
  const handleCogClick = () => {
    // Navigate to the settings page
    router.push(`/vote/${session.id}/settings`);
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
        <p className="text-sm text-gray-600">Status: { useSessionStatus(session.startTime, session.endTime) }</p>
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