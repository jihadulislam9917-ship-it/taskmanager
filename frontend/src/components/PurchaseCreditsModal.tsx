import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent } from '@/lib/api';
import { X, Loader2 } from 'lucide-react';
import { stripePromise } from '@/lib/stripe';

interface PurchaseCreditsModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CheckoutForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href, // This might need adjustment based on where we want to redirect, but for a modal flow we usually handle it without redirect or redirect back to same page
      },
      redirect: "if_required", // Important to avoid full page reload if not necessary
    });

    if (error) {
      setMessage(error.message || 'An unexpected error occurred.');
      setIsProcessing(false);
    } else {
      setMessage('Payment successful! Credits added.');
      setIsProcessing(false);
      // Wait a bit to show success message
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {message && <div className="text-sm text-red-600 mt-2">{message}</div>}
      <button
        disabled={isProcessing || !stripe || !elements}
        id="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin h-4 w-4" /> Processing...
          </>
        ) : (
          "Pay $5.00"
        )}
      </button>
    </form>
  );
};

const PurchaseCreditsModal: React.FC<PurchaseCreditsModalProps> = ({ onClose, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    // Create PaymentIntent as soon as the modal loads
    createPaymentIntent(10) // Buying 10 credits
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((err) => {
        console.error('Failed to create payment intent', err);
      });
  }, []);

  const appearance = {
    theme: 'stripe' as const,
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Buy Credits
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6 bg-blue-50 p-4 rounded-md">
            <h3 className="font-medium text-blue-900">10 Credits Pack</h3>
            <p className="text-sm text-blue-700 mt-1">
              Purchase 10 credits for $5.00 to continue creating tasks.
            </p>
          </div>

          {clientSecret ? (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm onSuccess={onSuccess} />
            </Elements>
          ) : (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseCreditsModal;
