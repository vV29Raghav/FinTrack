'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { Plus, Users, Settings, Mail, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function WorkspacePage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'Member',
    workspaceName: 'My Workspace',
    workspaceId: 'workspace-1'
  });
  const [subscription, setSubscription] = useState({ tier: 'free' });
  const [workspaceCount, setWorkspaceCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      fetchSubscription();
      fetchWorkspaces();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const response = await axios.get(`${API_URL}/stripe/subscription/${user?.id}`);
      if (response.data?.success) {
        setSubscription(response.data.subscription);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/workspaces/user/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data?.success) {
        setWorkspaceCount(response.data.workspaces?.length || 0);
      }
    } catch (err) {
      console.error('Error fetching workspaces:', err);
    }
  };

  const canCreateWorkspace = () => {
    if (subscription.tier === 'free' && workspaceCount >= 1) {
      return false;
    }
    if (subscription.tier === 'premium' && workspaceCount >= 5) {
      return false;
    }
    // Enterprise has unlimited workspaces
    return true;
  };

  const workspaces = [
    {
      id: 1,
      name: 'Marketing Team',
      members: 8,
      role: 'Admin',
      expenses: 45,
      total: '$12,345',
    },
    {
      id: 2,
      name: 'Sales Department',
      members: 12,
      role: 'Member',
      expenses: 67,
      total: '$23,456',
    },
  ];

  const members = [
    { name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'Member', status: 'Active' },
    { name: 'Mike Johnson', email: 'mike@example.com', role: 'Viewer', status: 'Pending' },
  ];

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = await getToken();
      const response = await axios.post(`${API_URL}/workspaces/invite`, {
        email: inviteData.email,
        workspaceName: inviteData.workspaceName,
        workspaceId: inviteData.workspaceId,
        role: inviteData.role,
        invitedBy: user?.fullName || user?.firstName || 'Team Admin'
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: response.data.inviteLink 
            ? `Invitation sent! Link: ${response.data.inviteLink}`
            : 'Invitation sent successfully! The user will receive an email with a link to join.'
        });
        setInviteData({ ...inviteData, email: '' });
        setTimeout(() => {
          setShowInviteForm(false);
          setMessage({ type: '', text: '' });
        }, 5000);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error sending invitation. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = () => {
    if (!canCreateWorkspace()) {
      const limitMessage = subscription.tier === 'free'
        ? 'Free plan allows only 1 workspace. Upgrade to Premium for up to 5 workspaces or Enterprise for unlimited workspaces.'
        : 'You have reached your workspace limit. Upgrade to Enterprise for unlimited workspaces.';
      setMessage({ type: 'error', text: limitMessage });
      return;
    }
    setShowCreateForm(true);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Workspace</h1>
          <p className="text-gray-600">
            Manage your workspaces and team members
            {subscription.tier === 'free' && ` (${workspaceCount}/1 workspace used)`}
            {subscription.tier === 'premium' && ` (${workspaceCount}/5 workspaces used)`}
            {subscription.tier === 'enterprise' && ` (${workspaceCount} workspaces - Unlimited)`}
          </p>
        </div>
        <button
          onClick={handleCreateWorkspace}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow flex items-center gap-2"
        >
          <Plus size={20} />
          Create Workspace
        </button>
      </div>

      {/* Success/Error Message */}
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Create Workspace Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Workspace</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Workspace Name</label>
              <input
                type="text"
                placeholder="e.g., Marketing Team"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
              <textarea
                rows={3}
                placeholder="Describe the purpose of this workspace..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Create Workspace</button>
              <button type="button" onClick={() => setShowCreateForm(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Workspaces Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{workspace.name}</h3>
                <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{workspace.role}</span>
              </div>
              <button className="text-gray-400 hover:text-gray-600"><Settings size={20} /></button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Members</p>
                <p className="text-2xl font-bold text-gray-900">{workspace.members}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expenses</p>
                <p className="text-2xl font-bold text-gray-900">{workspace.expenses}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{workspace.total}</p>
              </div>
            </div>
            <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">View Workspace</button>
          </div>
        ))}
      </div>

      {/* Team Members Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Mail size={18} /> Invite Member
          </button>
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <form onSubmit={handleInviteSubmit} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-3">Invite Team Member via Email</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                placeholder="member@example.com"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <select
                value={inviteData.role}
                onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Admin">Admin</option>
                <option value="Member">Member</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
            <div className="flex space-x-2 mt-3">
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Sending...' : 'Send Email Invite'}
              </button>
              <button
                type="button"
                onClick={() => { setShowInviteForm(false); setMessage({ type: '', text: '' }); }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Members List */}
        <div className="space-y-3">
          {members.map((member, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="text-blue-600" size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{member.name}</h4>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full">{member.role}</span>
                <span className={`text-sm px-3 py-1 rounded-full ${member.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{member.status}</span>
                <button className="text-red-600 hover:text-red-700"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
