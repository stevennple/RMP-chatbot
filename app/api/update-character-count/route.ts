import { NextResponse } from 'next/server';
import { connectToChatDB } from '@/app/lib/mongodb-client-chat';
import { ObjectId, WithId, Document } from 'mongodb';

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, newMessageContent } = body; // Expecting only userId and newMessageContent from the request

  try {
    // Connect to the database
    const db = await connectToChatDB();
    const userLimitsCollection = db.collection('userLimits');

    // Fetch the user's current character usage and limit from the userLimits collection
    let userLimit: WithId<Document> | null = await userLimitsCollection.findOne({ userId });

    if (!userLimit) {
      // If the user does not have an entry in the userLimits collection, create one with default values
      userLimit = {
        _id: new ObjectId(),
        userId,
        totalCharactersUsed: 0,
        characterLimit: 10000 // Assuming a default character limit
      };
      await userLimitsCollection.insertOne(userLimit);
    }

    const newMessageLength = newMessageContent.length;

    // Calculate the total characters used after adding the new message
    const totalCharactersUsed = userLimit.totalCharactersUsed + newMessageLength;

    // Check if the total character count exceeds the limit
    if (totalCharactersUsed > parseInt(userLimit.characterLimit, 10)) {
      return NextResponse.json({ exceeded: true, totalCharactersUsed }, { status: 400 });
    }

    // Increment the user's totalCharactersUsed by the length of the new message
    await userLimitsCollection.updateOne(
      { userId },
      { $inc: { totalCharactersUsed: newMessageLength } }
    );

    console.log('User character limit updated');

    return NextResponse.json({ success: true, totalCharactersUsed }, { status: 200 });
  } catch (error) {
    console.error('Error updating user limit:', error);
    return NextResponse.json({ error: 'Error updating user limit' }, { status: 500 });
  }
}
