// app/vote/slides/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {  Slide } from "@/types"; // Import necessary types
import { useRouter } from "next/navigation";

const SlidesManagementPage: React.FC = () => {
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [newSlideContent, setNewSlideContent] = useState("");

  useEffect(() => {
    // Fetch existing slides for the session
    const fetchSlides = async () => {
      try {
        const response = await fetch("/api/slides", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setSlides(data.slides);
        } else {
          console.error("Failed to fetch slides:", data.message);
        }
      } catch (error) {
        console.error("Error fetching slides:", error);
      }
    };

    fetchSlides();
  }, []);

  const handleAddSlide = async () => {
    if (!newSlideContent.trim()) return;

    try {
      const response = await fetch("/api/slides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newSlideContent }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSlides([...slides, data.slide]);
        setNewSlideContent("");
      } else {
        console.error("Failed to add slide:", data.message);
      }
    } catch (error) {
      console.error("Error adding slide:", error);
    }
  };

  const handleDeleteSlide = async (slideId: string) => {
    try {
      const response = await fetch(`/api/slides/${slideId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSlides(slides.filter((slide) => slide.id !== slideId));
      } else {
        console.error("Failed to delete slide:", data.message);
      }
    } catch (error) {
      console.error("Error deleting slide:", error);
    }
  };

  return (
    <main className="min-h-screen w-full bg-gray-50 p-6">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Slides Management</h1>
          <Button onClick={() => router.push("/vote")} className="bg-blue-100 text-blue-800 hover:bg-blue-300">
            Back to Dashboard
          </Button>
        </header>

        <section className="mb-6">
          <h2 className="text-2xl mb-4">Add New Slide</h2>
          <div className="flex space-x-2">
            <Input
              placeholder="Slide Content"
              value={newSlideContent}
              onChange={(e) => setNewSlideContent(e.target.value)}
            />
            <Button onClick={handleAddSlide} disabled={!newSlideContent.trim()}>
              Add Slide
            </Button>
          </div>
        </section>

        <section>
          <h2 className="text-2xl mb-4">Existing Slides</h2>
          {slides.length > 0 ? (
            <ul className="space-y-4">
              {slides.map((slide) => (
                <li key={slide.id} className="flex justify-between items-center p-4 bg-white rounded shadow">
                  <span>{slide.content}</span>
                  <Button
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="bg-red-100 text-red-800 hover:bg-red-300"
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No slides available. Add a new slide to get started.</p>
          )}
        </section>
      </div>
    </main>
  );
};

export default SlidesManagementPage;
