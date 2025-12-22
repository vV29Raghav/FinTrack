'use client';

import { Target, Users, Shield, Zap } from 'lucide-react';

export default function ValuesSection() {
  const values = [
    {
      icon: <Target size={40} />,
      title: 'Our Mission',
      description: 'To simplify expense management for everyone, making financial tracking accessible and efficient.',
      color: 'blue',
    },
    {
      icon: <Users size={40} />,
      title: 'Customer First',
      description: 'We build features based on real user needs, ensuring our platform serves you best.',
      color: 'purple',
    },
    {
      icon: <Shield size={40} />,
      title: 'Security & Privacy',
      description: 'Your financial data is protected with enterprise-grade security and encryption.',
      color: 'green',
    },
    {
      icon: <Zap size={40} />,
      title: 'Innovation',
      description: 'Continuously improving and adding features to make expense management effortless.',
      color: 'orange',
    },
  ];

  const colorMap = {
    blue: ['bg-blue-100', 'text-blue-600'],
    purple: ['bg-purple-100', 'text-purple-600'],
    green: ['bg-green-100', 'text-green-600'],
    orange: ['bg-orange-100', 'text-orange-600'],
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose FinTrack?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're committed to providing the best expense management experience with values that guide everything we do.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div
                className={`${colorMap[value.color][0]} w-16 h-16 rounded-full flex items-center justify-center mb-4 ${colorMap[value.color][1]}`}
              >
                {value.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
            <div className="text-gray-600">Active Users</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-600 mb-2">1M+</div>
            <div className="text-gray-600">Expenses Tracked</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
            <div className="text-gray-600">Uptime</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-600">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}
