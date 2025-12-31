'use client';
export const dynamic = 'force-dynamic';

import { useUser, useAuth } from '@clerk/nextjs';
import { DollarSign, PiggyBank, Activity, TrendingDown, Edit2, Trash2, Loader2, FolderOpen } from 'lucide-react';
import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

import AddExpenseModal from '../../components/dashboard/AddExpenseModal';
import EditExpenseModal from '../../components/dashboard/EditExpenseModal';
import SalaryModal from '../../components/dashboard/SalaryModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-blue-600" size={40} /></div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const searchParams = useSearchParams();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [error, setError] = useState(null);

  // Filter state based on URL
  const [filterWorkspace, setFilterWorkspace] = useState(null);

  // ============================
  // FETCH EXPENSES
  // ============================
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      // Get workspaceId from URL query params
      const workspaceId = searchParams.get('workspaceId');

      const params = { userId: user.id };
      if (workspaceId) {
        params.workspaceId = workspaceId;

        // Fetch workspace name for the UI indicator
        try {
          const wsRes = await axios.get(`${API_URL}/workspaces/${workspaceId}`);
          if (wsRes.data?.success) {
            setFilterWorkspace(wsRes.data.workspace);
          }
        } catch (wsErr) {
          console.error("Failed to fetch workspace name", wsErr);
        }
      } else {
        setFilterWorkspace(null);
      }

      const res = await axios.get(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (res.data?.success) {
        setExpenses(res.data.expenses);
        setError(null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load expenses from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchExpenses();
  }, [user, searchParams]);

  const handleDeleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      const token = await getToken();
      await axios.delete(`${API_URL}/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchExpenses();
    } catch (err) {
      alert('Failed to delete expense');
    }
  };

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setShowEditExpenseModal(true);
  };

  // ============================
  // SALARY + SAVINGS
  // ============================
  const salary = Number(user?.unsafeMetadata?.salary || 0);
  const savings = Number(user?.unsafeMetadata?.savings || 0);
  const usableMonthly = salary - savings;

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

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
  }, [expenses, month, year]);

  const remainingMonthly = usableMonthly - totalSpentThisMonth;
  const dailyBudget = usableMonthly / lastDayOfMonth;

  // ============================
  // STATS CARDS
  // ============================
  const stats = [
    {
      title: 'Monthly Salary',
      value: `$${usableMonthly.toLocaleString()}`,
      icon: DollarSign,
      bg: 'bg-blue-100',
      text: 'text-blue-600',
    },
    {
      title: 'Savings',
      value: `$${savings.toLocaleString()}`,
      icon: PiggyBank,
      bg: 'bg-green-100',
      text: 'text-green-600',
    },
    {
      title: 'Monthly Salary Left',
      value: `$${remainingMonthly.toFixed(2)}`,
      icon: Activity,
      bg: remainingMonthly >= 0 ? 'bg-purple-100' : 'bg-red-100',
      text: remainingMonthly >= 0 ? 'text-purple-600' : 'text-red-600',
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
    <div className="space-y-8 p-4 md:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.firstName || 'User'} 👋
          </h1>
          <p className="text-gray-600">Salary-based smart expense tracking</p>
          {filterWorkspace && (
            <div className="mt-4 flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100 text-sm font-medium">
              <FolderOpen size={16} />
              Viewing Workspace: <span className="font-bold underline">{filterWorkspace.name}</span>
              <button
                onClick={() => {
                  window.location.href = '/dashboard';
                }}
                className="ml-4 text-xs bg-blue-200 hover:bg-blue-300 px-2 py-1 rounded transition"
              >
                Clear Filter
              </button>
            </div>
          )}
          {error && <p className="text-red-600 mt-2 font-medium">⚠️ {error}</p>}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Add Expense
          </button>
          <button
            onClick={() => setShowSalaryModal(true)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium transition"
          >
            Set Budget
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <div key={stat.title} className="bg-white rounded-xl shadow-sm border p-6">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={stat.text} size={24} />
            </div>
            <h3 className="text-2xl font-bold mt-4">{stat.value}</h3>
            <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* EXPENSE LIST */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Recent Expenses</h2>
          <span className="text-sm font-medium text-gray-500">{expenses.length} total</span>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No expenses found for this month.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Name</th>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 font-semibold text-right">Amount</th>
                  <th className="px-6 py-3 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium">{expense.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-red-600">
                      -${Number(expense.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALS */}
      <AddExpenseModal
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        userId={user?.id}
        getToken={getToken}
        onSuccess={fetchExpenses}
      />

      {selectedExpense && (
        <EditExpenseModal
          isOpen={showEditExpenseModal}
          onClose={() => {
            setShowEditExpenseModal(false);
            setSelectedExpense(null);
          }}
          expense={selectedExpense}
          getToken={getToken}
          onSuccess={fetchExpenses}
        />
      )}

      <SalaryModal
        isOpen={showSalaryModal}
        onClose={() => setShowSalaryModal(false)}
      />
    </div>
  );
}
