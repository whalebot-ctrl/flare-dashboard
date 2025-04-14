'use client';

import { useEffect, useState } from 'react';
import ProfilePage from '@/components/profile-page';
import { Skeleton } from '@/components/ui/skeleton';

// Default profile data to use while loading or if there's an error
const defaultProfileData = {
  name: 'Guest User',
  username: 'guest',
  email: 'guest@example.com',
  phone: '',
  location: '',
  profileImage: '/placeholder.svg?height=96&width=96',
  isVerified: false,
};

export default function ProfilePageWrapper() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState(defaultProfileData);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        console.log('Fetching profile data...');

        const response = await fetch('/api/profile');

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API returned status ${response.status}: ${errorText}`);
          throw new Error(
            `Failed to fetch profile data: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();
        console.log('Profile data received:', data);
        setProfileData(data || defaultProfileData);
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data. Please try again later.');
        // Keep using the default data if there's an error
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="container py-6 md:py-10">
        <div className="mb-6 flex items-center">
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <Skeleton className="h-[500px] w-full" />
          <Skeleton className="h-[700px] w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6 md:py-10">
        <div className="p-4 bg-red-50 text-red-500 rounded-md">{error}</div>
        <div className="mt-4">
          <ProfilePage initialData={defaultProfileData} />
        </div>
      </div>
    );
  }

  return <ProfilePage initialData={profileData} />;
}
