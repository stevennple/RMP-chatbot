import { NextResponse } from 'next/server';
// import { MongoClient } from 'mongodb';
import { connectToFlashcardDB } from '@/app/lib/mongodb-client-flashcard';


/* const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri); */

export async function POST(request: Request) {
    try {
        const { userId, deckName, color, description } = await request.json(); 
        console.log('Full request body:', JSON.stringify(request.body, null, 2));

        if (!userId || !deckName || !color || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!userId || !deckName || !color || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = await connectToFlashcardDB();
        const collection = db.collection('decks');

        // Check if the deck with the same name already exists for the user
        const existingDeck = await collection.findOne({ userId, flashcardId: deckName });

        if (existingDeck) {
            return NextResponse.json({ error: 'Deck with the same name already exists' }, { status: 409 });
        }

        // Create a new deck document
        const newDeck = {
            userId,
            flashcardId: deckName,
            color,
            description,
            createdAt: new Date(),
        };

        // Insert the new deck document
        const result = await collection.insertOne(newDeck);

        if (result.acknowledged) {
            return NextResponse.json({ flashcardId: deckName }, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Failed to create new deck' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error creating new deck:', error);
        return NextResponse.json({ error: 'Error creating new deck' }, { status: 500 });
    }
}
