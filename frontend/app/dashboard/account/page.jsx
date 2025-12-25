'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { CreditCard, Crown, CheckCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PAYMENT_LINKS = {
  Premium: 'https://buy.stripe.com/test_5kQ7sNbD90wJ4J712t1B603',
  Enterprise: 'https://buy.stripe.com/test_3cI4gB0Yvcfra3rcLb1B604',
};

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleUpgrade = (paymentLink) => {
    if (!paymentLink) return;

    const email = user?.primaryEmailAddress?.emailAddress;
    const url = email
      ? `${paymentLink}?prefilled_email=${encodeURIComponent(email)}`
      : paymentLink;

    window.location.href = url;
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
      current: true,
      paymentLink: null,
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
      current: false,
      paymentLink: PAYMENT_LINKS.Premium,
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
      current: false,
      paymentLink: PAYMENT_LINKS.Enterprise,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your subscription and account preferences</p>
      </div>

      {/* Profile */}
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

      {/* Plans */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upgrade Your Plan</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.name}
              onClick={() => !plan.current && handleUpgrade(plan.paymentLink)}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                plan.current
                  ? 'border-blue-600 bg-blue-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-blue-500 hover:shadow-lg'
              }`}
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
                    <CheckCircle className="text-green-500 mr-2 mt-0.5" size={16} />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpgrade(plan.paymentLink);
                }}
                disabled={plan.current}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.current
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {plan.current ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>


      {/* Sign Out */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <button
          onClick={handleSignOut}
          className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
