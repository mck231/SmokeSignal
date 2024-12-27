"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"

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

type VotingSessionFormValues = {
  title: string
  description?: string
  startDate: string
  endDate: string
  options: string[]
}

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  startDate: z.string().nonempty({
    message: "Start date is required.",
  }),
  endDate: z.string().nonempty({
    message: "End date is required.",
  }),
  options: z.array(z.string().min(1, {
    message: "Option must not be empty.",
  })).min(1, {
    message: "At least one option is required.",
  }),
})

const VotingSessionForm: React.FC = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      options: [""],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  })

  const onSubmit = async (values: VotingSessionFormValues) => {
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
      const data = await response.json()
      if (data.success) {
        // Handle successful voting session creation
        console.log('Voting session created successfully')
      } else {
        form.setError('title', { message: 'Failed to create voting session' })
      }
    } catch (err: unknown) {
      form.setError('title', { message: 'An error occurred. Please try again.' + err })
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 rounded-lg bg-white shadow-md space-y-8 w-[350px]">
          <h2 className="text-2xl mb-4">Create Voting Session</h2>
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
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <FormLabel>Voting Options</FormLabel>
            {fields.map((field, idx) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`options.${idx}`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder={`Option ${idx + 1}`} {...field} />
                    </FormControl>
                    <FormMessage />
                    {fields.length > 1 && (
                      <Button type="button" onClick={() => remove(idx)} className="text-red-600 font-bold">
                        Remove
                      </Button>
                    )}
                  </FormItem>
                )}
              />
            ))}
            <Button type="button" onClick={() => append("")} className="bg-blue-500 text-white py-1 px-3 rounded">
              Add Option
            </Button>
          </div>
          <Button type="submit" className="bg-green-600 text-white py-2 px-4 rounded font-semibold">
            Create Voting Session
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default VotingSessionForm