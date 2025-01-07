// app/vote/components/VotingSessionForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { VotingSession, Vote } from "@/types"; // Import the VotingSession and Vote types

// Define the Zod schema
const sessionSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start time.",
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end time.",
  }),
  assignedGroupIds: z.array(z.string()).optional(),
  slideIds: z.string().min(1, { message: "At least one slide ID is required." }), // String for comma-separated input
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface VotingSessionFormProps {
  session?: VotingSession;
  slides?: string[];
  votes?: Vote[];
}

const VotingSessionForm: React.FC<VotingSessionFormProps> = ({ session }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues: SessionFormData = {
    title: session?.title || "",
    description: session?.description || "",
    startTime: session?.startTime || "",
    endTime: session?.endTime || "",
    assignedGroupIds: session?.assignedGroupIds || [],
    slideIds: session?.slideIds.join(", ") || "", // Corrected transformation
  };

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues,
  });

  const { handleSubmit, setError } = form;

  const onSubmit = async (values: SessionFormData) => {
    setIsLoading(true);
    try {
      // Convert comma-separated slide IDs into an array
      const slideIdsArray = values.slideIds
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

      // Prepare the payload
      const payload = {
        ...values,
        slideIds: slideIdsArray,
      };

      // Determine if it's a create or update operation
      const method = session ? "PUT" : "POST";
      const url = session
        ? `/api/updateSession/${session.id}`
        : `/api/createSession`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log({
          title: "Session saved successfully!",
          description: "Redirecting to the session page...",
        });
        const sessionId = data.sessionId || session?.id;
        router.push(`/vote/${sessionId}`);
      } else {
        // Handle errors
        if (data.errors) {
          data.errors.forEach((err: { path: string; message: string }) => {
            setError(err.path as keyof SessionFormData, { message: err.message });
          });
        } else if (data.message) {
          setError("title", { message: data.message });
        } else {
          setError("title", { message: "Session save failed." });
        }
      }
    } catch (error: unknown) {
      setError("title", { message: "An error occurred. Please try again." });
      console.error("Session Save Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 rounded-lg bg-white shadow-md space-y-8 w-full max-w-lg"
        >
          <h2 className="text-2xl mb-4">
            {session ? "Edit Voting Session" : "Create Voting Session"}
          </h2>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Session Title" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the title for the voting session.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Session Description" {...field} />
                </FormControl>
                <FormDescription>
                  Enter a detailed description for the session.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormDescription>
                  Set the start time for the session.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormDescription>
                  Set the end time for the session.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Optionally, allow selecting multiple groups */}
          {/* 
          <FormField
            control={form.control}
            name="assignedGroupIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign to Groups</FormLabel>
                <FormControl>
                  <Select multiple {...field}>
                    <option value={DEFAULT_GROUP_ID}>Users</option>
                    {/* Add more group options as needed */}
                  {/* </Select>
                </FormControl>
                <FormDescription>
                  Select groups to assign this session to.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          */}
          <FormField
            control={form.control}
            name="slideIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slide IDs</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Comma-separated Slide IDs (e.g., slide1, slide2)"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter slide IDs separated by commas.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? session
                ? "Saving..."
                : "Creating..."
              : session
              ? "Save Changes"
              : "Create Session"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default VotingSessionForm;