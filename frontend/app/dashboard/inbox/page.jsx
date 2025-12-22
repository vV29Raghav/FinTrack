'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function InboxPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('expenses');
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [loadingIds, setLoadingIds] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) fetchPendingExpenses();
  }, [user]);

  if (!isLoaded) return <div className="text-center py-12 text-gray-500">Loading inbox...</div>;

  const fetchPendingExpenses = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId: user?.id },
      });
      const pending = response.data?.expenses?.filter(exp => exp.status === 'pending') || [];
      setPendingExpenses(pending);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to fetch pending expenses.' });
    }
  };

  const handleAction = async (expenseId, status) => {
    setLoadingIds(prev => [...prev, expenseId]);
    setMessage({ type: '', text: '' });

    try {
      const token = await getToken();
      const response = await axios.patch(
        `${API_URL}/expenses/${expenseId}/status`,
        { status, approvedBy: user?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        setMessage({
          type: 'success',
          text: `Expense ${status === 'approved' ? 'approved' : 'rejected'} successfully!`,
        });
        fetchPendingExpenses();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || `Error ${status} expense.`,
      });
    } finally {
      setLoadingIds(prev => prev.filter(id => id !== expenseId));
    }
  };

  const messages = [
    { id: 1, from: 'Sarah Williams', message: 'Can you review my expense report for last month?', unread: true },
    { id: 2, from: 'Team Lead', message: 'Your travel expense has been approved!', unread: true },
    { id: 3, from: 'Finance Team', message: 'Reminder: Submit your Q4 expenses by end of week', unread: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inbox</h1>
        <p className="text-gray-600">Manage pending expenses and messages in one place</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`pb-3 px-4 font-medium ${activeTab === 'expenses' ? 'text-blue-600' : 'text-gray-600'}`}
        >
          Pending Expenses ({pendingExpenses.length})
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`pb-3 px-4 font-medium ${activeTab === 'messages' ? 'text-blue-600' : 'text-gray-600'}`}
        >
          Messages ({messages.filter(m => m.unread).length})
        </button>
      </div>

      {activeTab === 'expenses' ? (
        <div className="space-y-4">
          {pendingExpenses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <p className="text-gray-500">No pending expenses to review.</p>
            </div>
          ) : (
            pendingExpenses.map(exp => (
              <div key={exp._id} className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold">{exp.name}</h3>
                <p>${exp.amount}</p>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleAction(exp._id, 'approved')}
                    disabled={loadingIds.includes(exp._id)}
                    className="flex-1 bg-green-600 text-white py-2 rounded flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button
                    onClick={() => handleAction(exp._id, 'rejected')}
                    disabled={loadingIds.includes(exp._id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-bold">{msg.from}</h3>
              <p>{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
