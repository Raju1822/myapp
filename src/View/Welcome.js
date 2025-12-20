
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import brand from '../logo.svg';
import placeholder from '../placeholder-img.jpg'
const API_BASE_URL = 'http://localhost:5000';
const Welcome = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
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
      if (data.success) {

        // Save user in localStorage
        localStorage.setItem('loggedInUser', JSON.stringify(data.user));
        if (data.user.level === 2) {
           navigate('/manager-dashboard');
          // navigate('/dashboard')
        } else if (data.user.level === 3) {
          navigate('/member-dashboard');
        } else if (data.user.level === 1) {
          navigate('/dashboard')
        }
      } else {
        alert('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center gap-2" href="/">
            <img
              src={brand}
              alt="Brand"
              width="36"
              height="36"
              className="rounded-circle"
            />
            <span className="fw-semibold">Team Productivity</span>
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="/">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/">Gallery</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/">Contact Us</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* Main Content */}
      <main className="flex-grow-1">
        <div className="container py-1">
          <div className="row align-items-center g-4">
            {/* Left: Hero */}
            <div className="col-12 col-lg-6">
              <div className="p-4 p-lg-5">
                <h1 className=" fw-bold mb-3 text-wrap">
                  Welcome to Team Productivity Dashboard
                </h1>
                <p className="lead text-secondary mb-4">
                  Track tasks, manage skills, and boost productivity. Sign in to access your personalized dashboard and start collaborating efficiently.
                </p>


                <div className="d-flex align-items-center gap-3">
                  <img
                    src={placeholder}
                    alt="Hero"
                    className="img-fluid rounded shadow-sm"
                    style={{ maxWidth: '220px' }}
                  />
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      ✅ Task management & progress tracking
                    </li>
                    <li className="mb-2">
                      ✅ Leave Management & tracking
                    </li>
                    <li className="mb-2">
                      ✅ Skill mapping & team insights
                    </li>
                    <li className="mb-2">
                      ✅ Skill assessments & certifications
                    </li>
                    <li className="mb-2">
                      ✅ Monthly Review & feedback system
                    </li>
                    <li className="mb-2">
                      ✅ Real-time collaboration & updates
                    </li>

                  </ul>
                </div>



              </div>
            </div>
            {/* Right: Login Card */}
            <div className="col-12 col-lg-6">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4 p-lg-5">
                  <h2 className="h4 fw-semibold mb-4 text-center">Login</h2>
                  <form onSubmit={handleLogin} noValidate>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
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
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
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
                    {error && (
                      <div className="alert alert-danger" role="alert" aria-live="assertive">
                        {error}
                      </div>
                    )}
                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2"
                      disabled={submitting}
                      style={{ backgroundColor: '#3d71acff' }}
                    >
                      {submitting ? 'Logging in…' : 'Login'}
                    </button>
                    <div className="text-center mt-3">
                      <a href="/" className="text-decoration-none">Forgot your password?</a>
                    </div>
                  </form>
                  <hr className="my-4" />
                  <div className="text-center text-muted small">
                    By logging in, you agree to our <a href="/" className="text-decoration-none">Terms</a> and <a href="/" className="text-decoration-none">Privacy Policy</a>.
                  </div>
                </div>
              </div>
              {/* Optional: Secondary CTA */}
              <div className="text-center mt-3">
                <span className="text-muted">New here?</span>{' '}
                <a href="/" className="text-decoration-none">Request access</a>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="border-top bg-white">
        <div className="container py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2">
          <span className="text-muted small">© {new Date().getFullYear()} Team Productivity</span>
          <div className="d-flex gap-3 small">
            <a href="/support" className="text-decoration-none">Support</a>
            <a href="/" className="text-decoration-none">Status</a>
            <a href="/docs" className="text-decoration-none">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Welcome;
