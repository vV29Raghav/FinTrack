'use client';

import { useEffect, useState, use } from 'react';
import { useUser } from '@clerk/nextjs';
import {
    ArrowLeft,
    UserPlus,
    Mail,
    Send,
    Loader2,
    CheckCircle,
    Trash2,
    DollarSign,
    Users,
    LayoutDashboard
} from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function WorkspaceDetailPage({ params }) {
    const { id } = use(params);
    const { user, isLoaded } = useUser();
    const router = useRouter();

    const [workspace, setWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [editingSalary, setEditingSalary] = useState(null);
    const [newSalary, setNewSalary] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchWorkspace = async () => {
        try {
            const res = await axios.get(`${API_URL}/workspaces/${id}`);
            setWorkspace(res.data.workspace);
        } catch (err) {
            console.error('Fetch workspace error:', err);
            setMessage({ type: 'error', text: 'Failed to load workspace details' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded && user) {
            fetchWorkspace();
        }
    }, [isLoaded, user, id]);

    const handleInviteMember = async (e) => {
        e.preventDefault();
        setInviteLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await axios.post(`${API_URL}/workspaces/invite`, {
                workspaceId: id,
                email: inviteEmail,
                senderId: user.id,
            });

            setMessage({ type: 'success', text: `Invitation sent to ${inviteEmail}` });
            setInviteEmail('');
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Failed to send invitation',
            });
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRemoveMember = async (memberUserId) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;

        try {
            await axios.delete(`${API_URL}/workspaces/${id}/members/${memberUserId}`, {
                params: { ownerId: user.id }
            });
            setMessage({ type: 'success', text: 'Member removed successfully' });
            fetchWorkspace();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to remove member' });
        }
    };

    const handleSetMemberSalary = async (e, memberUserId) => {
        e.preventDefault();
        try {
            await axios.patch(`${API_URL}/workspaces/${id}/members/${memberUserId}/salary`, {
                ownerId: user.id,
                salary: newSalary
            });
            setMessage({ type: 'success', text: 'Member salary updated' });
            setEditingSalary(null);
            setNewSalary('');
            fetchWorkspace();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update salary' });
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    if (!workspace) return <div className="p-8 text-center">Workspace not found</div>;

    const isOwner = workspace.owner === user.id;

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4">
            {/* BREADCRUMBS & ACTIONS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <Link
                        href="/dashboard/workspace"
                        className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                    >
                        <ArrowLeft size={14} /> Back to Workspaces
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">{workspace.name}</h1>
                    <p className="text-gray-600">{workspace.description || 'No description provided'}</p>
                </div>

                <div className="flex gap-3">
                    <Link
                        href={`/dashboard?workspaceId=${id}`}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
                    >
                        <LayoutDashboard size={18} /> View Dashboard
                    </Link>
                </div>
            </div>

            {/* STATS OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-3 text-blue-600 mb-2">
                        <Users size={20} />
                        <span className="text-sm font-semibold uppercase tracking-wider">Total Members</span>
                    </div>
                    <p className="text-3xl font-bold">{workspace.members?.length || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-3 text-green-600 mb-2">
                        <DollarSign size={20} />
                        <span className="text-sm font-semibold uppercase tracking-wider">Workspace Budget</span>
                    </div>
                    <p className="text-3xl font-bold">${workspace.budget || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-3 text-purple-600 mb-2">
                        <CheckCircle size={20} />
                        <span className="text-sm font-semibold uppercase tracking-wider">Your Role</span>
                    </div>
                    <p className="text-3xl font-bold capitalize">{isOwner ? 'Owner' : 'Member'}</p>
                </div>
            </div>

            {/* NOTIFICATIONS */}
            {message.text && (
                <div className={`p-4 rounded-lg flex justify-between items-center animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    <span className="flex items-center gap-2">
                        {message.type === 'success' ? <CheckCircle size={18} /> : <Trash2 size={18} />}
                        {message.text}
                    </span>
                    <button onClick={() => setMessage({ type: '', text: '' })} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                {/* MEMBERS LIST */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Users size={20} /> Member Management
                            </h2>
                        </div>
                        <div className="divide-y">
                            {workspace.members?.map((member) => (
                                <div key={member.userId} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                                {(member.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{member.name || 'Anonymous'}</h4>
                                                <p className="text-sm text-gray-500">{member.role} • Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <div className="text-lg font-bold text-green-600">${member.salary || 0}</div>
                                            {isOwner && member.userId !== user.id && (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setEditingSalary(member.userId);
                                                            setNewSalary(member.salary || '');
                                                        }}
                                                        className="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
                                                    >
                                                        Set Salary
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveMember(member.userId)}
                                                        className="text-xs font-bold text-red-600 hover:text-red-700 underline underline-offset-4"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {editingSalary === member.userId && (
                                        <form
                                            onSubmit={(e) => handleSetMemberSalary(e, member.userId)}
                                            className="mt-4 p-4 bg-blue-50 rounded-lg flex gap-3 animate-in zoom-in-95"
                                        >
                                            <div className="relative flex-1">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="number"
                                                    placeholder="Monthly Salary"
                                                    value={newSalary}
                                                    onChange={(e) => setNewSalary(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm bg-white"
                                                    required
                                                />
                                            </div>
                                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">Save</button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingSalary(null)}
                                                className="px-4 py-2 border rounded-lg text-sm font-bold bg-white"
                                            >
                                                Cancel
                                            </button>
                                        </form>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SIDE ACTIONS */}
                <div className="space-y-6">
                    {/* INVITE FORM */}
                    {isOwner && (
                        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <UserPlus size={20} className="text-blue-600" /> Invite Member
                            </h3>
                            <p className="text-sm text-gray-500">Send an invitation email to add a new member to this workspace.</p>
                            <form onSubmit={handleInviteMember} className="space-y-3">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        placeholder="member@email.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <button
                                    disabled={inviteLoading}
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                                >
                                    {inviteLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                    Send Invitation
                                </button>
                            </form>
                        </div>
                    )}

                    {/* WORKSPACE INFO */}
                    <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg space-y-4">
                        <h3 className="font-bold text-lg">Quick Information</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-gray-800 pb-2">
                                <span className="text-gray-400">Created</span>
                                <span>{new Date(workspace.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-800 pb-2">
                                <span className="text-gray-400">Owner ID</span>
                                <span className="font-mono text-[10px]">{workspace.owner}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Workspace ID</span>
                                <span className="font-mono text-[10px]">{workspace._id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
