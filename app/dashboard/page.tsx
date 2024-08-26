'use client';
import React, { useEffect, useState } from 'react';
import { TopNav } from '@/app/components/topNav';
import { withAuth } from '@/app/utils/withAuth';
import { Toaster } from "@/app/components/ui/toaster";
import { useSearchParams } from 'next/navigation';

function DashboardHome() {
  const searchParams = useSearchParams();

  // State to store query parameters
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);

  // Fetch query parameters and set them in state
  useEffect(() => {
    const session_id = searchParams.get('session_id');
    const user_id = searchParams.get('user_id');
    const plan = searchParams.get('plan');

    console.log("FROM client Payment success for user:", user_id);
    console.log("FROM client Plan purchased:", plan);
    console.log("FROM client Session payment status:", session_id);

    if (session_id && user_id && plan) {
      setSessionId(session_id);
      setUserId(user_id);
      setPlan(plan);
    }
  }, [searchParams]);

  // Handle the API call once query parameters are set
  useEffect(() => {
    if (sessionId && userId && plan) {
      handlePaymentSuccess(sessionId, userId, plan);
    }
  }, [sessionId, userId, plan]);

  const handlePaymentSuccess = async (sessionId: string, userId: string, plan: string) => {
    try {
      const response = await fetch('/api/payment-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId,
          plan: plan,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process payment success.');
      }

      const data = await response.json();
      if (data.success) {
        console.log('Payment success handled successfully');
      } else {
        console.error('Error in handling payment success:', data.error);
      }
    } catch (error) {
      console.error('Error in handlePaymentSuccess:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <TopNav />
      <Toaster />
      <div className="flex flex-1 justify-center items-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to Your Dashboard</h1>
          <p className="mb-4">Select an option from the sidebar to get started.</p>
          <div className="flex justify-center space-x-4">
            {/* Placeholder for other buttons */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(DashboardHome);
