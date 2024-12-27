"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

const LoginPage: React.FC = () => {
  const form = useForm<{ username: string; password: string }>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (values: { username: string; password: string }) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
      const data = await response.json()
      if (data.success) {
        // Handle successful login
        console.log('Login successful')
      } else {
        form.setError('username', { message: 'Invalid username or password' })
        form.setError('password', { message: 'Invalid username or password' })
      }
    } catch (err: unknown) {
      form.setError('username', { message: 'An error occurred. Please try again.' + err })
      form.setError('password', { message: 'An error occurred. Please try again.' + err })
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 rounded-lg bg-white shadow-md space-y-8 w-[350px]">
          <h2 className="text-2xl mb-4">Login</h2>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Username" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
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
          <Button type="submit">Login</Button>
        </form>
      </Form>
    </div>
  )
}

export default LoginPage