import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  try {
    const { plan, userId } = await req.json(); // Assuming the userId is passed in the request body
    console.log("Plan received:", plan);

    const prices: Record<string, number> = {
      starter: 0,
      pro: 2999, // $29.99 in cents
    };

    // Validate the plan and ensure it exists
    if (!prices[plan]) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    // Create a Checkout Session with the specified amount for the selected plan
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
            },
            unit_amount: prices[plan],
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:3000/dashboard?session_id={CHECKOUT_SESSION_ID}&user_id=${userId}&plan=${plan}`,
      cancel_url: 'http://localhost:3000/subscription',
      metadata: {
        userId, // Pass the userId to the session's metadata
        plan, // Store the plan in metadata to identify which plan was purchased
      },
    });

    // Send the session ID to the frontend
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}


//////////////////////////////////////////////////////////

// For custom payment integration

/* import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20', // Make sure to use the correct Stripe API version
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
    if (!prices[plan]) {
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
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}
 */