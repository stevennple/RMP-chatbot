import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// Replace with environment variables before deployment
const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, conversationId, newMessages } = body;

  try {
      await client.connect();
      const database = client.db('chatbotDB');
      const collection = database.collection('conversations');

      const result = await collection.updateOne(
          { conversationId, userId },
          {
              $push: { messages: newMessages },
              $set: { updatedAt: new Date() },
          },
          { upsert: true }
      );

      console.log('Existing conversation updated');
      return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
      console.error('Error updating conversation:', error);
      return NextResponse.json({ error: 'Error updating conversation' }, { status: 500 });
  } finally {
      await client.close();
  }
}

/* export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    try {
        await client.connect();
        const database = client.db('chatbotDB');
        const collection = database.collection('conversations');

        const conversations = await collection.find({ userId }).toArray();
        return NextResponse.json(conversations, { status: 200 });
    } catch (error) {
        console.error('Error retrieving conversations:', error);
        return NextResponse.json({ error: 'Error retrieving conversations' }, { status: 500 });
    } finally {
        await client.close();
    }
} */
