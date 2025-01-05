// app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/me', {
          method: 'GET',
          credentials: 'include', // Include cookies
        });
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
          router.push('/auth/login'); // Redirect to login if not authenticated
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
        router.push('/auth/login'); // Redirect to login on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (isLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!user) {
    return null; // Redirecting to login
  }

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-white shadow-md rounded">
      <h1 className="text-3xl font-semibold mb-6">Profile</h1>
      <div className="space-y-4">
        <div>
          <span className="font-medium">First Name:</span> {user.firstName}
        </div>
        <div>
          <span className="font-medium">Last Name:</span> {user.lastName}
        </div>
        <div>
          <span className="font-medium">Username:</span> {user.username}
        </div>
        <div>
          <span className="font-medium">Email:</span> {user.email || 'N/A'}
        </div>
      </div>
      <div className="mt-6">
        <Link href="/">
          <Button>Go to Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default ProfilePage;
