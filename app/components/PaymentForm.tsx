'use client';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
import { useToast } from '@/app/components/ui/use-toast';
import { Button } from './ui/button';

type Plan = 'free' | 'premium' | 'team';
interface PaymentFormProps {
  plan: Plan;
  clientSecret?: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ plan, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  console.log("Client secret received:", clientSecret);

  // Ensure that we wait until clientSecret is available before rendering the PaymentElement
  useEffect(() => {
    if (!clientSecret) {
      toast({
        title: 'Error',
        description: 'ERROR NO CLIENT SECRET',
      });
      return;
    }

    // Fetch the PaymentIntent status
    if (stripe && clientSecret) {
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        switch (paymentIntent?.status) {
          case "succeeded":
            toast({
              title: 'Success',
              description: 'Payment succeeded!',
            });
            break;
          case "processing":
            toast({
              title: 'Processing',
              description: 'Your payment is processing.',
            });
            break;
          case "requires_payment_method":
            toast({
              title: 'Error',
              description: 'Your payment was not successful, please try again.',
            });
            break;
          default:
            toast({
              title: 'Error',
              description: 'Something went wrong.',
            });
            break;
        }
      });
    }
  }, [stripe, clientSecret, toast]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    // Confirm the PaymentIntent
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'https://chatbot-three-smoky.vercel.app/dashboard',
      },
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message || 'An unknown error occurred',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Payment confirmed!',
      });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button className="hover:text-slate-400 mt-3" variant='dark' type="submit" disabled={!stripe || loading}>
        <span>
          {loading ? <div className="spinner" id="spinner"></div> : `Subscribe to ${plan}`}
        </span>
      </Button>
      {loading && <div>Processing payment, please wait...</div>}
    </form>
  );
};

export default PaymentForm;