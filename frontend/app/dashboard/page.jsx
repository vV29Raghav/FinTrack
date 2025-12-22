'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { DollarSign, TrendingUp, TrendingDown, Activity, Edit2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import AddExpenseModal from '@/components/dashboard/AddExpenseModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
console.log('API_URL:', API_URL);

export default function DashboardPage() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [stats, setStats] = useState({
    totalExpenses: '0.00',
    thisMonth: '0.00',
    pendingApprovals: 0,
    averageDaily: '0.00',
  });

  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [error, setError] = useState(null);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchRecentExpenses();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const token = await getToken();
      const response = await axios.get(`${API_URL}/expenses/stats`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId: user?.id },
      });
      if (response.data?.success) setStats(response.data.stats);
      else setError('Failed to fetch stats');
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Error fetching stats');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRecentExpenses = async () => {
    try {
      setLoadingExpenses(true);
      const token = await getToken();
      const response = await axios.get(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId: user?.id },
      });
      if (response.data?.success)
        setRecentExpenses(response.data.expenses?.slice(0, 4) || []);
      else setError('Failed to fetch expenses');
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Error fetching expenses');
    } finally {
      setLoadingExpenses(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    setDeletingId(expenseId);
    try {
      const token = await getToken();
      const response = await axios.delete(`${API_URL}/expenses/${expenseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data?.success) {
        // Refresh both stats and expenses after deletion
        fetchStats();
        fetchRecentExpenses();
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExpenseSuccess = () => {
    // Refresh both stats and expenses after adding/updating
    fetchStats();
    fetchRecentExpenses();
  };

  const statsData = [
    {
      name: 'Total Expenses',
      value: `$${stats.totalExpenses}`,
      change: '0%',
      icon: DollarSign,
      trend: 'up',
      bg: 'bg-blue-100',
      text: 'text-blue-600',
    },
    {
      name: 'This Month',
      value: `$${stats.thisMonth}`,
      change: '+0%',
      icon: TrendingUp,
      trend: 'up',
      bg: 'bg-green-100',
      text: 'text-green-600',
    },
    {
      name: 'Pending Approvals',
      value: stats.pendingApprovals,
      change: '0%',
      icon: Activity,
      trend: 'down',
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
    },
    {
      name: 'Average Daily',
      value: `$${stats.averageDaily}`,
      change: '0%',
      icon: TrendingDown,
      trend: 'up',
      bg: 'bg-purple-100',
      text: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName || 'User'}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your expenses today.
        </p>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loadingStats
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-md p-6 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))
          : statsData.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bg}`}
                    >
                      <Icon className={stat.text} size={24} />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                </div>
              );
            })}
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Recent Expenses
        </h2>
        {loadingExpenses ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : recentExpenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No expenses yet. Create your first expense to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {recentExpenses.map((expense) => (
              <div
                key={expense._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{expense.name}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${expense.amount}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        expense.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : expense.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {expense.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link 
                      href={`/dashboard/reports?edit=${expense._id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit expense"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <button
                      onClick={() => handleDeleteExpense(expense._id)}
                      disabled={deletingId === expense._id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete expense"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <button
          onClick={() => setShowAddExpenseModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 hover:shadow-lg transition-shadow text-left"
        >
          <h3 className="text-lg font-bold mb-2">Add New Expense</h3>
          <p className="text-sm opacity-90">Record a new expense quickly</p>
        </button>
        <Link
          href="/dashboard/reports"
          className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-bold mb-2">Generate Report</h3>
          <p className="text-sm opacity-90">Create expense reports</p>
        </Link>
        <Link
          href="/dashboard/workspace"
          className="bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-bold mb-2">Invite Team</h3>
          <p className="text-sm opacity-90">Add team members</p>
        </Link>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        userId={user?.id}
        getToken={getToken}
        onSuccess={handleExpenseSuccess}
      />
    </div>
  );
}
