import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20', // Ensure this is the correct API version you're using
});

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json();
    console.log("Plan received:", plan);

    const prices: Record<string, number> = {
      free: 0,
      premium: 499, // $4.99 in cents
      team: 1999,   // $19.99 in cents
    };

    // Validate the plan and ensure it exists
    if (prices[plan] === undefined) {  // Check if the plan exists
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    // Create a PaymentIntent with the specified amount for the selected plan
    const paymentIntent = await stripe.paymentIntents.create({
      amount: prices[plan],
      currency: 'usd',
      payment_method_types: ['card'],
    });

    // Send the client_secret to the frontend
    console.log("PaymentIntent created:", paymentIntent);
    return NextResponse.json({ client_secret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating PaymentIntent:", error);
    return NextResponse.json({ error: 'Payment failed. Please try again.' }, { status: 500 });
  }
}
