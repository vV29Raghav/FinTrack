'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { Plus, Download, Calendar, FileText, PieChart, Upload, Image as ImageIcon } from 'lucide-react';
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
  const [sortBy, setSortBy] = useState('date-desc');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [expenses, dateFilter, sortBy]);

  if (!isLoaded) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  const fetchExpenses = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId: user?.id },
      });
      if (response.data?.success) {
        setExpenses(response.data.expenses || []);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...expenses];

    // Apply date filter
    if (dateFilter.startDate) {
      filtered = filtered.filter(exp => new Date(exp.date) >= new Date(dateFilter.startDate));
    }
    if (dateFilter.endDate) {
      filtered = filtered.filter(exp => new Date(exp.date) <= new Date(dateFilter.endDate));
    }

    // Apply sorting
    if (sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'amount-desc') {
      filtered.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'amount-asc') {
      filtered.sort((a, b) => a.amount - b.amount);
    }

    setFilteredExpenses(filtered);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

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
        const expenseId = response.data.expense._id;

        // Upload file if selected
        if (selectedFile) {
          const fileFormData = new FormData();
          fileFormData.append('receipt', selectedFile);

          await axios.post(
            `${API_URL}/expenses/${expenseId}/upload`,
            fileFormData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            }
          );
        }

        setMessage({ type: 'success', text: 'Expense created successfully!' });
        setFormData({
          name: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          category: '',
          description: ''
        });
        setSelectedFile(null);
        fetchExpenses();
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

  const downloadReport = (format = 'csv') => {
    if (filteredExpenses.length === 0) {
      setMessage({ type: 'error', text: 'No expenses to export' });
      return;
    }

    if (format === 'csv') {
      const headers = ['Name', 'Amount', 'Date', 'Category', 'Status', 'Description'];
      const rows = filteredExpenses.map(exp => [
        exp.name,
        exp.amount,
        new Date(exp.date).toLocaleDateString(),
        exp.category,
        exp.status,
        exp.description || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Report downloaded successfully!' });
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="inline mr-2" size={16} />
                Upload Receipt/Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {selectedFile && (
                <p className="text-sm text-green-600 mt-2">
                  <ImageIcon className="inline mr-1" size={14} />
                  {selectedFile.name} selected
                </p>
              )}
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
        <button
          onClick={() => downloadReport('csv')}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <FileText className="text-blue-600" size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Export Report (CSV)</h3>
          <p className="text-sm text-gray-600">Download current filtered expenses</p>
        </button>
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <PieChart className="text-green-600" size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Category Analysis</h3>
          <p className="text-sm text-gray-600">Total: {filteredExpenses.length} expenses</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Calendar className="text-purple-600" size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Date Range</h3>
          <p className="text-sm text-gray-600">
            Total Amount: ${filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Filter & Sort Expenses</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
            </select>
          </div>
        </div>
        {(dateFilter.startDate || dateFilter.endDate) && (
          <button
            onClick={() => setDateFilter({ startDate: '', endDate: '' })}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            All Expenses ({filteredExpenses.length})
          </h2>
          <button
            onClick={() => downloadReport('csv')}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
        <div className="space-y-3">
          {filteredExpenses.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No expenses found</p>
          ) : (
            filteredExpenses.map((expense) => (
              <div
                key={expense._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {expense.attachments && expense.attachments.length > 0 && (
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="text-blue-600" size={20} />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{expense.name}</h4>
                    <p className="text-sm text-gray-600">
                      {expense.category} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
