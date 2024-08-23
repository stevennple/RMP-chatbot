'use client';
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeProviderWrapperProps {
  children: React.ReactNode;
  clientSecret: string;
}

const StripeProviderWrapper: React.FC<StripeProviderWrapperProps> = ({ children, clientSecret }) => {
  const options = { clientSecret };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

export default StripeProviderWrapper;
