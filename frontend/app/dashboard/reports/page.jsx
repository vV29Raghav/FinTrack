'use client';

import { useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { Plus, Download, Calendar, FileText, PieChart } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ReportsPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [showNewExpenseForm, setShowNewExpenseForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!isLoaded) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = await getToken();
      const response = await axios.post(
        `${API_URL}/expenses`,
        { ...formData, userId: user?.id, submittedBy: user?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Expense created successfully!' });
        setFormData({
          name: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          category: '',
          description: ''
        });
        setTimeout(() => {
          setShowNewExpenseForm(false);
          setMessage({ type: '', text: '' });
        }, 2000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error creating expense. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">Create expenses and generate detailed reports</p>
        </div>
        <button
          onClick={() => setShowNewExpenseForm(!showNewExpenseForm)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow flex items-center gap-2"
        >
          <Plus size={20} /> New Expense
        </button>
      </div>

      {/* Success/Error Message */}
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* New Expense Form */}
      {showNewExpenseForm && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Expense</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expense Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Office Supplies"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount*</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date*</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category*</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Travel">Travel</option>
                  <option value="Meals & Entertainment">Meals & Entertainment</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Software & Subscriptions">Software & Subscriptions</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Add any additional details..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.amount || !formData.category}
                className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating...' : 'Create Expense'}
              </button>
              <button
                type="button"
                onClick={() => { setShowNewExpenseForm(false); setMessage({ type: '', text: '' }); }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Report Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <button className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <FileText className="text-blue-600" size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Monthly Report</h3>
          <p className="text-sm text-gray-600">Generate this month's expense report</p>
        </button>
        <button className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <PieChart className="text-green-600" size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Category Analysis</h3>
          <p className="text-sm text-gray-600">View spending by category</p>
        </button>
        <button className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Calendar className="text-purple-600" size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Custom Date Range</h3>
          <p className="text-sm text-gray-600">Generate report for specific dates</p>
        </button>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Reports</h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
            <Download size={18} />
            Export All
          </button>
        </div>
        <div className="space-y-3">
          {[
            { name: 'December 2024 Report', date: 'Dec 1 - Dec 20', total: '$8,456.78', expenses: 45 },
            { name: 'November 2024 Report', date: 'Nov 1 - Nov 30', total: '$7,234.56', expenses: 38 },
            { name: 'October 2024 Report', date: 'Oct 1 - Oct 31', total: '$6,789.01', expenses: 42 },
          ].map((report, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-blue-600" size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{report.name}</h4>
                  <p className="text-sm text-gray-600">{report.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{report.total}</p>
                <p className="text-sm text-gray-600">{report.expenses} expenses</p>
              </div>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
