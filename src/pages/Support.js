
import React, { useState } from "react";
import brand from '../logo.svg';

const Support = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Submitting...");

    try {
      const response = await fetch("http://localhost:5000/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        setStatus("✅ " + result.message);
        setFormData({ name: "", email: "", message: "" }); // Reset form

      } else {
        setStatus("❌ " + result.message);
      }
    } catch (error) {
      console.error("Error submitting support request:", error);
      setStatus("❌ Failed to submit. Please try again.");
    }
  };

  return (
    <>

{/* Navbar */}
  <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top">
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
          <li className="nav-item"><a className="nav-link active" href="/">Home</a></li>
          <li className="nav-item"><a className="nav-link" href="/">Gallery</a></li>
          <li className="nav-item"><a className="nav-link" href="/support">Contact Us</a></li>
        </ul>
        </div>
</div>
</nav>


    <div className="container mt-4">
      <h2 className="text-center mb-4">Support Center</h2>

      {/* FAQ Section */}
      <div className="accordion mb-4" id="faqAccordion">
        <div className="accordion-item">
          <h2 className="accordion-header" id="faq1">
            <button
              className="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapse1"
            >
              How do I reset my password?
            </button>
          </h2>
          <div
            id="collapse1"
            className="accordion-collapse collapse show"
            data-bs-parent="#faqAccordion"
          >
            <div className="accordion-body">
              Go to your profile settings and click on <strong>Reset Password</strong>. You will receive an email with instructions.
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header" id="faq2">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapse2"
            >
              How do I update my profile?
            </button>
          </h2>
          <div
            id="collapse2"
            className="accordion-collapse collapse"
            data-bs-parent="#faqAccordion"
          >
            <div className="accordion-body">
              Navigate to your dashboard and click <strong>Update Profile</strong>. You can edit your details and upload a new profile picture.
            </div>
          </div>
        </div>
      </div>




























      <p className="text-muted text-center">Need help? Fill out the form below.</p>




      <div className="card shadow-lg p-4">
        <h4 className="mb-3">Contact Support</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Your Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Message</label>
            <textarea
              name="message"
              className="form-control"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <div className="d-flex justify-content-between">
            <button type="submit" className="btn btn-primary">Submit</button>
                       <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setFormData({ name: "", email: "", message: "" })}
            >
              Cancel
            </button>
          </div>
        </form>
        {status && <p className="mt-3 text-center">{status}</p>}
      </div>





    </div>





<footer className="border-top bg-white mt-5">
    <div className="container py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2">
      <span className="text-muted small">© {new Date().getFullYear()} Team Productivity</span>
      <div className="d-flex gap-3 small">
        <a href="/support" className="text-decoration-none">Support</a>
        <a href="/" className="text-decoration-none">Status</a>
        <a href="/docs" className="text-decoration-none">Docs</a>
      </div>
    </div>
  </footer>

  </>
  );
};

export default Support;