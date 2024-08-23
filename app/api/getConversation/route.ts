import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

export async function GET(request: Request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const conversationId = url.searchParams.get('conversationId');
    
    console.log('userId:', userId);
    console.log('conversationId:', conversationId);

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!conversationId) {
        return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    try {
        await client.connect();
        const database = client.db('chatbotDB');
        const collection = database.collection('conversations');

        const conversation = await collection.findOne({
            conversationId: conversationId,
            userId: userId,
        });

        if (conversation) {
            const messages = conversation.messages || [];
            console.log('Data being sent back: ', messages);
            return NextResponse.json(messages, { status: 200 });
        } else {
            return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error retrieving conversation:', error);
        return NextResponse.json({ error: 'Error retrieving conversation' }, { status: 500 });
    } finally {
        await client.close();
    }
}
