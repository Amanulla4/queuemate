import React, { useState } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import ServiceManagement from './components/ServiceManagement';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [businessId, setBusinessId] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogin = (id, name) => {
    setBusinessId(id);
    setBusinessName(name);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setBusinessId(null);
    setBusinessName('');
    setActiveTab('dashboard');
  };

  if (isLoggedIn) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>QueueMate Dashboard</h1>
          <p>Welcome, {businessName}!</p>
          <div style={{ marginTop: '10px' }}>
            <button onClick={() => setActiveTab('dashboard')} style={tabButtonStyle(activeTab === 'dashboard')}>
              Dashboard
            </button>
            <button onClick={() => setActiveTab('services')} style={tabButtonStyle(activeTab === 'services')}>
              Services
            </button>
            <button onClick={handleLogout} style={{ ...tabButtonStyle(false), backgroundColor: '#dc3545', color: 'white' }}>
              Logout
            </button>
          </div>
        </header>
        
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          {activeTab === 'dashboard' && (
            <div>
              <h2>Business Dashboard</h2>
              <p>Business ID: {businessId}</p>
              <p>Welcome to QueueMate! Use the tabs above to manage your services and appointments.</p>
              <hr />
              <h3>Quick Stats</h3>
              <p>✅ Services: Use the Services tab to add your offerings</p>
              <p>📅 Appointments: Coming soon</p>
              <p>🎫 Queue Management: Coming soon</p>
            </div>
          )}
          
          {activeTab === 'services' && (
            <ServiceManagement businessId={businessId} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>QueueMate</h1>
        <p>Queue & Appointment System for Clinics & Salons</p>
      </header>
      
      {showRegister ? (
        <>
          <Register />
          <p style={{ textAlign: 'center', marginTop: '16px' }}>
            Already have an account?{' '}
            <button onClick={() => setShowRegister(false)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>
              Login
            </button>
          </p>
        </>
      ) : (
        <>
          <Login onLogin={handleLogin} />
          <p style={{ textAlign: 'center', marginTop: '16px' }}>
            Don't have an account?{' '}
            <button onClick={() => setShowRegister(true)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>
              Register
            </button>
          </p>
        </>
      )}
    </div>
  );
}

const tabButtonStyle = (isActive) => ({
  padding: '8px 16px',
  margin: '0 5px',
  backgroundColor: isActive ? '#007bff' : '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
});

export default App;