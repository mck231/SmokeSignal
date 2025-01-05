// app/auth/register/page.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First name must be at least 2 characters.',
  }),
  lastName: z.string().min(2, {
    message: 'Last name must be at least 2 characters.',
  }),
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  email: z
    .string()
    .email({
      message: 'Invalid email address.',
    })
    .optional(),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

type FormData = z.infer<typeof formSchema>;

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
    },
  });

  const { handleSubmit, setError } = form;

  const onSubmit = async (values: FormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Handle successful registration (e.g., redirect to login)
        console.warn({
          title: 'Registration successful!',
          description: 'You can now log in with your credentials.',
        });
        router.push('/auth/login'); // Adjust the path as needed
      } else {
        // Handle errors
        if (data.errors) {
          //data.errors.forEach((err: unknown) => {
            //setError(err.path as keyof FormData, { message: err.message });
          //});
        } else {
          setError('username', { message: data.message || 'Registration failed.' });
        }
      }
    } catch (error: unknown) {
      setError('username', { message: 'An error occurred. Please try again.' + String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 rounded-lg bg-white shadow-md space-y-8 w-[350px]"
        >
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
                <FormDescription>
                  Enter your first name.
                </FormDescription>
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
                <FormDescription>
                  Enter your last name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username" // Changed from 'userName' to 'username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Username" {...field} />
                </FormControl>
                <FormDescription>
                  Choose a unique username.
                </FormDescription>
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
                <FormDescription>
                  Enter your email address.
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
                <FormDescription>
                  Choose a strong password.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RegisterPage;
