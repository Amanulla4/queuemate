import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    axios.get('http://localhost:5000/')
      .then(response => {
        setMessage(response.data);
      })
      .catch(error => {
        console.error('Error connecting to backend:', error);
        setMessage('Backend not connected. Make sure server is running on port 5000');
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>QueueMate</h1>
        <p>Queue & Appointment System for Clinics & Salons</p>
        <p style={{ fontSize: '14px', marginTop: '20px' }}>Backend status: {message}</p>
      </header>
    </div>
  );
}

export default App;