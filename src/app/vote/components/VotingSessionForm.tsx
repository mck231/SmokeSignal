"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type SessionData = {
  title: string;
  startDate: string;
  endDate: string;
  options: string[];
};

type VotingSessionFormProps = {
  isNew: boolean;
  sessionId?: string;        // Provided only if isNew=false
  initialData?: SessionData; // For editing existing session
};

export function VotingSessionForm({
  isNew,
  sessionId,
  initialData
}: VotingSessionFormProps) {
  const router = useRouter();

  // Pre-populate state if editing
  const [title, setTitle] = useState(initialData?.title || '');
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [options, setOptions] = useState<string[]>(
    initialData?.options || [''] // Start with one empty string if new
  );

  // Handlers for dynamic options array
  const handleAddOption = () => setOptions((prev) => [...prev, '']);
  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };
  const handleOptionChange = (index: number, value: string) => {
    setOptions((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const dataToSave: SessionData = {
      title,
      startDate,
      endDate,
      options
    };

    // Here you’d do an API call or a server action
    if (isNew) {
      // POST /api/sessions or similar
      console.log('Creating new session...', dataToSave);
      // Suppose we get a new ID from the server -> redirect to /vote/<newId> or /vote
    } else {
      // PATCH /api/sessions/[sessionId] or similar
      console.log(`Updating session ${sessionId}...`, dataToSave);
    }

    // For now, just push back to the main /vote dashboard
    router.push('/vote');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {/* Title */}
      <div>
        <label className="block font-semibold mb-1">Title</label>
        <input
          type="text"
          className="border border-gray-300 rounded w-full p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Start Date */}
      <div>
        <label className="block font-semibold mb-1">Start Date</label>
        <input
          type="date"
          className="border border-gray-300 rounded w-full p-2"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </div>

      {/* End Date */}
      <div>
        <label className="block font-semibold mb-1">End Date</label>
        <input
          type="date"
          className="border border-gray-300 rounded w-full p-2"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
      </div>

      {/* Options */}
      <div>
        <label className="block font-semibold mb-1">Voting Options</label>
        {options.map((option, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              type="text"
              className="border border-gray-300 rounded w-full p-2"
              value={option}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              required
            />
            {options.length > 1 && (
              <button
                type="button"
                className="text-red-600 font-bold"
                onClick={() => handleRemoveOption(idx)}
              >
                X
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddOption}
          className="bg-blue-500 text-white py-1 px-3 rounded"
        >
          Add Option
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="bg-green-600 text-white py-2 px-4 rounded font-semibold"
      >
        {isNew ? 'Create Session' : 'Save Changes'}
      </button>
    </form>
  );
}