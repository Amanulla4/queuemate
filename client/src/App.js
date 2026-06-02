import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import ServiceManagement from './components/ServiceManagement';
import StaffManagement from './components/StaffManagement';
import CustomerBooking from './components/CustomerBooking';
import './App.css';

// Dashboard component (logged in view)
function Dashboard({ businessId, businessName, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');

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
          <button onClick={() => setActiveTab('staff')} style={tabButtonStyle(activeTab === 'staff')}>
            Staff
          </button>
          <button onClick={() => setActiveTab('booking-link')} style={tabButtonStyle(activeTab === 'booking-link')}>
            Booking Link
          </button>
          <button onClick={onLogout} style={{ ...tabButtonStyle(false), backgroundColor: '#dc3545', color: 'white' }}>
            Logout
          </button>
        </div>
      </header>
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'dashboard' && (
          <div>
            <h2>Business Dashboard</h2>
            <p>Business ID: {businessId}</p>
            <p>Welcome to QueueMate! Use the tabs above to manage your services, staff, and appointments.</p>
            <hr />
            <h3>Quick Stats</h3>
            <p>✅ Services: Use the Services tab to add your offerings</p>
            <p>👥 Staff: Use the Staff tab to add team members</p>
            <p>🔗 Booking Link: Share your unique booking page with customers</p>
            <p>📅 Appointments: Coming soon</p>
            <p>🎫 Queue Management: Coming soon</p>
          </div>
        )}
        
        {activeTab === 'services' && (
          <ServiceManagement businessId={businessId} />
        )}
        
        {activeTab === 'staff' && (
          <StaffManagement businessId={businessId} />
        )}

        {activeTab === 'booking-link' && (
          <div style={bookingLinkContainerStyle}>
            <h2>Your Public Booking Page</h2>
            <p>Share this link with customers so they can book appointments online:</p>
            <div style={linkBoxStyle}>
              <code style={linkStyle}>
                {`${window.location.origin}/book/${businessId}`}
              </code>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/book/${businessId}`);
                  alert('Booking link copied to clipboard!');
                }}
                style={copyButtonStyle}
              >
                Copy Link
              </button>
            </div>
            <p style={{ marginTop: '20px', color: '#6c757d' }}>
              💡 Tip: Add this link to your Instagram bio, website, or WhatsApp status.
            </p>
            <hr style={{ margin: '30px 0' }} />
            <h3>Preview</h3>
            <div style={previewBoxStyle}>
              <CustomerBooking businessId={businessId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main App Component
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
        {/* Public booking page route */}
        <Route path="/book/:businessId" element={<CustomerBookingWrapper />} />
        
        {/* Main app route */}
        <Route path="/" element={
          isLoggedIn ? (
            <Dashboard 
              businessId={businessId} 
              businessName={businessName} 
              onLogout={handleLogout} 
            />
          ) : (
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
          )
        } />
      </Routes>
    </BrowserRouter>
  );
}

// Wrapper for CustomerBooking to get businessId from URL params
function CustomerBookingWrapper() {
  const { businessId } = useParams();
  return <CustomerBooking businessId={businessId} />;
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

const bookingLinkContainerStyle = {
  padding: '20px'
};

const linkBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  backgroundColor: '#f8f9fa',
  padding: '15px',
  borderRadius: '8px',
  marginTop: '10px'
};

const linkStyle = {
  flex: 1,
  padding: '10px',
  backgroundColor: 'white',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontFamily: 'monospace',
  wordBreak: 'break-all'
};

const copyButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

const previewBoxStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '20px',
  maxHeight: '600px',
  overflowY: 'auto',
  backgroundColor: '#fff'
};

export default App;