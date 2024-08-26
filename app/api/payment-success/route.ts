import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToChatDB } from '@/app/lib/mongodb-client-chat';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  try {
    // Parse the JSON body of the request
    const { session_id, user_id, plan } = await req.json();

    console.log("Payment success for user:", user_id);
    console.log("Plan purchased:", plan);
    console.log("Session payment status:", session_id);

    if (!session_id || !user_id || !plan) {
      return NextResponse.json({ error: 'Missing session_id, user_id, or plan' }, { status: 400 });
    }

    // Retrieve the session to verify the payment was successful
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // Connect to the database
    const db = await connectToChatDB();
    const userLimitsCollection = db.collection('userLimits');

    // Determine the new character limit based on the plan
    let newCharacterLimit = 10000; // Default for starter plan
    if (plan === 'pro') {
      newCharacterLimit = 1000000; // 1 million characters for pro plan
    }

    // Update the user's character limit in the database
    await userLimitsCollection.updateOne(
      { userId: user_id },
      { $set: { characterLimit: newCharacterLimit } }
    );

    console.log(`Character limit updated to ${newCharacterLimit} for userId: ${user_id}`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in payment success handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
