'use client'
import React, { useState, useEffect } from 'react';
import { TopNav } from '@/app/components/topNav';
import { withAuth } from '@/app/utils/withAuth';
import { Toaster } from "@/app/components/ui/toaster";
import { Flashcard } from '@/app/components/flashcard';
import { useAuth, useUser } from '@clerk/nextjs';

interface FlashcardData {
  _id: string;
  userId: string;
  flashcardId: string;
  color: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

function DecksPage() {
  const { userId } = useAuth();
  const { user } = useUser();
  const [conversations, setConversations] = useState<FlashcardData[]>([]);

  // Fetch all flashcard decks
  const fetchAllConversations = async () => {
    try {
      const response = await fetch(`/api/getAllDecks?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: FlashcardData[] = await response.json();
        console.log('All Conversations received:', data);
        setConversations(data);
      } else {
        console.error('Failed to fetch conversations:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  /**
   * Fetch all conversations once.
   * Safeguard against fetching conversations when userId is not available.
   */
  useEffect(() => {
    if (userId) {
      fetchAllConversations();
    }
  }, [userId]);

  return (
    <div className="flex flex-col h-screen">
      <TopNav />
      <Toaster />
      
      {/* Header Section */}
      <div className="p-8 text-left">
        <h1 className="text-2xl font-semibold">Hi, {user!.firstName}</h1>
        <p className="text-gray-500">You&apos;ve got this!</p>
      </div>

      <div className="p-8">
        <div className="flex flex-wrap gap-4">
          {conversations.map((conversation) => (
            <Flashcard
              key={conversation._id}
              flashcardId={conversation.flashcardId}
              userId={conversation.userId}
              title={conversation.flashcardId} 
              description={conversation.description}
              color={conversation.color}
            />
          ))}

          {/* Floating Action Button */}
          {/* <button className="ml-8 bg-gray-300 rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default withAuth(DecksPage);
