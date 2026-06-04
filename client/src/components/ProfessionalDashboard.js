import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon, 
  CalendarIcon, 
  UsersIcon, 
  LinkIcon, 
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  SparklesIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import ServiceManagement from './ServiceManagement';
import StaffManagement from './StaffManagement';
import CustomerBooking from './CustomerBooking';
import AppointmentCalendar from './AppointmentCalendar';
import QueueManagement from './QueueManagement';

const ProfessionalDashboard = ({ businessId, businessName, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const navigation = [
    { name: 'Overview', id: 'overview', icon: HomeIcon, description: 'Business insights & metrics' },
    { name: 'Services', id: 'services', icon: CalendarIcon, description: 'Manage your offerings' },
    { name: 'Staff', id: 'staff', icon: UsersIcon, description: 'Team management' },
    { name: 'Appointments', id: 'appointments', icon: ClockIcon, description: 'View & manage bookings' },
    { name: 'Queue', id: 'queue', icon: UserGroupIcon, description: 'Walk-in queue management' },
    { name: 'Booking Link', id: 'booking', icon: LinkIcon, description: 'Share with customers' },
  ];

  const stats = [
    { label: 'Active Services', value: '0', icon: CalendarIcon, change: '+0', changeType: 'increase' },
    { label: 'Staff Members', value: '0', icon: UsersIcon, change: '+0', changeType: 'increase' },
    { label: 'Today\'s Appointments', value: '0', icon: ClockIcon, change: '0', changeType: 'neutral' },
    { label: 'Completion Rate', value: '0%', icon: ChartBarIcon, change: '0%', changeType: 'neutral' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 100 }}
        className="fixed left-0 top-0 h-full w-80 bg-white/90 backdrop-blur-xl shadow-2xl z-50 border-r border-white/20"
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="p-6 border-b border-gray-100">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  QueueMate
                </h1>
                <p className="text-xs text-gray-500">Enterprise Queue System</p>
              </div>
            </motion.div>
          </div>

          {/* User Profile */}
          <div className="p-6 border-b border-gray-100">
            <motion.div 
              whileHover={{ y: -2 }}
              className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4"
            >
              <p className="text-xs text-gray-500 mb-1">{greeting}</p>
              <p className="font-semibold text-gray-800 truncate">{businessName}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-white/80 rounded-full px-2 py-0.5 text-gray-600">Business ID: {businessId}</span>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <div className="text-left">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className={`text-xs ${isActive ? 'text-indigo-100' : 'text-gray-400'}`}>
                      {item.description}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-100">
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium text-sm">Logout</p>
                <p className="text-xs text-gray-400">End your session</p>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="ml-80 p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
                <p className="text-gray-500 mt-1">Monitor your business performance and manage operations</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <span className={`text-sm font-medium ${
                          stat.changeType === 'increase' ? 'text-green-600' : 
                          stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                      <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Quick Actions Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white mb-8"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Quick Setup Guide</h3>
                    <p className="text-indigo-100">Follow these steps to get your business running</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-sm font-medium">
                      1️⃣ Add Services
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-sm font-medium">
                      2️⃣ Add Staff
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-sm font-medium">
                      3️⃣ Share Booking Link
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Business Info Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <BuildingStorefrontIcon className="w-6 h-6 text-indigo-600" />
                    <h3 className="font-semibold text-gray-800">Business Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      <span>Business verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      <span>Email notifications: Active</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <PhoneIcon className="w-4 h-4 text-gray-400" />
                      <span>SMS notifications: Coming soon</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <SparklesIcon className="w-6 h-6 text-indigo-600" />
                    <h3 className="font-semibold text-gray-800">Pro Tips</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">• Add detailed service descriptions for better customer experience</li>
                    <li className="flex items-start gap-2">• Share your booking link on social media and WhatsApp</li>
                    <li className="flex items-start gap-2">• Update staff availability to avoid double bookings</li>
                  </ul>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <ServiceManagement businessId={businessId} />
            </motion.div>
          )}

          {activeTab === 'staff' && (
            <motion.div
              key="staff"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <StaffManagement businessId={businessId} />
            </motion.div>
          )}

          {activeTab === 'appointments' && (
            <motion.div
              key="appointments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <AppointmentCalendar businessId={businessId} />
            </motion.div>
          )}

          {activeTab === 'queue' && (
            <motion.div
              key="queue"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <QueueManagement businessId={businessId} />
            </motion.div>
          )}

          {activeTab === 'booking' && (
            <motion.div
              key="booking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Booking Link</h2>
                <p className="text-gray-500 mt-1">Share this unique link with your customers</p>
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-8">
                <div className="flex flex-wrap gap-4 items-center">
                  <code className="flex-1 p-3 bg-white rounded-lg text-indigo-600 font-mono text-sm">
                    {`${window.location.origin}/book/${businessId}`}
                  </code>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/book/${businessId}`);
                      alert('✓ Booking link copied to clipboard');
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-medium shadow-md"
                  >
                    Copy Link
                  </motion.button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Preview</h3>
                <div className="border rounded-xl overflow-hidden shadow-sm">
                  <CustomerBooking businessId={businessId} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ProfessionalDashboard;