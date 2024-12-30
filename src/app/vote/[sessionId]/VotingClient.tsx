"use client"

import * as React from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// 1) Define a Zod schema for the form
const formSchema = z.object({
  // The user must pick exactly one option
  selectedOption: z.string().min(1, "You must choose an option"),
})

// 2) Infer the type from the schema
type FormType = z.infer<typeof formSchema>

interface VotingClientProps {
  sessionId: string
}

export default function VotingClient({ sessionId }: VotingClientProps) {
  const [options, setOptions] = React.useState<string[]>([])

  // Example: fetch voting options from your backend or socket
  React.useEffect(() => {
    async function fetchOptions() {
      // For demonstration, we’ll just use a static list
      const data = ["Neon Pizza", "Neon Tacos", "Neon Sushi"]
      setOptions(data)
    }
    fetchOptions()
  }, [])

  // 3) Create form instance
  const methods = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedOption: "", // none selected initially
    },
  })

  const { watch, handleSubmit, setValue } = methods

  // 4) On submit, handle the vote (websocket, API call, etc.)
  async function onSubmit(values: FormType) {
    const { selectedOption } = values
    console.log("User voted:", selectedOption)
    // e.g. socket.emit('castVote', { sessionId, option: selectedOption });
  }

  // 5) Current selected option from react-hook-form
  const currentSelection = watch("selectedOption")

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
        <p className="mb-2 font-medium">
          Real-time voting interface for session {sessionId}
        </p>
        <p>Current: {currentSelection || "(none)"}</p>

        {/* 
          RadioGroup:
          - Use `value` + `onValueChange` for controlled selection.
        */}
        <RadioGroup
          value={currentSelection}
          onValueChange={(value) => setValue("selectedOption", value)}
          className="flex flex-col gap-4"
        >
          {options.map((opt, idx) => {
            // Check if this option is currently selected
            const isSelected = currentSelection === opt

            return (
              // Each "option" is a FormItem-like block
              <div key={opt} className="relative">
                {/* 
                  The actual radio input. We "hide" it with classes, 
                  but keep it in the DOM so RadioGroup can control selection.
                */}
                <RadioGroupItem
                  value={opt}
                  id={`option-${idx}`}
                  className="sr-only" // "sr-only" hides visually but is accessible
                />

                {/* 
                  The entire label is clickable because it references the input's `id`.
                  We do NOT set `onClick` here, to avoid manual conflicts.
                */}
                <label
                  htmlFor={`option-${idx}`}
                  className={cn(
                    "block cursor-pointer border-2 rounded-md p-4 transition-all",
                    "text-lg font-semibold hover:border-blue-300 hover:bg-blue-50",
                    // "Neon" effect if selected
                    isSelected &&
                      "border-cyan-400 bg-cyan-50 " +
                        "shadow-[0_0_8px_2px_rgba(0,255,255,0.6)]"
                  )}
                >
                  {`${idx + 1}. ${opt}`}
                </label>
              </div>
            )
          })}
        </RadioGroup>

        <div>
          <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">
            Submit Vote
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
