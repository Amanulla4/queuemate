import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlusIcon, 
  UserGroupIcon, 
  PhoneArrowDownLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  SpeakerWaveIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

function QueueManagement({ businessId }) {
  const [queue, setQueue] = useState({ waiting: [], serving: null, completed: [], waitingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [nextToken, setNextToken] = useState(null);
  const [message, setMessage] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchNextToken();
    fetchQueue();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchQueue, 5000); // Refresh every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [businessId, autoRefresh]);

  const fetchQueue = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/queue/${businessId}`);
      setQueue(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching queue:', error);
      setLoading(false);
    }
  };

  const fetchNextToken = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/queue/next-token/${businessId}`);
      setNextToken(response.data.nextToken);
    } catch (error) {
      console.error('Error fetching next token:', error);
    }
  };

  const addToQueue = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) return;
    
    try {
      await axios.post('http://localhost:5000/api/queue', {
        businessId: parseInt(businessId),
        customerName: customerName,
        tokenNumber: nextToken
      });
      
      setMessage(`✓ Token #${nextToken} added for ${customerName}`);
      setCustomerName('');
      setShowAddForm(false);
      fetchQueue();
      fetchNextToken();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error adding customer to queue');
    }
  };

  const callNext = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/queue/call-next/${businessId}`);
      setMessage(`✓ Called token #${response.data.customer.token_number} - ${response.data.customer.customer_name}`);
      fetchQueue();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'No customers in queue');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const completeCustomer = async (tokenId, tokenNumber) => {
    try {
      await axios.put(`http://localhost:5000/api/queue/complete/${tokenId}`);
      setMessage(`✓ Token #${tokenNumber} completed`);
      fetchQueue();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error completing customer');
    }
  };

  const skipCustomer = async (tokenId, tokenNumber) => {
    try {
      await axios.put(`http://localhost:5000/api/queue/skip/${tokenId}`);
      setMessage(`Token #${tokenNumber} skipped`);
      fetchQueue();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error skipping customer');
    }
  };

  const removeCustomer = async (tokenId, tokenNumber) => {
    if (window.confirm(`Remove token #${tokenNumber} from queue?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/queue/${tokenId}`);
        setMessage(`Token #${tokenNumber} removed`);
        fetchQueue();
        
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('Error removing customer');
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      waiting: 'bg-yellow-100 text-yellow-700',
      serving: 'bg-green-100 text-green-700 animate-pulse',
      completed: 'bg-blue-100 text-blue-700',
      skipped: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return badges[status] || badges.waiting;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Queue Management</h2>
          <p className="text-gray-500 mt-1">Manage walk-in customers and digital tokens</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              autoRefresh ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <ArrowPathIcon className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-medium flex items-center gap-2"
          >
            <UserPlusIcon className="w-4 h-4" />
            Add Walk-in
          </button>
        </div>
      </div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg text-center"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Customer Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Add Walk-in Customer</h3>
              <form onSubmit={addToQueue}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter customer name"
                    required
                    autoFocus
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token Number
                  </label>
                  <div className="text-3xl font-bold text-indigo-600">#{nextToken}</div>
                  <p className="text-xs text-gray-500 mt-1">Auto-assigned</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium"
                  >
                    Add to Queue
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Currently Serving */}
      {queue.serving && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white"
        >
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <p className="text-sm opacity-90">Currently Serving</p>
              <div className="flex items-center gap-3 mt-1">
                <SpeakerWaveIcon className="w-8 h-8" />
                <div>
                  <span className="text-4xl font-bold">#{queue.serving.token_number}</span>
                  <p className="text-lg">{queue.serving.customer_name}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => completeCustomer(queue.serving.id, queue.serving.token_number)}
              className="px-6 py-2 bg-white text-green-600 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Complete Service
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waiting Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-800">Waiting Queue</h3>
              <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">
                {queue.waitingCount} waiting
              </span>
            </div>
            <button
              onClick={callNext}
              disabled={queue.waitingCount === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Call Next
            </button>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {queue.waiting.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <UserGroupIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No customers in queue</p>
              </div>
            ) : (
              queue.waiting.map((customer, index) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 flex justify-between items-center hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-xl font-bold text-indigo-600">{customer.token_number}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{customer.customer_name}</p>
                      <p className="text-xs text-gray-500">
                        Added {new Date(customer.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => skipCustomer(customer.id, customer.token_number)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                      title="Skip"
                    >
                      <XCircleIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => removeCustomer(customer.id, customer.token_number)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Remove"
                    >
                      <UserIcon className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-gray-500" />
              Recent Activity
            </h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {queue.completed.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>No recent activity</p>
              </div>
            ) : (
              queue.completed.map((customer, index) => (
                <div key={index} className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(customer.status)}`}>
                        {customer.status}
                      </span>
                      <p className="font-medium text-gray-800 mt-1">
                        Token #{customer.token_number} - {customer.customer_name}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {customer.completed_at ? new Date(customer.completed_at).toLocaleTimeString() : ''}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-indigo-600">{queue.waitingCount}</p>
          <p className="text-sm text-gray-500">Waiting</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-green-600">{queue.completed.length}</p>
          <p className="text-sm text-gray-500">Served Today</p>
        </div>
      </div>
    </div>
  );
}

export default QueueManagement;