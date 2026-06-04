import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import CustomerBooking from './components/CustomerBooking';
import LiveQueueStatus from './components/LiveQueueStatus';
import ProfessionalDashboard from './components/ProfessionalDashboard';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [businessId, setBusinessId] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (id, name) => {
    setBusinessId(id);
    setBusinessName(name);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setBusinessId(null);
    setBusinessName('');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/book/:businessId" element={<CustomerBookingWrapper />} />
        <Route path="/queue/:businessId" element={<LiveQueueStatusWrapper />} />
        <Route path="/" element={
          isLoggedIn ? (
            <ProfessionalDashboard 
              businessId={businessId} 
              businessName={businessName} 
              onLogout={handleLogout} 
            />
          ) : (
            <div>
              {showRegister ? (
                <>
                  <Register />
                  <div className="text-center mt-4">
                    <button 
                      onClick={() => setShowRegister(false)} 
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Login onLogin={handleLogin} />
                  <div className="text-center mt-4">
                    <button 
                      onClick={() => setShowRegister(true)} 
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Don't have an account? Register
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        } />
      </Routes>
    </BrowserRouter>
  );
}

function CustomerBookingWrapper() {
  const { businessId } = useParams();
  return <CustomerBooking businessId={businessId} />;
}

function LiveQueueStatusWrapper() {
  const { businessId } = useParams();
  return <LiveQueueStatus businessId={businessId} />;
}

export default App;