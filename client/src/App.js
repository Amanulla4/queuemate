import React from 'react';
import Register from './components/Register';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>QueueMate</h1>
        <p>Queue & Appointment System for Clinics & Salons</p>
      </header>
      <Register />
    </div>
  );
}

export default App;