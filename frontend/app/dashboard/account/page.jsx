'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { CreditCard, Crown, CheckCircle, LogOut } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState({ tier: 'free', isActive: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }

    // Check for payment success/cancel
    if (searchParams.get('success')) {
      setMessage({ type: 'success', text: 'Subscription activated successfully!' });
    } else if (searchParams.get('canceled')) {
      setMessage({ type: 'error', text: 'Payment was canceled.' });
    }
  }, [user, searchParams]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const fetchSubscription = async () => {
    try {
      const response = await axios.get(`${API_URL}/stripe/subscription/${user?.id}`);
      if (response.data?.success) {
        setSubscription(response.data.subscription);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    }
  };

  const handleUpgrade = async (plan) => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setMessage({ type: 'error', text: 'Stripe is not configured. Please contact support.' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/stripe/create-checkout-session`, {
        userId: user?.id,
        plan,
        successUrl: `${window.location.origin}/dashboard/account?success=true`,
        cancelUrl: `${window.location.origin}/dashboard/account?canceled=true`,
      });

      if (response.data?.success && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to start checkout. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading account...</p>
      </div>
    );
  }

  const subscriptionPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['Up to 50 expenses/month', 'Basic reporting', '1 workspace', 'Email support'],
      current: subscription.tier === 'free',
      plan: 'free',
    },
    {
      name: 'Premium',
      price: '$19',
      period: 'per month',
      features: [
        'Unlimited expenses',
        'Advanced reporting & analytics',
        'Up to 5 workspaces',
        'Priority support',
        'Custom categories',
        'Export to CSV/PDF',
      ],
      current: subscription.tier === 'premium',
      plan: 'premium',
    },
    {
      name: 'Enterprise',
      price: '$49',
      period: 'per month',
      features: [
        'Everything in Premium',
        'Unlimited workspaces',
        'Advanced security features',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
      ],
      current: subscription.tier === 'enterprise',
      plan: 'enterprise',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your subscription and account preferences</p>
      </div>

      {/* Success/Error Message */}
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* User Info */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.firstName?.[0] || 'U'}
            {user?.lastName?.[0] || ''}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{user?.fullName || 'User'}</h3>
            <p className="text-gray-600">
              {user?.primaryEmailAddress?.emailAddress || 'user@example.com'}
            </p>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Current Subscription</h2>
        <div className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Crown className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 capitalize">{subscription.tier} Plan</h3>
              <p className="text-sm text-gray-600">
                {subscription.isActive && subscription.endDate
                  ? `Active until ${new Date(subscription.endDate).toLocaleDateString()}`
                  : 'Active subscription'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {subscription.tier === 'premium' ? '$19' : subscription.tier === 'enterprise' ? '$49' : '$0'}
            </p>
            <p className="text-sm text-gray-600">per month</p>
          </div>
        </div>
      </div>

      {/* Upgrade Plans */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upgrade Your Plan</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.name}
              className={`border-2 rounded-xl p-6 ${
                plan.current
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              } transition-colors`}
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 text-sm">/{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(plan.plan)}
                disabled={plan.current || loading}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.current
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {plan.current ? 'Current Plan' : loading ? 'Processing...' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <CreditCard className="text-gray-600" size={24} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">No payment method added</h3>
              <p className="text-sm text-gray-600">Add a payment method to upgrade</p>
            </div>
          </div>
          <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
            Add Payment Method
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Account Actions</h2>
        <button
          onClick={handleSignOut}
          className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
