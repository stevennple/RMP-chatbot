import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { connectToFlashcardDB } from '@/app/lib/mongodb-client-flashcard';

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

export async function GET(request: Request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const flashcardId = url.searchParams.get('flashcardId');
    
    console.log('userId:', userId);
    console.log('conversationId:', flashcardId);

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!flashcardId) {
        return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    try {
        const db = await connectToFlashcardDB();
        const collection = db.collection('decks');

        const data = await collection.findOne({
            flashcardId: flashcardId,
            userId: userId,
        });

        if (data) {
            //const questions = data.flashcards || [];
            //console.log('Data being sent back: ', questions);
            return NextResponse.json(data, { status: 200 });
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
