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
        {/* Key Features */}
        <section className="mb-5">
          <h3 className="fw-bold mb-3">Key Features</h3>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              ✅ <strong>Team Productivity Dashboard:</strong> Track tasks and monitor progress in real-time.
            </li>
            <li className="list-group-item">
              ✅ <strong>Skill Assessment Module:</strong> Evaluate and update employee skills with dynamic exams.
            </li>
            <li className="list-group-item">
              ✅ <strong>Leave Management System:</strong> Request and approve leaves with history tracking.
            </li>
            <li className="list-group-item">
              ✅ <strong>Profile Management:</strong> Update user details and upload profile pictures securely.
            </li>
          </ul>
        </section>
        {/* Technology Stack */}
        <section className="mb-5">
          <h3 className="fw-bold mb-3">Technology Stack</h3>
          <div className="row">
            {[
              { title: "Frontend", tech: "React, Bootstrap, JavaScript" },
              { title: "Backend", tech: "Node.js, Express, Multer" },
              { title: "Database", tech: "Microsoft SQL Server" },
            ].map((item, idx) => (
              <div className="col-md-4" key={idx}>
                <div className="card shadow-sm mb-3">
                  <div className="card-body text-center">
                    <h5 className="card-title">{item.title}</h5>
                    <p className="card-text">{item.tech}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* Leaderboard Documentation */}
        <section className="mb-5">
          <h3 className="fw-bold mb-3 text-success">Leaderboard (Skills)</h3>
          <p>
            The <strong>Leaderboard</strong> ranks employees based on their skill strength using a
            <em> composite score </em>. This helps identify top performers and skill gaps in the team.
          </p>
          {/* Calculation Logic */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light fw-bold">Calculation Logic</div>
            <div className="card-body">
              <p>
                Each skill gets a <strong>Composite Score</strong> based on:
              </p>
              <ul>
                <li>✅ <strong>Proficiency (60%)</strong> – Skill percentage (0–100)</li>
                <li>✅ <strong>Experience (30%)</strong> – Years capped at 10 (converted to %)</li>
                <li>✅ <strong>Certification (10%)</strong> – Bonus if certified</li>
              </ul>
              <p>
                <strong>Formula:</strong><br />
                <code>
                  Score = (0.6 × Proficiency) + (0.3 × Experience%) + (0.1 × Certification%)
                </code>
              </p>
              <p>
                Employee's final score = <strong>Average of all skill scores</strong>.
              </p>
            </div>
          </div>
          {/* Example Table */}
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white fw-bold">Example Leaderboard</div>
            <div className="card-body p-0">
              <table className="table table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Rank</th>
                    <th>Employee</th>
                    <th>Composite Score</th>
                    <th>Skills</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Employee 1</td>
                    <td><span className="badge bg-success">73</span></td>
                    <td>Azure (90%, 3y, Certified)</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Employee 2</td>
                    <td><span className="badge bg-warning">62</span></td>
                    <td>HTML-CSS (100%), AI (50%), Azure (30%)</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>Employee 3</td>
                    <td><span className="badge bg-secondary">55</span></td>
                    <td>Python (70%), SQL (60%)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* Key Points */}
          <div className="alert alert-info mt-3">
            <strong>Key Points:</strong>
            <ul className="mb-0">
              <li>Employees with fewer but strong skills may rank higher than those with many weak skills.</li>
              <li>Certification adds a small bonus to encourage formal validation.</li>
              <li>Experience is capped at 10 years to keep scores fair.</li>
            </ul>
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
