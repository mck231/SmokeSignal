// components/AuthButtons.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

const AuthButtons: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/me', {
          method: 'GET',
          credentials: 'include', // Include cookies
          cache: 'no-cache',
        });
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUser(null);
        router.push('/'); // Redirect to home or login page
      } else {
        console.error('Logout failed:', data.message);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <>
      {!user ? (
        <>
          <Link href="/auth/login">
            <Button className="bg-blue-100 text-blue-800 hover:bg-blue-300">
              Login
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="bg-blue-100 text-blue-800 hover:bg-blue-300">
              Register
            </Button>
          </Link>
        </>
      ) : (
        <>
          <Link href="/auth/profile">
            <Button className="bg-green-100 text-green-800 hover:bg-green-300">
              Profile
            </Button>
          </Link>
          <Button
            onClick={handleLogout}
            className="bg-red-100 text-red-800 hover:bg-red-300"
          >
            Logout
          </Button>
        </>
      )}
    </>
  );
};

export default AuthButtons;
