'use client';
import React, { useState, useEffect } from 'react';
import PaymentForm from '@/app/components/PaymentForm';
import StripeProviderWrapper from '@/app/lib/StripeProvider';

const Modal: React.FC<{ isVisible: boolean; onClose: () => void; children: React.ReactNode }> = ({
  isVisible,
  onClose,
  children,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          Close
        </button>
        {children}
      </div>
    </div>
  );
};

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [showPaymentForm, setShowPaymentForm] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);


  const pricing = {
    monthly: {
      free: { price: "$0", period: "/ month" },
      premium: { price: "$4.99", period: "/ month", discount: false },
      team: { price: "$19.99", period: "/ month", discount: false }
    },
    annually: {
      free: { price: "$0", period: "/ month" },
      premium: { price: "$3.99", period: "/ month", discount: true },
      team: { price: "$15.99", period: "/ month", discount: true }
    }
  };

  
  // Fetch the clientSecret from API
  const fetchClientSecret = async (plan: string) => {
    try {
      const response = await fetch('/api/createPayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
  
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to create payment');
      }
  
      const { client_secret: clientSecret } = await response.json();
      console.log("Client secret received:", clientSecret);
      setClientSecret(clientSecret);
    } catch (error) {
      console.error('Error fetching client secret:', error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
  };

  useEffect(() => {
    if (showPaymentForm) {
      fetchClientSecret(showPaymentForm.toLowerCase()); // Fetch clientSecret when user selects a plan
    }
  }, [showPaymentForm]);

  const openModal = (plan: string) => {
    setShowPaymentForm(plan);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowPaymentForm(null);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold text-center">Simple Pricing. Start for Free.</h1>
      <p className="text-center text-gray-400 mt-2">Get started free and scale as you go.</p>

      {/* Toggle Switch */}
      <div className="flex justify-center mt-8">
        <div className="inline-flex items-center bg-gray-800 rounded-full p-1">
          <button
            className={`px-4 py-2 text-sm font-semibold rounded-full ${
              billingCycle === 'monthly' ? 'bg-white text-gray-900' : 'text-gray-400'
            }`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-2 text-sm font-semibold rounded-full ${
              billingCycle === 'annually' ? 'bg-white text-gray-900' : 'text-gray-400'
            }`}
            onClick={() => setBillingCycle('annually')}
          >
            Annually <span className="text-green-400">{billingCycle === 'annually' && '-20%'}</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container-with-lines grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {/* Free Plan */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-md text-center">
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="mt-4 text-4xl font-bold">
            {pricing[billingCycle].free.price}{' '}
            <span className="text-base font-medium">{pricing[billingCycle].free.period}</span>
          </p>
          <p className="text-gray-400">Free forever</p>
          <button className="mt-6 bg-white text-black font-semibold px-4 py-2 rounded-lg">Get started free</button>

          <div className="mt-8 text-left">
            <p className="font-semibold text-gray-400 mb-2">Free plan features:</p>
            <ul className="text-gray-400 space-y-2">
              <li>❌ 24/7 Support</li>
              <li>✔️ 10k Messages/month</li>
              <li>❌ Team Access</li>
            </ul>
          </div>
        </div>

        {/* Premium Plan */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-md text-center">
          <h2 className="text-xl font-semibold">
            Premium{' '}
            {pricing[billingCycle].premium.discount && (
              <span className="text-green-400">-20%</span>
            )}
          </h2>
          <p className="mt-2 text-gray-400">Best for students.</p>
          <p className="mt-4 text-4xl font-bold">
            {pricing[billingCycle].premium.price}{' '}
            <span className="text-base font-medium">{pricing[billingCycle].premium.period}</span>
          </p>
          <p className="text-gray-400">Billed {billingCycle}</p>
          <button 
            onClick={() => openModal('Premium')} 
            className="mt-6 bg-white text-black font-semibold px-4 py-2 rounded-lg"
          >
            Subscribe to Premium
          </button>

          <div className="mt-8 text-left">
            <p className="font-semibold text-gray-400 mb-2">Everything in Free, plus:</p>
            <ul className="text-gray-400 space-y-2">
              <li>✔️ 24/7 Support</li>
              <li>✔️ 1M Messages/month</li>
              <li>❌ Team Access</li>
            </ul>
          </div>
        </div>

        {/* Team Plan */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-md text-center">
          <h2 className="text-xl font-semibold">
            Team{' '}
            {pricing[billingCycle].team.discount && (
              <span className="text-green-400">-20%</span>
            )}
          </h2>
          <p className="mt-2 text-gray-400">Best for teams.</p>
          <p className="mt-4 text-4xl font-bold">
            {pricing[billingCycle].team.price}{' '}
            <span className="text-base font-medium">{pricing[billingCycle].team.period}</span>
          </p>
          <p className="text-gray-400">Billed {billingCycle}</p>
          <button 
            onClick={() => openModal('Team')} 
            className="mt-6 bg-white text-black font-semibold px-4 py-2 rounded-lg"
          >
            Subscribe to Team
          </button>

          <div className="mt-8 text-left">
            <p className="font-semibold text-gray-400 mb-2">Everything in Premium, plus:</p>
            <ul className="text-gray-400 space-y-2">
              <li>✔️ 24/7 Support</li>
              <li>✔️ Unlimited Messages</li>
              <li>✔️ Team Access</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal for PaymentForm */}
      <Modal isVisible={isModalOpen} onClose={closeModal}>
        {clientSecret && (
          <StripeProviderWrapper clientSecret={clientSecret}>
            <PaymentForm 
              plan={showPaymentForm?.toLowerCase() as 'premium' | 'team'} 
              clientSecret={clientSecret}  
            />
          </StripeProviderWrapper>
        )}
      </Modal>

    </div>
  );
};

export default Pricing;
