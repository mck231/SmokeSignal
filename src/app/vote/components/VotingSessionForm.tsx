"use client"

import React from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { addDays, format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { DateRange } from "react-day-picker"

// 1) Zod schema with "options" as an array of objects
//    and "startDate"/"endDate" as strings (we'll store them manually).
const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().optional(),
  startDate: z.string().nonempty("Start date is required."),
  endDate: z.string().nonempty("End date is required."),
  options: z
    .array(z.object({ value: z.string().min(1, "Option must not be empty.") }))
    .min(1, "At least one option is required."),
})

type VotingSessionFormValues = z.infer<typeof formSchema>

export default function VotingSessionForm() {
  // Local state for the date picker
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(2022, 0, 20),
    to: addDays(new Date(2022, 0, 20), 20),
  })

  // useForm with defaultValues
  const form = useForm<VotingSessionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: "", // initially empty
      endDate: "",
      options: [{ value: "" }],
    },
  })

  // Field array for "options"
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  })

  // Called when the user picks a new date range in the calendar
  function handleRangeSelect(range: DateRange | undefined) {
    setDateRange(range)
    // If "from" is defined, convert to string (yyyy-MM-dd or any format you like)
    if (range?.from) {
      form.setValue("startDate", format(range.from, "yyyy-MM-dd"))
    } else {
      form.setValue("startDate", "")
    }
    // If "to" is defined, convert to string
    if (range?.to) {
      form.setValue("endDate", format(range.to, "yyyy-MM-dd"))
    } else {
      form.setValue("endDate", "")
    }
  }

  // onSubmit
  async function onSubmit(values: VotingSessionFormValues) {
    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await response.json()
      if (data.success) {
        console.log("Voting session created successfully")
      } else {
        form.setError("title", { message: "Failed to create voting session" })
      }
    } catch (err) {
      form.setError("title", {
        message: "An error occurred. Please try again. " + String(err),
      })
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-6 rounded-lg bg-white shadow-md space-y-6 w-[350px]"
        >
          <h2 className="text-2xl mb-2">Create Voting Session</h2>

          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Range Picker */}
          <div className="space-y-1">
            <FormLabel className="mb-1">Date Range</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleRangeSelect}
                  numberOfMonths={2}
                  className="bg-white"
                />
                <Button className="w-full" onClick={() => handleRangeSelect}>Done</Button>
              </PopoverContent>
            </Popover>
            {/* We won't render these, but if you want to show them for debugging: */}
            <div className="text-sm text-gray-600">
              Start: {form.watch("startDate") || "none"} <br />
              End: {form.watch("endDate") || "none"}
            </div>
          </div>

          {/* Voting Options */}
          <div>
            <FormLabel>Voting Options</FormLabel>
            {fields.map((field, idx) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`options.${idx}.value`}
                render={({ field }) => (
                  <FormItem className="mt-2 mb-2">
                    <FormControl>
                      <Input placeholder={`Option ${idx + 1}`} {...field} />
                    </FormControl>
                    <FormMessage />
                    {/* Remove button if there's more than 1 option */}
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => remove(idx)}
                        className="mb-2 mt-2 bg-red-300 text-black hover:bg-red-500 hover:text-white"
                      >
                        Remove
                      </Button>
                    )}
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              onClick={() => append({ value: "" })}
              className=" mt-2 bg-blue-300 text-black hover:bg-blue-500 hover:text-white"
            >
              Add Option
            </Button>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="bg-green-300 text-black hover:bg-green-500 hover:text-white"
          >
            Create Voting Session
          </Button>
        </form>
      </Form>
    </div>
  )
}
