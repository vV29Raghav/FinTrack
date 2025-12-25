'use client';

import { useState, useRef } from 'react';
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
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [suggestedCategory, setSuggestedCategory] = useState('');

  const debounceRef = useRef(null);

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
        { ...formData, userId, submittedBy: userId },
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
              className={`p-3 rounded ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <input
            name="name"
            placeholder="Expense name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full border px-4 py-2 rounded"
            required
          />

          {suggestedCategory && suggestedCategory !== formData.category && (
            <div className="bg-blue-50 border p-2 rounded flex justify-between items-center">
              <span>💡 Suggested: <b>{suggestedCategory}</b></span>
              <button
                type="button"
                onClick={applySuggestedCategory}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
              >
                Use
              </button>
            </div>
          )}

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleInputChange}
            className="w-full border px-4 py-2 rounded"
            required
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full border px-4 py-2 rounded"
            required
          >
            <option value="">Select category</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Rent">Rent</option>
            <option value="Utilities">Utilities</option>
            <option value="Other">Other</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded"
          >
            {loading ? 'Saving...' : 'Create Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}
