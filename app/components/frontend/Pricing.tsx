import { Button } from '@/app/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Check } from 'lucide-react';
import Link from 'next/link';

interface iAppProps {
  id: number;
  cardTitle: string;
  cardDescription: string;
  priceTitle: string;
  benefits: string[];
}

export const PricingPlans: iAppProps[] = [
  {
    id: 0,
    cardTitle: 'Starter',
    cardDescription: 'Ideal for individuals beginning with AI chatbots',
    priceTitle: 'Free',
    benefits: [
      '1 Chatbot',
      'Up to 1,000 Conversations',
      'Basic NLP features',
      'Community support',
      'Access to templates',
    ],
  },
  {
    id: 1,
    cardTitle: 'Pro',
    cardDescription: 'Perfect for small businesses and professionals',
    priceTitle: '$29.99',
    benefits: [
      'Unlimited Chatbots',
      'Up to 10,000 Conversations',
      'Advanced NLP and AI features',
      'Priority support',
      'Custom integrations',
    ],
  },
];

export function PricingTable() {
  return (
    <>
      <div className="max-w-3xl mx-auto text-center">
        <p className="font-semibold text-primary-purple">Pricing</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          Flexible Pricing for Every Need!
        </h1>
        <p className="max-w-2xl mx-auto text-center leading-tight mt-6 mb-3 md:mt-6 text-lg text-muted-foreground">
          Choose the plan that suits your AI chatbot needs. Get started for free!
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 mt-15 lg:grid-cols-2">
        {PricingPlans.map((plan) => (
          <Card key={plan.id} className={plan.id === 1 ? 'border-primary-purple' : ''}>
            <CardHeader>
              <CardTitle>
                {plan.id === 1 ? (
                  <div className="flex items-center justify-between ">
                    <h3 className="text-primary-purple">Pro</h3>
                    <p className="rounded-full bg-primary-purple/30 px-3 py-1 text-xs font-semibold leading-5 text-primary-purple">
                      Most Popular
                    </p>
                  </div>
                ) : (
                  <>{plan.cardTitle}</>
                )}
              </CardTitle>
              <CardDescription>{plan.cardDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mt-6 text-4xl font-bold tracking-tighter">{plan.priceTitle}</p>
              <ul className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                {plan.benefits.map((benefit, index) => (
                  <li key={index} className="flex gap-x-3">
                    <Check className="text-primary-purple size-5" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.id === 1 ? (
                <form action="" className="w-full">
                  <Button className="mt-5 w-full" asChild>
                    <Link href="#" className="Add Stripe redirect here">
                      Buy Plan
                    </Link>
                  </Button>
                </form>
              ) : (
                <Button className="mt-5 w-full" variant="outline" asChild>
                  <Link href={`/dashboard`}>Try for Free</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
