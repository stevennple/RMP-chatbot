import { NextResponse } from 'next/server';
import { connectToFlashcardDB } from '@/app/lib/mongodb-client-flashcard';
import { UpdateFilter } from 'mongodb';

interface Flashcard {
    front: string;
    back: string;
}

interface DeckDocument {
    userId: string;
    flashcardId: string;
    updatedAt: Date;
    flashcards: Flashcard[] | Record<string, Flashcard[]>;  // Allow either array or object format
}

export async function POST(req: Request) {
    try {
        const { flashcards, userId, deckName } = await req.json();

        if (!userId || !deckName || !flashcards) {
            return NextResponse.json({ error: 'Missing userId, deckName, or flashcards' }, { status: 400 });
        }

        const db = await connectToFlashcardDB();
        const collection = db.collection<DeckDocument>('decks');

        // Update the existing deck with the provided flashcards
        const updateFilter: UpdateFilter<DeckDocument> = {
            $set: {
                updatedAt: new Date(),
                flashcards: flashcards  // Store the entire JSON object
            }
        };
        const result = await collection.updateOne(
            { userId, flashcardId: deckName },
            updateFilter,
            { upsert: true }
        );

        if (result.modifiedCount > 0 || result.upsertedCount > 0) {
            console.log('Deck updated with new flashcards');
            return NextResponse.json({ success: true }, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Failed to update deck with flashcards' }, { status: 500 });
        }

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e.message }), { status: e.status ?? 500 });
    }
}
