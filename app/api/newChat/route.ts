import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

export async function GET(request: Request) {
    const userId = request.headers.get('userID');

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await client.connect();
        const database = client.db('chatbotDB');
        const collection = database.collection('conversations');

        const latestConversation = await collection.findOne(
            { userId },
            { sort: { conversationId: -1 } }
        );

        let newConversationId = "chat 1";

        if (latestConversation) {
            const lastId = latestConversation.conversationId;
            const lastNumber = parseInt(lastId.split(" ")[1], 10);
            newConversationId = `chat ${lastNumber + 1}`;
        }

        // Create a new document
        const newConversation = {
            userId,
            conversationId: newConversationId,
            messages: [],
            createdAt: new Date()
        };

        // Insert the new document
        const result = await collection.insertOne(newConversation);

        if (result.acknowledged) {
            return NextResponse.json({ newConversationId }, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Failed to create new conversation' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error creating new conversation:', error);
        return NextResponse.json({ error: 'Error creating new conversation' }, { status: 500 });
    } finally {
        await client.close();
    }
}
