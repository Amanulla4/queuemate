import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/login', formData);
      setMessage(`Welcome back, ${response.data.businessName}!`);
      setTimeout(() => {
        onLogin(response.data.businessId, response.data.businessName);
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <FaSignInAlt className="text-white text-3xl" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Login to your QueueMate account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="your@business.com"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {message && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-3 rounded-lg mb-4 text-center ${message.includes('Welcome') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            >
              {message}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold transition-all hover:shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Logging in...
              </div>
            ) : (
              'Login'
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}

export default Login;