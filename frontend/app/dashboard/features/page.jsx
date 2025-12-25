'use client';

import { useState } from 'react';
import { Users, DollarSign, Calendar, TrendingDown, Target, Bell } from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
  const [activeFeature, setActiveFeature] = useState('split');

  const features = [
    {
      id: 'split',
      name: 'Split Expenses',
      icon: Users,
      color: 'blue',
      description: 'Easily split expenses with team members or friends',
      benefits: [
        'Split bills equally or by custom amounts',
        'Track who has paid and who owes',
        'Send payment reminders automatically',
        'Perfect for team lunches, trips, or shared costs',
      ],
    },
    {
      id: 'budget',
      name: 'Budget Goals',
      icon: Target,
      color: 'green',
      description: 'Set budget goals and get alerts when approaching limits',
      benefits: [
        'Create monthly, weekly, or custom budget periods',
        'Set alerts at 50%, 75%, and 90% thresholds',
        'Track spending by category',
        'Visual progress indicators',
      ],
    },
    {
      id: 'recurring',
      name: 'Recurring Expenses',
      icon: Calendar,
      color: 'purple',
      description: 'Automatically track recurring expenses like subscriptions',
      benefits: [
        'Set up daily, weekly, monthly, or yearly expenses',
        'Automatic expense creation',
        'Never forget a recurring payment',
        'Easy subscription management',
      ],
    },
    {
      id: 'insights',
      name: 'Smart Insights',
      icon: TrendingDown,
      color: 'orange',
      description: 'AI-powered insights into your spending patterns',
      benefits: [
        'Automatic expense categorization',
        'Spending trend analysis',
        'Anomaly detection for unusual expenses',
        'Personalized saving recommendations',
      ],
    },
  ];

  const activeFeatureData = features.find((f) => f.id === activeFeature);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Unique Features</h1>
        <p className="text-gray-600">
          Powerful features that set FinTrack apart from the competition
        </p>
      </div>

      {/* Feature Selector */}
      <div className="grid md:grid-cols-4 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isActive = activeFeature === feature.id;
          return (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                isActive
                  ? `border-${feature.color}-600 bg-${feature.color}-50`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                  isActive ? `bg-${feature.color}-100` : 'bg-gray-100'
                }`}
              >
                <Icon
                  className={isActive ? `text-${feature.color}-600` : 'text-gray-600'}
                  size={24}
                />
              </div>
              <h3 className="font-bold text-gray-900">{feature.name}</h3>
            </button>
          );
        })}
      </div>

      {/* Active Feature Details */}
      {activeFeatureData && (
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex items-start gap-6 mb-6">
            <div
              className={`w-16 h-16 rounded-xl flex items-center justify-center bg-${activeFeatureData.color}-100`}
            >
              {(() => {
                const Icon = activeFeatureData.icon;
                return (
                  <Icon className={`text-${activeFeatureData.color}-600`} size={32} />
                );
              })()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {activeFeatureData.name}
              </h2>
              <p className="text-gray-600 text-lg">{activeFeatureData.description}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Key Benefits:</h3>
            <ul className="space-y-3">
              {activeFeatureData.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Coming Soon Badge */}
          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="text-yellow-600" size={24} />
              <div>
                <h4 className="font-bold text-gray-900">Coming Soon!</h4>
                <p className="text-sm text-gray-600">
                  This feature is currently under development. Stay tuned for updates!
                </p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-bold mb-2">Smart Categorization</h3>
          <p className="text-3xl font-bold mb-2">100%</p>
          <p className="text-sm opacity-90">Automatic category suggestions</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-bold mb-2">Time Saved</h3>
          <p className="text-3xl font-bold mb-2">50%</p>
          <p className="text-sm opacity-90">Less time on expense management</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-bold mb-2">User Satisfaction</h3>
          <p className="text-3xl font-bold mb-2">95%</p>
          <p className="text-sm opacity-90">Happy users love our features</p>
        </div>
      </div>
    </div>
  );
}
