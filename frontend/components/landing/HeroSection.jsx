'use client';

import Link from 'next/link';
import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { ArrowRight, TrendingUp } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Expense Management
          <span className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Made Simple
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          Track expenses, manage team spending, and simplify reimbursements all in one place.
          Perfect for individuals and businesses alike.
        </p>

        {/* Single Unified Card */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-10 hover:shadow-2xl transition-shadow duration-300 border-2 border-transparent hover:border-blue-500">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="text-white" size={40} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Manage Your Expenses</h3>
            <p className="text-lg text-gray-600 mb-8">
              Take control of your finances with our powerful expense tracking platform.
              Whether you're managing personal expenses or coordinating with a team, we've got you covered.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-xl">✓</span>
                  <span className="text-gray-700">Easy expense tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-xl">✓</span>
                  <span className="text-gray-700">Budget management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-xl">✓</span>
                  <span className="text-gray-700">Visual reports & analytics</span>
                </li>
              </ul>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-xl">✓</span>
                  <span className="text-gray-700">Team collaboration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-xl">✓</span>
                  <span className="text-gray-700">Approval workflows</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-xl">✓</span>
                  <span className="text-gray-700">Real-time notifications</span>
                </li>
              </ul>
            </div>

            <SignedOut>
              <SignUpButton mode="modal">
                <button className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3">
                  Get Started Free
                  <ArrowRight size={24} />
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                className="block w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-center"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-green-500 text-2xl">★★★★★</span>
            <span>Trusted by 10,000+ users</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500 text-xl">🔒</span>
            <span>Bank-level security</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-500 text-xl">⚡</span>
            <span>Lightning fast</span>
          </div>
        </div>
      </div>
    </section>
  );
}
