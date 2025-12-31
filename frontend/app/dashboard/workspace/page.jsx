'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Plus, Mail, UserPlus, Send, Loader2, CheckCircle, DollarSign, FolderOpen } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function WorkspacePage() {
  const { user, isLoaded } = useUser();

  const [workspaces, setWorkspaces] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [activeInviteWs, setActiveInviteWs] = useState(null);

  const [createData, setCreateData] = useState({
    name: '',
    description: '',
  });

  const [joinData, setJoinData] = useState({
    workspaceId: '',
    role: 'member',
  });

  const [inviteEmail, setInviteEmail] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [activeBudgetWs, setActiveBudgetWs] = useState(null);
  const [expandedWs, setExpandedWs] = useState(null);
  const [editingSalary, setEditingSalary] = useState(null); // { wsId, memberId, currentSalary }
  const [newSalary, setNewSalary] = useState('');

  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  /* =========================
     FETCH USER WORKSPACES
  ========================== */
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

  useEffect(() => {
    if (!isLoaded || !user) return;
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
     INVITE MEMBER
  ========================== */
  const handleInviteMember = async (e, workspaceId) => {
    e.preventDefault();
    setInviteLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post(`${API_URL}/workspaces/invite`, {
        workspaceId,
        email: inviteEmail,
        senderId: user.id,
      });

      setMessage({
        type: 'success',
        text: `Invitation sent to ${inviteEmail}`,
      });
      setInviteEmail('');
      setActiveInviteWs(null);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to send invitation',
      });
    } finally {
      setInviteLoading(false);
    }
  };

  /* =========================
     UPDATE BUDGET
  ========================== */
  const handleUpdateBudget = async (e, workspaceId) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Assuming a generic update route exists or patching workspace
      await axios.put(`${API_URL}/workspaces/${workspaceId}`, {
        budget: parseFloat(budgetAmount),
        userId: user.id,
      });

      setMessage({
        type: 'success',
        text: 'Workspace budget updated successfully',
      });
      setBudgetAmount('');
      setActiveBudgetWs(null);
      fetchWorkspaces();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update budget',
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

  /* =========================
     MEMBER MANAGEMENT
  ========================== */
  const handleRemoveMember = async (workspaceId, memberUserId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/workspaces/${workspaceId}/members/${memberUserId}`, {
        params: { ownerId: user.id }
      });
      setMessage({ type: 'success', text: 'Member removed successfully' });
      fetchWorkspaces();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to remove member' });
    } finally {
      setLoading(false);
    }
  };

  const handleSetMemberSalary = async (e, workspaceId, memberUserId) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.patch(`${API_URL}/workspaces/${workspaceId}/members/${memberUserId}/salary`, {
        ownerId: user.id,
        salary: newSalary
      });
      setMessage({ type: 'success', text: 'Member salary updated' });
      setEditingSalary(null);
      setNewSalary('');
      fetchWorkspaces();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update salary' });
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
          <p className="text-gray-600">Manage your team workspaces and invite members</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowJoinForm(!showJoinForm)}
            className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50 transition"
          >
            <Mail size={18} /> Join
          </button>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Plus size={18} /> Create
          </button>
        </div>
      </div>

      {/* MESSAGE */}
      {message.text && (
        <div
          className={`p-4 rounded-lg flex justify-between items-center ${message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })} className="text-sm font-bold">✕</button>
        </div>
      )}

      {/* CREATE WORKSPACE FORM */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateWorkspace}
          className="p-6 bg-white border rounded-xl shadow-sm space-y-4"
        >
          <h2 className="text-lg font-bold">Create New Workspace</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Workspace name"
              value={createData.name}
              onChange={(e) =>
                setCreateData({ ...createData, name: e.target.value })
              }
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={createData.description}
              onChange={(e) =>
                setCreateData({
                  ...createData,
                  description: e.target.value,
                })
              }
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="flex gap-2">
            <button
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              Create Workspace
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-6 py-2 border rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* JOIN WORKSPACE FORM */}
      {showJoinForm && (
        <form
          onSubmit={handleJoinWorkspace}
          className="p-6 bg-white border rounded-xl shadow-sm space-y-4"
        >
          <h2 className="text-lg font-bold">Join a Workspace</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Workspace ID"
              value={joinData.workspaceId}
              onChange={(e) =>
                setJoinData({
                  ...joinData,
                  workspaceId: e.target.value,
                })
              }
              required
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              Join
            </button>
            <button
              type="button"
              onClick={() => setShowJoinForm(false)}
              className="px-6 py-2 border rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* WORKSPACE LIST */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((ws) => (
          <div
            key={ws._id}
            className="p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{ws.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{ws.description || 'No description'}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${ws.owner === user.id ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'}`}>
                {ws.owner === user.id ? 'Owner' : 'Member'}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-500 gap-4 border-t pt-4">
              <span>👥 {ws.members?.length || 1} members</span>
              <span className="font-bold text-blue-600">💰 Budget: ${ws.budget || 0}</span>
            </div>

            <div className={`grid ${ws.owner === user.id ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
              {ws.owner === user.id && (
                <>
                  <button
                    onClick={() => setActiveInviteWs(ws._id)}
                    className="flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 transition"
                  >
                    <UserPlus size={14} /> Invite
                  </button>
                  <button
                    onClick={() => setActiveBudgetWs(ws._id)}
                    className="flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-green-400 hover:text-green-600 transition"
                  >
                    <DollarSign size={14} /> Budget
                  </button>
                  {activeInviteWs === ws._id && (
                    <form onSubmit={(e) => handleInviteMember(e, ws._id)} className="col-span-2 space-y-2 pt-2">
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="Member email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          required
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                        <button disabled={inviteLoading} className="bg-blue-600 text-white p-2 rounded-lg">
                          {inviteLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        </button>
                        <button type="button" onClick={() => setActiveInviteWs(null)} className="p-2 border rounded-lg">✕</button>
                      </div>
                    </form>
                  )}
                  {activeBudgetWs === ws._id && (
                    <form onSubmit={(e) => handleUpdateBudget(e, ws._id)} className="col-span-2 space-y-2 pt-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="New Budget"
                          value={budgetAmount}
                          onChange={(e) => setBudgetAmount(e.target.value)}
                          required
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                        <button disabled={loading} className="bg-green-600 text-white p-2 rounded-lg">
                          {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                        </button>
                        <button type="button" onClick={() => setActiveBudgetWs(null)} className="p-2 border rounded-lg">✕</button>
                      </div>
                    </form>
                  )}
                </>
              )}

              <Link
                href={`/dashboard/workspace/${ws._id}`}
                className={`${ws.owner === user.id ? 'col-span-2' : ''} flex items-center justify-center gap-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition`}
              >
                <FolderOpen size={14} /> Manage Workspace
              </Link>
            </div>
          </div>
        ))}

        {workspaces.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
            <p className="text-gray-500">No workspaces found. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
