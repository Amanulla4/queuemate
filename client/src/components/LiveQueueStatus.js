import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  BellAlertIcon,
  ArrowPathIcon,
  QueueListIcon
} from '@heroicons/react/24/outline';

function LiveQueueStatus({ businessId }) {
  const [tokenNumber, setTokenNumber] = useState('');
  const [queueStatus, setQueueStatus] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    fetchOverview();
    
    let interval;
    if (autoRefresh && searched) {
      interval = setInterval(() => {
        if (tokenNumber) {
          checkPosition();
        }
        fetchOverview();
      }, 10000); // Refresh every 10 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, searched, tokenNumber]);

  const fetchOverview = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/public/queue-overview/${businessId}`);
      setOverview(response.data);
    } catch (error) {
      console.error('Error fetching overview:', error);
    }
  };

  const checkPosition = async () => {
    if (!tokenNumber) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`http://localhost:5000/api/public/queue-position/${businessId}/${tokenNumber}`);
      setQueueStatus(response.data);
      setSearched(true);
    } catch (error) {
      setError(error.response?.data?.error || 'Token not found');
      setQueueStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tokenNumber) {
      checkPosition();
    }
  };

  const getStatusMessage = () => {
    if (!queueStatus) return null;
    
    switch(queueStatus.status) {
      case 'waiting':
        if (queueStatus.positionAhead === 0) {
          return {
            title: "You're Next!",
            message: "You are the next customer to be called. Please be ready.",
            color: "from-orange-500 to-red-500",
            icon: BellAlertIcon
          };
        }
        return {
          title: `Position: ${queueStatus.positionAhead + 1}`,
          message: `${queueStatus.positionAhead} customer(s) ahead of you. Estimated wait: ~${queueStatus.estimatedWaitMinutes} minutes`,
          color: "from-blue-500 to-indigo-500",
          icon: ClockIcon
        };
      case 'serving':
        return {
          title: "It's Your Turn!",
          message: "You are being served now. Please proceed to the counter.",
          color: "from-green-500 to-emerald-500",
          icon: CheckCircleIcon
        };
      case 'completed':
        return {
          title: "Service Completed",
          message: "Thank you for visiting! We hope to see you again.",
          color: "from-gray-500 to-gray-600",
          icon: CheckCircleIcon
        };
      case 'skipped':
        return {
          title: "Token Skipped",
          message: "Your token was skipped. Please contact the front desk.",
          color: "from-red-500 to-red-600",
          icon: BellAlertIcon
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusMessage();
  const StatusIcon = statusInfo?.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Queue Status
          </h1>
          <p className="text-gray-500 mt-2">Check your position in the queue</p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <form onSubmit={handleSubmit} className="flex gap-4 flex-wrap">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Your Token Number
              </label>
              <div className="relative">
                <QueueListIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={tokenNumber}
                  onChange={(e) => setTokenNumber(e.target.value)}
                  placeholder="e.g., 5"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <MagnifyingGlassIcon className="w-5 h-5" />
                )}
                Check Status
              </button>
            </div>
          </form>

          {/* Auto-refresh Toggle */}
          {searched && queueStatus?.status === 'waiting' && (
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`text-sm flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
                  autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <ArrowPathIcon className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </button>
            </div>
          )}
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-center text-red-700"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Queue Status Card */}
        <AnimatePresence>
          {queueStatus && statusInfo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-gradient-to-r ${statusInfo.color} rounded-2xl shadow-xl p-8 text-white mb-8`}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                    <StatusIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Token #{queueStatus.token.token_number}</h2>
                    <p className="text-white/90">{queueStatus.token.customer_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{statusInfo.title}</p>
                  <p className="text-white/90 text-sm">{statusInfo.message}</p>
                </div>
              </div>

              {/* Progress Bar for Waiting */}
              {queueStatus.status === 'waiting' && queueStatus.positionAhead > 0 && (
                <div className="mt-6">
                  <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (1 / (queueStatus.positionAhead + 1)) * 100)}%` }}
                      className="bg-white h-full rounded-full"
                    />
                  </div>
                  <p className="text-xs text-white/70 mt-2 text-center">
                    Progress to front of queue
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Queue Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5 text-indigo-600" />
            Current Queue Status
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{overview?.waitingCount || 0}</p>
              <p className="text-sm text-gray-600">People Waiting</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-xl font-semibold text-green-600">
                {overview?.currentlyServing ? `#${overview.currentlyServing.token_number}` : 'None'}
              </p>
              <p className="text-sm text-gray-600">Currently Serving</p>
              {overview?.currentlyServing && (
                <p className="text-xs text-gray-500 mt-1">{overview.currentlyServing.customer_name}</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          {overview?.recentActivity?.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                Recent Activity
              </h4>
              <div className="space-y-2">
                {overview.recentActivity.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                    <span className="font-medium">Token #{activity.token_number}</span>
                    <span className="text-gray-500">{activity.customer_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activity.status === 'serving' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8 text-sm text-gray-400"
        >
          <p>Queue status updates automatically. Please wait for your token to be called.</p>
        </motion.div>
      </div>
    </div>
  );
}

export default LiveQueueStatus;