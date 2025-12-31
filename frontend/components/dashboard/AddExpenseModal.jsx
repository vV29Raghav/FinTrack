'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AddExpenseModal({ isOpen, onClose, userId, getToken, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    workspaceId: 'personal'
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const [workspaces, setWorkspaces] = useState([]);

  const debounceRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (userId) fetchWorkspaces();

      // Get workspaceId from URL
      const searchParams = new URLSearchParams(window.location.search);
      const wsId = searchParams.get('workspaceId');
      if (wsId) {
        setFormData(prev => ({ ...prev, workspaceId: wsId }));
      } else {
        setFormData(prev => ({ ...prev, workspaceId: 'personal' }));
      }
    }
  }, [isOpen, userId]);

  const fetchWorkspaces = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API_URL}/workspaces/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkspaces(res.data.workspaces || []);
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
    }
  };

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // 🔥 Debounced category suggestion
    if (name === 'name' && value.length > 3) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        suggestCategoryForExpense(value, formData.description);
      }, 300);
    }
  };

  const suggestCategoryForExpense = async (name, description) => {
    try {
      const token = getToken ? await getToken() : null;

      const response = await axios.post(
        `${API_URL}/expenses/suggest-category`,
        { name, description },
        token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {}
      );

      if (response.data?.success) {
        setSuggestedCategory(response.data.suggestedCategory);
      }
    } catch (err) {
      console.error('Category suggestion failed:', err.message);
    }
  };

  const applySuggestedCategory = () => {
    setFormData((prev) => ({
      ...prev,
      category: suggestedCategory,
    }));
    setSuggestedCategory('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = await getToken();

      const response = await axios.post(
        `${API_URL}/expenses`,
        {
          ...formData,
          userId,
          submittedBy: userId,
          workspaceId: formData.workspaceId === 'personal' ? null : formData.workspaceId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Expense created successfully!' });

        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error.response?.data?.message ||
          'Error creating expense. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      workspaceId: 'personal'
    });
    setSuggestedCategory('');
    setMessage({ type: '', text: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-bold">Add New Expense</h2>
          <button onClick={handleClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message.text && (
            <div
              className={`p-3 rounded ${message.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
                }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expense Name</label>
              <input
                name="name"
                placeholder="e.g., Office Supplies"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border px-4 py-2 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                name="amount"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full border px-4 py-2 rounded-lg"
                required
              />
            </div>
          </div>

          {suggestedCategory && suggestedCategory !== formData.category && (
            <div className="bg-blue-50 border border-blue-100 p-2 rounded-lg flex justify-between items-center">
              <span className="text-sm">💡 Suggested: <b>{suggestedCategory}</b></span>
              <button
                type="button"
                onClick={applySuggestedCategory}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded"
              >
                Use
              </button>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full border px-4 py-2 rounded-lg"
                required
              >
                <option value="">Select category</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Salary">Salary/Income</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Workspace</label>
              <select
                name="workspaceId"
                value={formData.workspaceId || 'personal'}
                onChange={handleInputChange}
                className="w-full border px-4 py-2 rounded-lg"
              >
                <option value="personal">Personal (Private)</option>
                {workspaces.map(ws => (
                  <option key={ws._id} value={ws._id}>{ws.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition"
          >
            {loading ? 'Saving...' : 'Create Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}
