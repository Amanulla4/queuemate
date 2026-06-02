import React, { useState } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import './App.css';

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

  if (isLoggedIn) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>QueueMate Dashboard</h1>
          <p>Welcome, {businessName}!</p>
          <button onClick={handleLogout} style={{ marginTop: '10px', padding: '8px 16px' }}>
            Logout
          </button>
        </header>
        <div style={{ padding: '20px' }}>
          <h3>Business ID: {businessId}</h3>
          <p>Dashboard features coming soon...</p>
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

export default App;