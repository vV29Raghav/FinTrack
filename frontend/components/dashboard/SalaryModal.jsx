'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function SalaryModal({ isOpen, onClose, onUpdate }) {
  const { user } = useUser();
  const [salary, setSalary] = useState(user?.unsafeMetadata?.salary || '');
  const [savings, setSavings] = useState(user?.unsafeMetadata?.savings || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const saveSalary = async () => {
    if (!salary || isNaN(salary)) {
      alert('Enter a valid salary');
      return;
    }

    try {
      setLoading(true);

      await user.update({
        unsafeMetadata: {
          salary: Number(salary),
          savings: Number(savings || 0),
        },
      });

      // Trigger parent update to re-render dashboard stats
      onUpdate?.();

      onClose();
    } catch (err) {
      console.error('Failed to save salary:', err);
      alert('Failed to save salary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Set Salary & Savings</h2>

        <input
          type="number"
          placeholder="Monthly Salary"
          value={salary}
          onChange={e => setSalary(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-3"
        />

        <input
          type="number"
          placeholder="Monthly Savings"
          value={savings}
          onChange={e => setSavings(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={saveSalary}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
