// app/auth/login/page.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

const formSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

type FormData = z.infer<typeof formSchema>;

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // New state for auth check

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const { handleSubmit, setError } = form;

  useEffect(() => {
    // Function to check if the user is already authenticated
    const checkAuthentication = async () => {
      try {
        const response = await fetch('/api/me', {
          method: 'GET',
          credentials: 'include', // Include cookies
          cache: 'no-store',      // Prevent caching to always fetch fresh data
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            // User is authenticated, redirect to /vote
            router.push('/vote');
          }
        } else {
          console.error('Failed to verify authentication status.');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsCheckingAuth(false); // Auth check complete
      }
    };

    checkAuthentication();
  }, [router]);

  const onSubmit = async (values: FormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Successful login
        // Optionally, display a success message or toast notification here
        console.warn({
          title: 'Login successful!',
          description: 'Redirecting to your dashboard...',
        });
        window.location.reload(); // Reload the page to update AuthButtons
      } else {
        // Handle authentication errors
        setError('username', {
          message: data.message || 'Invalid username or password.',
        });
        setError('password', {
          message: data.message || 'Invalid username or password.',
        });
      }
    } catch (error: unknown) {
      // Handle network or unexpected errors
      setError('username', {
        message: 'An error occurred. Please try again.',
      });
      setError('password', {
        message: 'An error occurred. Please try again.',
      });
      console.error('Login Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    // Optionally, display a loading spinner while checking authentication
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 rounded-lg bg-white shadow-md space-y-8 w-[350px]"
        >
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
                  Enter your registered username.
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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginPage;
