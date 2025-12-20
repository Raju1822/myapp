


import React from "react";

const Docs = () => {
  return (
<>


 <div className="container mt-5">
      {/* Page Header */}
      <div className="text-center mb-5">
        <h1 className="fw-bold text-primary">Project Documentation</h1>
        <p className="text-muted">
          Explore details about our projects, features, and API endpoints.
        </p>
      </div>

      {/* Project Overview */}
      <section className="mb-5">
        <h3 className="fw-bold mb-3">Overview</h3>
        <p>
          Our platform is designed to improve team productivity by providing
          tools for task management, skill tracking, and performance monitoring.
          It includes modules for user profile management, skill assessments,
          leave management, and reporting dashboards.
        </p>
      </section>

      {/* Features Section */}
      <section className="mb-5">
        <h3 className="fw-bold mb-3">Key Features</h3>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            ✅ <strong>Team Productivity Dashboard:</strong> Track tasks and
            monitor progress in real-time.
          </li>
          <li className="list-group-item">
            ✅ <strong>Skill Assessment Module:</strong> Evaluate and update
            employee skills with dynamic exams.
          </li>
          <li className="list-group-item">
            ✅ <strong>Leave Management System:</strong> Request and approve
            leaves with history tracking.
          </li>
          <li className="list-group-item">
            ✅ <strong>Profile Management:</strong> Update user details and
            upload profile pictures securely.
          </li>
        </ul>
      </section>

      {/* Tech Stack */}
      <section className="mb-5">
        <h3 className="fw-bold mb-3">Technology Stack</h3>
        <div className="row">
          <div className="col-md-4">
            <div className="card shadow-sm mb-3">
              <div className="card-body text-center">
                <h5 className="card-title">Frontend</h5>
                <p className="card-text">React, Bootstrap, JavaScript</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm mb-3">
              <div className="card-body text-center">
                <h5 className="card-title">Backend</h5>
                <p className="card-text">Node.js, Express, Multer</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm mb-3">
              <div className="card-body text-center">
                <h5 className="card-title">Database</h5>
                <p className="card-text">Microsoft SQL Server</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Documentation */}
      <section className="mb-5">
        <h3 className="fw-bold mb-3">API Endpoints</h3>
        <p>Here are some commonly used API endpoints:</p>
        <pre className="bg-light p-3 rounded">
GET /api/user/:EmployeeId        - Fetch user details
POST /api/update-profile         - Update user profile
POST /api/add-skill              - Add a new skill
POST /api/update-skill           - Update skill details
GET /api/tasks/:EmployeeId       - Fetch tasks for a user
        </pre>
      </section>

      {/* Footer */}
      <div className="text-center mt-5">
        <p className="text-muted">
          For more details, visit our <a href="/support">Support Page</a>.
        </p>
      </div>
    </div>





</>








  );
};

export default Docs;