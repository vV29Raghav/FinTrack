'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Plus, Mail } from 'lucide-react';
import axios from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function WorkspacePage() {
  const { user, isLoaded } = useUser();

  const [workspaces, setWorkspaces] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  const [createData, setCreateData] = useState({
    name: '',
    description: '',
  });

  const [joinData, setJoinData] = useState({
    workspaceId: '',
    role: 'member',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  /* =========================
     FETCH USER WORKSPACES
  ========================== */
  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchWorkspaces = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/workspaces/user/${user.id}`
        );
        setWorkspaces(res.data.workspaces || []);
      } catch (err) {
        console.error('Fetch workspaces error:', err);
        setWorkspaces([]);
      }
    };

    fetchWorkspaces();
  }, [isLoaded, user]);

  /* =========================
     CREATE WORKSPACE
  ========================== */
  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await axios.post(`${API_URL}/workspaces`, {
        name: createData.name,
        description: createData.description,
        ownerId: user.id,
      });

      setWorkspaces((prev) => [...prev, res.data.workspace]);
      setCreateData({ name: '', description: '' });
      setShowCreateForm(false);

      setMessage({
        type: 'success',
        text: 'Workspace created successfully',
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create workspace',
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     JOIN WORKSPACE
  ========================== */
  const handleJoinWorkspace = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await axios.post(`${API_URL}/workspaces/join`, {
        workspaceId: joinData.workspaceId,
        userId: user.id,
        role: joinData.role,
      });

      setWorkspaces((prev) => [...prev, res.data.workspace]);
      setShowJoinForm(false);

      setMessage({
        type: 'success',
        text: 'Joined workspace successfully',
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to join workspace',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Workspaces</h1>
          <p className="text-gray-600">Manage your team workspaces</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowJoinForm(!showJoinForm)}
            className="px-4 py-2 border rounded-lg flex items-center gap-2"
          >
            <Mail size={18} /> Join
          </button>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Create
          </button>
        </div>
      </div>

      {/* MESSAGE */}
      {message.text && (
        <div
          className={`p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* CREATE WORKSPACE FORM */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateWorkspace}
          className="p-4 bg-white border rounded-lg space-y-3"
        >
          <input
            type="text"
            placeholder="Workspace name"
            value={createData.name}
            onChange={(e) =>
              setCreateData({ ...createData, name: e.target.value })
            }
            required
            className="w-full px-3 py-2 border rounded"
          />

          <textarea
            placeholder="Description (optional)"
            value={createData.description}
            onChange={(e) =>
              setCreateData({
                ...createData,
                description: e.target.value,
              })
            }
            className="w-full px-3 py-2 border rounded"
          />

          <button
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? 'Creating...' : 'Create Workspace'}
          </button>
        </form>
      )}

      {/* JOIN WORKSPACE FORM */}
      {showJoinForm && (
        <form
          onSubmit={handleJoinWorkspace}
          className="p-4 bg-white border rounded-lg space-y-3"
        >
          <select
            value={joinData.workspaceId}
            onChange={(e) =>
              setJoinData({
                ...joinData,
                workspaceId: e.target.value,
              })
            }
            required
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select workspace</option>
            {workspaces.map((ws) => (
              <option key={ws._id} value={ws._id}>
                {ws.name}
              </option>
            ))}
          </select>

          <button
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? 'Joining...' : 'Join Workspace'}
          </button>
        </form>
      )}

      {/* WORKSPACE LIST */}
      <div className="grid md:grid-cols-2 gap-6">
        {workspaces.map((ws) => (
          <div
            key={ws._id}
            className="p-5 bg-white border rounded-lg"
          >
            <h3 className="text-xl font-bold">{ws.name}</h3>
            <p className="text-gray-600">{ws.description}</p>
            <p className="mt-2 text-sm">
              Members: {ws.members?.length || 1}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
