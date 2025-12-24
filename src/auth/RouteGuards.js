
// src/auth/RouteGuards.js
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/** Get current user from localStorage */
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("loggedInUser");
    if (!raw) return null;
    const user = JSON.parse(raw);
    // minimal sanity checks
    if (!user || !user.EmployeeId) return null;
    return user;
  } catch {
    return null;
  }
};

/** Protect routes: only allow when user is present */
export const RequireAuth = () => {
  const user = getCurrentUser();
  const location = useLocation();

  if (!user) {
    // Redirect to Welcome; preserve intended path so you can optionally redirect after login
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return <Outlet />;
};

/** Optional: Protect by role (e.g., manager-only) or level */
export const RequireRole = ({ allow = [] }) => {
  const user = getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // You can check role or level depending on your logic
  const userRole = (user.role || "").toLowerCase(); // 'member' | 'manager' | maybe 'director'
  const userLevel = Number(user.level || 0);         // 1 director, 2 manager, 3 member (as per your codebase)

  const allowed =
    allow.length === 0
      ? true
      : allow.includes(userRole) || allow.includes(userLevel);

  if (!allowed) {
    // Optionally send to a “Not authorized” page or back to dashboard
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
