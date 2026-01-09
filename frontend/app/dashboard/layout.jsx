'use client';

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import axios from "axios";
import DashboardSidebar from "../../components/dashboard/Sidebar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardLayout({ children }) {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      syncUserWithBackend();
    }
  }, [isLoaded, user]);

  const syncUserWithBackend = async () => {
    try {
      await axios.post(`${API_URL}/users`, {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || user.firstName || 'Unknown',
      });
      console.log('✅ User synced with backend');
    } catch (err) {
      console.error('❌ User sync failed:', err.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
