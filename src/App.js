
// src/App.js
import "./App.css";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Welcome from "./View/Welcome";
import MemberDashboard from "./View/MemberDashboard";
import ManagerDashboard from "./View/ManagerDashboard";
import AddMember from "./View/AddMember";
import Dashboard from "./View/Dashboard";
import Exam from "./View/Exam";
import QuestionManager from "./View/QuestionManager";
import LeaveManager from "./View/LeaveManager";
import CommonReview from "./View/CommonReview";
import MemberAction from "./View/Manager/MemberAction";

import Support from "./pages/Support";
import Docs from "./pages/Document";

import { RequireAuth, RequireRole } from "./auth/RouteGuards";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>

          {/* ===== Public routes ===== */}
          <Route path="/" element={<Welcome />} />
          <Route path="/support" element={<Support />} />
          <Route path="/docs" element={<Docs />} />

          {/* ===== Protected routes (login required) ===== */}
          <Route element={<RequireAuth />}>
            {/* Shared protected routes (any logged-in user) */}
            <Route path="/member-dashboard" element={<MemberDashboard />} />
            <Route path="/skill-exam" element={<Exam />} />
            <Route path="/LeaveManager" element={<LeaveManager />} />
            <Route path="/common-review" element={<CommonReview />} />

            {/* Manager/Director routes — protect by role or level if needed */}
            {/* Example: allow only 'manager' role and director level 1 */}
            <Route element={<RequireRole allow={["manager", 1]} />}>
              <Route path="/manager-dashboard" element={<ManagerDashboard />} />
              <Route path="/add-member" element={<AddMember />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/QuestionManager" element={<QuestionManager />} />
              <Route path="/user-action/:empId" element={<MemberAction />} />
            </Route>
          </Route>

          {/* ===== 404 fallback ===== */}
          <Route path="*" element={<Welcome />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
