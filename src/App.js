// import logo from './logo.svg';
import './App.css';


import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import MemberDashboard from './pages/MemberDashboard';
import ManagerDashboard from './pages/ManagerDashboard';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/member-dashboard" element={<MemberDashboard />} />
      </Routes>
    </BrowserRouter>
      </header>
    </div>
  );
}

export default App;



