'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { DollarSign, PiggyBank, Activity, TrendingDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

import AddExpenseModal from '../../components/dashboard/AddExpenseModal';
import SalaryModal from '../../components/dashboard/SalaryModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DashboardPage() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [error, setError] = useState(null);

  // ============================
  // FETCH EXPENSES
  // ============================
  useEffect(() => {
    if (!user) return;
    fetchExpenses();
  }, [user]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId: user.id },
      });
      if (res.data?.success) setExpenses(res.data.expenses);
    } catch {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // SALARY + SAVINGS
  // ============================
  const salary = Number(user?.unsafeMetadata?.salary || 0);
  const savings = Number(user?.unsafeMetadata?.savings || 0);
  const usableMonthly = salary - savings;

  const now = new Date();
  const today = now.getDate();
  const month = now.getMonth();
  const year = now.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // ============================
  // CALCULATIONS
  // ============================
  const totalSpentThisMonth = useMemo(() => {
    return expenses
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, e) => sum + Number(e.amount), 0);
  }, [expenses]);

  const remainingMonthly = usableMonthly - totalSpentThisMonth;
  const remainingDays = Math.max(daysInMonth - today + 1, 1);
  const dailyBudget = remainingMonthly / remainingDays;

  const todaySpent = useMemo(() => {
    const todayStr = now.toISOString().split('T')[0];
    return expenses
      .filter(e => e.date.startsWith(todayStr))
      .reduce((sum, e) => sum + Number(e.amount), 0);
  }, [expenses]);

  const todayLeft = dailyBudget - todaySpent;

  // ============================
  // STATS CARDS
  // ============================
  const stats = [
    {
      title: 'Monthly Salary',
      value: `$${usableMonthly.toFixed(2)}`,
      icon: DollarSign,
      bg: 'bg-blue-100',
      text: 'text-blue-600',
    },
    {
      title: 'Savings',
      value: `$${savings.toFixed(2)}`,
      icon: PiggyBank,
      bg: 'bg-green-100',
      text: 'text-green-600',
    },
    {
      title: 'Today Salary Left',
      value: `$${todayLeft.toFixed(2)}`,
      icon: Activity,
      bg: todayLeft >= 0 ? 'bg-purple-100' : 'bg-red-100',
      text: todayLeft >= 0 ? 'text-purple-600' : 'text-red-600',
    },
    {
      title: 'Daily Budget',
      value: `$${dailyBudget.toFixed(2)}`,
      icon: TrendingDown,
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.firstName || 'User'} 👋
        </h1>
        <p className="text-gray-600">Salary-based smart expense tracking</p>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <div key={stat.title} className="bg-white rounded-xl shadow-md p-6">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={stat.text} size={24} />
            </div>
            <h3 className="text-2xl font-bold mt-3">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* REMAINING MONTHLY */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-2">Remaining Monthly Balance</h2>
        <p className={`text-2xl font-bold ${remainingMonthly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          ${remainingMonthly.toFixed(2)}
        </p>
      </div>

      {/* ACTIONS */}
      <div className="grid md:grid-cols-3 gap-6">
        <button
          onClick={() => setShowAddExpenseModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl"
        >
          Add Expense
        </button>

        <button
          onClick={() => setShowSalaryModal(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-xl"
        >
          Set Salary & Savings
        </button>

      </div>

      {/* MODALS */}
      <AddExpenseModal
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        userId={user?.id}
        getToken={getToken}
        onSuccess={fetchExpenses}
      />

      <SalaryModal
        isOpen={showSalaryModal}
        onClose={() => setShowSalaryModal(false)}
      />
    </div>
  );
}
