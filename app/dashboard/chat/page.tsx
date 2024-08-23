// /app/dashboard/chat/page.tsx
'use client';
import Chat from '@/app/components/chat';
import { useSearchParams } from 'next/navigation';

export default function ChatPage() {
    const searchParams = useSearchParams();
    const conversationId = searchParams.get('id');
    console.log('Conversation ID from query params:', conversationId);

    if (!conversationId) {
        return <div>Please select a conversation</div>;
    }

    return <Chat conversationId={conversationId} />;
}
