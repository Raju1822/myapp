// import logo from './logo.svg';
import './App.css';


import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Welcome from './View/Welcome';
import MemberDashboard from './View/MemberDashboard';
import ManagerDashboard from './View/ManagerDashboard';
import AddMember from './View/AddMember';
import Dashboard from './View/Dashboard';
import Exam from './View/Exam';
import QuestionManager from './View/QuestionManager';
import LeaveManager from './View/LeaveManager';
import CommonReview from './View/CommonReview';


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/add-member" element={<AddMember />} />
        <Route path="/member-dashboard" element={<MemberDashboard />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
           <Route path="/skill-exam" element={<Exam/>}/>
            <Route path="/QuestionManager" element={<QuestionManager/>}/>
            <Route path="/LeaveManager" element={<LeaveManager/>}/>
             <Route path="/common-review" element={<CommonReview/>}/>
      </Routes>
    </BrowserRouter>
      </header>
    </div>
  );
}

export default App;



