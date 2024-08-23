import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

export async function GET(request: Request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await client.connect();
        const database = client.db('chatbotDB');
        const collection = database.collection('conversations');

        // Find the latest conversation for the given userId
        const latestConversation = await collection.findOne(
            { userId },
            { sort: { conversationId: -1 } }
        );

        if (latestConversation) {
            console.log('Latest Conversation ID:', latestConversation);
            return NextResponse.json(latestConversation, { status: 200 });
        } else {
            return NextResponse.json({ message: 'No conversations found for this user' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error retrieving conversation:', error);
        return NextResponse.json({ error: 'Error retrieving conversation' }, { status: 500 });
    } finally {
        await client.close();
    }
}
