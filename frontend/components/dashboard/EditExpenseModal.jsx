'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function EditExpenseModal({ isOpen, onClose, expense, getToken, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        date: '',
        category: '',
        description: '',
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (expense) {
            setFormData({
                name: expense.name || '',
                amount: expense.amount || '',
                date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
                category: expense.category || '',
                description: expense.description || '',
            });
        }
    }, [expense]);

    if (!isOpen || !expense) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = await getToken();

            const response = await axios.put(
                `${API_URL}/expenses/${expense._id}`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Expense updated successfully!' });
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1000);
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Error updating expense.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
                <div className="flex justify-between items-center border-b px-6 py-4">
                    <h2 className="text-xl font-bold">Edit Expense</h2>
                    <button onClick={onClose}><X /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {message.text && (
                        <div className={`p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full border px-4 py-2 rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            className="w-full border px-4 py-2 rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            className="w-full border px-4 py-2 rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full border px-4 py-2 rounded"
                            required
                        >
                            <option value="Food">Food</option>
                            <option value="Transport">Transport</option>
                            <option value="Rent">Rent</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded"
                    >
                        {loading ? 'Saving...' : 'Update Expense'}
                    </button>
                </form>
            </div>
        </div>
    );
}
