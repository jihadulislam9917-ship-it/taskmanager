import { loadStripe } from '@stripe/stripe-js';

// Make sure to set this environment variable in .env.local
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';

export const stripePromise = loadStripe(publishableKey);
