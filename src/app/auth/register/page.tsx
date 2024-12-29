"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  userName: z.string().min(2, {
    message: "User name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }).optional(),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

const RegisterPage: React.FC = () => {
  const form = useForm<{ firstName: string; lastName: string; userName: string; email?: string; password: string }>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (values: { firstName: string; lastName: string; userName: string; email?: string; password: string }) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
      const data = await response.json()
      if (data.success) {
        // Handle successful registration
        console.log('Registration successful')
      } else {
        form.setError('email', { message: 'Registration failed' })
      }
    } catch (err: unknown) {
      form.setError('email', { message: 'An error occurred. Please try again.' + err })
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 rounded-lg bg-white shadow-md space-y-8 w-[350px]">
          <h2 className="text-2xl mb-4">Register</h2>
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Name</FormLabel>
                <FormControl>
                  <Input placeholder="User Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (optional)</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="alice@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Register</Button>
        </form>
      </Form>
    </div>
  )
}

export default RegisterPage