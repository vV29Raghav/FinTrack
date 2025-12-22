'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { CheckCircle, XCircle, Send, DollarSign } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export default function InboxPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('expenses');
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newPaymentRequest, setNewPaymentRequest] = useState({ recipientId: '', amount: '', description: '' });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loadingIds, setLoadingIds] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchPendingExpenses();
      fetchPaymentRequests();
      
      // Initialize Socket.io connection
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected');
        socketRef.current.emit('register', user.id);
      });

      socketRef.current.on('receive_message', (data) => {
        setMessages((prev) => [...prev, data]);
      });

      socketRef.current.on('receive_payment_request', (data) => {
        setMessages((prev) => [
          ...prev,
          {
            type: 'payment_request',
            ...data,
          },
        ]);
        fetchPaymentRequests();
      });

      socketRef.current.on('payment_request_updated', (data) => {
        setMessage({
          type: 'success',
          text: `Payment request ${data.status} by ${data.recipientName}`,
        });
        fetchPaymentRequests();
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isLoaded) return <div className="text-center py-12 text-gray-500">Loading inbox...</div>;

  const fetchPendingExpenses = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId: user?.id },
      });
      const pending = response.data?.expenses?.filter(exp => exp.status === 'pending') || [];
      setPendingExpenses(pending);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to fetch pending expenses.' });
    }
  };

  const fetchPaymentRequests = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/payment-requests/user/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPaymentRequests(response.data?.paymentRequests || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (expenseId, status) => {
    setLoadingIds(prev => [...prev, expenseId]);
    setMessage({ type: '', text: '' });

    try {
      const token = await getToken();
      const response = await axios.patch(
        `${API_URL}/expenses/${expenseId}/status`,
        { status, approvedBy: user?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        setMessage({
          type: 'success',
          text: `Expense ${status === 'approved' ? 'approved' : 'rejected'} successfully!`,
        });
        fetchPendingExpenses();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || `Error ${status} expense.`,
      });
    } finally {
      setLoadingIds(prev => prev.filter(id => id !== expenseId));
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return;

    const messageData = {
      recipientId: 'broadcast', // In real app, select specific user
      message: newMessage,
      senderId: user?.id,
      senderName: user?.fullName || user?.firstName,
      type: 'chat',
    };

    socketRef.current.emit('send_message', messageData);
    setMessages((prev) => [
      ...prev,
      { ...messageData, timestamp: new Date(), isSent: true },
    ]);
    setNewMessage('');
  };

  const sendPaymentRequest = async () => {
    if (!newPaymentRequest.recipientId || !newPaymentRequest.amount || !newPaymentRequest.description) {
      setMessage({ type: 'error', text: 'Please fill all payment request fields' });
      return;
    }

    try {
      const token = await getToken();
      await axios.post(
        `${API_URL}/payment-requests`,
        {
          senderId: user?.id,
          senderName: user?.fullName || user?.firstName,
          ...newPaymentRequest,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: 'Payment request sent!' });
      setNewPaymentRequest({ recipientId: '', amount: '', description: '' });
      setShowPaymentForm(false);
      fetchPaymentRequests();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to send payment request' });
    }
  };

  const handlePaymentRequestAction = async (requestId, status) => {
    try {
      const token = await getToken();
      await axios.patch(
        `${API_URL}/payment-requests/${requestId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: `Payment request ${status}!` });
      fetchPaymentRequests();
    } catch (err) {
      setMessage({ type: 'error', text: `Failed to ${status} payment request` });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inbox</h1>
        <p className="text-gray-600">Manage pending expenses, payment requests, and messages</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`pb-3 px-4 font-medium ${activeTab === 'expenses' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
        >
          Pending Expenses ({pendingExpenses.length})
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-4 font-medium ${activeTab === 'payments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
        >
          Payment Requests ({paymentRequests.filter(r => r.status === 'pending').length})
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`pb-3 px-4 font-medium ${activeTab === 'messages' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
        >
          Chat ({messages.length})
        </button>
      </div>

      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {pendingExpenses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <p className="text-gray-500">No pending expenses to review.</p>
            </div>
          ) : (
            pendingExpenses.map(exp => (
              <div key={exp._id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{exp.name}</h3>
                    <p className="text-gray-600">{exp.category}</p>
                    <p className="text-sm text-gray-500">{new Date(exp.date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${exp.amount}</p>
                </div>
                {exp.description && <p className="text-gray-600 mb-4">{exp.description}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(exp._id, 'approved')}
                    disabled={loadingIds.includes(exp._id)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button
                    onClick={() => handleAction(exp._id, 'rejected')}
                    disabled={loadingIds.includes(exp._id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <DollarSign size={18} /> Send Payment Request
          </button>

          {showPaymentForm && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-lg mb-4">New Payment Request</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Recipient User ID"
                  value={newPaymentRequest.recipientId}
                  onChange={(e) => setNewPaymentRequest({ ...newPaymentRequest, recipientId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Amount ($)"
                  value={newPaymentRequest.amount}
                  onChange={(e) => setNewPaymentRequest({ ...newPaymentRequest, amount: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <textarea
                  placeholder="Description"
                  value={newPaymentRequest.description}
                  onChange={(e) => setNewPaymentRequest({ ...newPaymentRequest, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={sendPaymentRequest}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Send Request
                  </button>
                  <button
                    onClick={() => setShowPaymentForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {paymentRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <p className="text-gray-500">No payment requests.</p>
            </div>
          ) : (
            paymentRequests.map(req => (
              <div key={req._id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold">{req.senderId === user?.id ? `To: ${req.recipientName || req.recipientId}` : `From: ${req.senderName}`}</h3>
                    <p className="text-gray-600">{req.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${req.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      req.status === 'paid' ? 'bg-green-100 text-green-700' :
                      req.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
                {req.recipientId === user?.id && req.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handlePaymentRequestAction(req._id, 'approved')}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handlePaymentRequestAction(req._id, 'rejected')}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="h-96 overflow-y-auto mb-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500">No messages yet. Start a conversation!</p>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${msg.isSent ? 'bg-blue-100 ml-auto max-w-xs' : 'bg-gray-100 mr-auto max-w-xs'}`}
                >
                  {!msg.isSent && <p className="font-bold text-sm">{msg.senderName}</p>}
                  {msg.type === 'payment_request' ? (
                    <div>
                      <p className="font-medium">Payment Request: ${msg.amount}</p>
                      <p className="text-sm text-gray-600">{msg.description}</p>
                    </div>
                  ) : (
                    <p>{msg.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Send size={18} /> Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
