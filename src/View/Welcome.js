
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import brand from '../logo.svg';
import placeholder from '../placeholder-img.jpg';

import { useLocation } from 'react-router-dom';



const API_BASE_URL = 'http://localhost:5000';

const Welcome = () => {
  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Page mode: false = normal login/hero, true = reset-only view
  const [showReset, setShowReset] = useState(false);

  // Forgot Password states
  const [identifier, setIdentifier] = useState(''); // Email or EmployeeId
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);

  // Global banner on login view after successful reset
  // const [loginInfoMessage, setLoginInfoMessage] = useState('');

  const navigate = useNavigate();





// inside component:
const location = useLocation();
const initialBanner = location.state?.loginInfoMessage || '';
const [loginInfoMessage, setLoginInfoMessage] = useState(initialBanner);

// Auto-clear banner after 6 seconds
useEffect(() => {
  if (loginInfoMessage) {
    const t = setTimeout(() => setLoginInfoMessage(''), 6000);
    return () => clearTimeout(t);
  }
}, [loginInfoMessage]);




  // ----------------------------------------
  // Login handler
  // ----------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (!response.ok || !data?.success) {
        const msg = data?.message || 'Invalid email or password';
        throw new Error(msg);
      }

      // Save user and route by level
      localStorage.setItem('loggedInUser', JSON.stringify(data.user));
      if (data.user.level === 2) {
        navigate('/manager-dashboard');
      } else if (data.user.level === 3) {
        navigate('/member-dashboard');
      } else if (data.user.level === 1) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------
  // Open/close Reset view
  // ----------------------------------------
  const openResetView = (e) => {
    e.preventDefault();
    setShowReset(true);
    setResetMessage('');
    // clear fields when entering reset-only view
    setIdentifier('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const backToLoginView = (e) => {
    e.preventDefault();
    setShowReset(false);
    setResetMessage('');
  };

  // ----------------------------------------
  // Reset Password handler (auto-return with banner)
  // ----------------------------------------
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMessage('');

    // Client-side validation
    if (!identifier.trim()) {
      setResetMessage('Please enter your Email or Employee ID.');
      return;
    }
    if (!newPassword || !confirmPassword) {
      setResetMessage('Please enter the new password and confirm it.');
      return;
    }
    if (newPassword.length < 8) {
      setResetMessage('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetMessage('New password and confirmation do not match.');
      return;
    }

    setResetSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reset-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, new_password: newPassword })
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        const msg = data?.message || 'Password reset failed';
        throw new Error(msg);
      }

      // Show success in reset view, then switch back to login after 2s with banner
      setResetMessage('✅ Password updated successfully. Redirecting you to login…');
      setTimeout(() => {
        setShowReset(false);
        setPassword(''); // clear login password field for safety
        setLoginInfoMessage('✅ Your password has been updated. Please login with your new password.');
        // Auto-hide banner after 6 seconds
        setTimeout(() => setLoginInfoMessage(''), 6000);
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      setResetMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setResetSubmitting(false);
    }
  };





  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Navbar (always visible) */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <img src={brand} alt="Brand" width="36" height="36" className="rounded-circle" />
            <span className="fw-semibold">Team Productivity</span>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          {!showReset && (
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link active" to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/">Gallery</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/support">Contact Us</Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* Main content switches entirely based on showReset */}
      {!showReset ? (
        // ---------------------------
        // Normal view: Hero + Login
        // ---------------------------
        <main className="flex-grow-1 d-flex align-items-center justify-content-center py-4">
          <div className="container">
            <div className="row align-items-center g-4">
              {/* Left: Hero */}
              <div className="col-12 col-lg-6">
                <div className="p-4 p-lg-5">
                  <h1 className="fw-bold mb-3 text-primary">
                    Welcome to Team Productivity Dashboard
                  </h1>
                  <p className="lead text-secondary mb-4">
                    Track tasks, manage, and boost productivity. Sign in to access your personalized dashboard and start collaborating efficiently.
                  </p>
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={placeholder}
                      alt="Hero"
                      className="img-fluid rounded shadow-sm"
                      style={{ maxWidth: '220px' }}
                    />
                    <ul className="list-unstyled mb-0 small">
                      <li className="mb-2">✅ Task management &amp; progress tracking</li>
                      <li className="mb-2">✅ Leave Management &amp; tracking</li>
                      <li className="mb-2">✅ Skill mapping &amp; team insights</li>
                      <li className="mb-2">✅ Skill assessments &amp; certifications</li>
                      <li className="mb-2">✅ Monthly Review &amp; feedback system</li>
                      <li className="mb-2">✅ Real-time collaboration &amp; updates</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right: Login Card */}
              <div className="col-12 col-lg-6">
                <div className="card shadow-lg border-0 rounded-2">
                  <div className="card-body p-4 p-lg-5">
                    <h2 className="h4 fw-semibold mb-4 text-center text-primary">
                      <i className="bi bi-box-arrow-in-right me-2" /> Login
                    </h2>

                    {/* Success banner after reset */}
                    {loginInfoMessage && (
                      <div className="alert alert-success" role="alert">
                        {loginInfoMessage}
                      </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin} noValidate>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label fw-semibold">Email</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light">
                            <i className="bi bi-envelope-fill text-primary" />
                          </span>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            className="form-control"
                            placeholder="name@example.com"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="password" className="form-label fw-semibold">Password</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light">
                            <i className="bi bi-lock-fill text-primary" />
                          </span>
                          <input
                            id="password"
                            name="password"
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="alert alert-danger" role="alert" aria-live="assertive">
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="btn btn-primary w-100 py-2 fw-bold"
                        disabled={submitting}
                      >
                        {submitting ? 'Logging in…' : 'Login'}
                      </button>

                      <div className="text-center mt-3">
                        <a href="#1" className="text-decoration-none" onClick={openResetView}>
                          Forgot your password?
                        </a>
                      </div>
                    </form>

                    <hr className="my-4" />
                    <div className="text-center text-muted small">
                      By logging in, you agree to our <Link to="/" className="text-decoration-none">Terms</Link> and{' '}
                      <Link to="/" className="text-decoration-none">Privacy Policy</Link>.
                    </div>
                  </div>
                </div>

                {/* Optional: Secondary CTA */}
                <div className="text-center mt-3">
                  <span className="text-muted">New here?</span>{' '}
                  <Link to="/" className="text-decoration-none fw-semibold">Request access</Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        // ---------------------------
        // Reset-only view (hide everything else)
        // ---------------------------
        <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
          <div className="container" style={{ maxWidth: 560 }}>
            <div className="card shadow-lg border-0 rounded-2">
              <div className="card-body p-4 p-lg-5">
                <h2 className="h4 fw-semibold mb-3 text-center text-primary">
                  <i className="bi bi-shield-lock me-2" />
                  Reset your password
                </h2>
                <p className="text-muted text-center mb-4">
                  Enter your <strong>Email</strong> or <strong>Employee ID</strong> and choose a new password.
                </p>

                <form onSubmit={handleResetPassword} noValidate>
                  <div className="mb-3">
                    <label htmlFor="identifier" className="form-label">Email or Employee ID</label>
                    <input
                      id="identifier"
                      type="text"
                      className="form-control"
                      placeholder="e.g., name@example.com OR EMP123"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">New Password</label>
                    <input
                      id="newPassword"
                      type="password"
                      className="form-control"
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="form-control"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  {resetMessage && (
                    <div
                      className={`alert ${resetMessage.startsWith('✅') ? 'alert-success' : 'alert-warning'}`}
                      role="alert"
                    >
                      {resetMessage}
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary fw-semibold w-100"
                      disabled={resetSubmitting}
                    >
                      {resetSubmitting ? 'Updating…' : 'Update Password'}
                    </button>
                  </div>
                </form>

                <div className="text-center mt-3">
                  <a href="#1" className="text-decoration-none" onClick={backToLoginView}>
                    ← Back to login
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Footer only in normal view */}
      {!showReset && (
        <footer className="border-top bg-white mt-auto">
          <div className="container py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2">
            <span className="text-muted small">© {new Date().getFullYear()} Team Productivity</span>
            <div className="d-flex gap-3 small">
              <Link to="/support" className="text-decoration-none">Support</Link>
              <Link to="/" className="text-decoration-none">Status</Link>
              <Link to="/docs" className="text-decoration-none">Docs</Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Welcome;
