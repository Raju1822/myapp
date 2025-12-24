

import React from "react";
import Flowchart from "./Flowchart";

import loginImg from "../img/welcome.png";
import memberDashImg from "../img/member-dashboard.png";
import managerDashImg from "../img/manager-dashboard.png";
import skillExamImg from "../img/exam.png";
import leaveManagerImg from "../img/leave-manager.png";
import questionManagerImg from "../img/question.png";
import reviewMemberImg from "../img/cr-member.png";
import reviewManagerImg from "../img/cr-manager.png";
import brand from '../logo.svg';

/** Reusable SVG helpers */
// const SvgBox = ({ x, y, w, h, title, fill = "#f8f9fa", stroke = "#999" }) => (
//   <g>
//     <rect x={x} y={y} width={w} height={h} rx="10" fill={fill} stroke={stroke} />
//     <text x={x + 10} y={y + 25} style={{ fontWeight: "bold" }}>
//       {title}
//     </text>
//   </g>
// );

const SvgTable = ({ x, y, title, fields }) => {
  const height = Math.max(60, (fields?.length || 0) * 18 + 40);
  return (
    <g>
      <rect x={x} y={y} width={240} height={height} rx="6" fill="#fff" stroke="#adb5bd" />
      <text x={x + 10} y={y + 20} style={{ fontWeight: "bold" }}>
        {title}
      </text>
      {fields?.map((f, i) => (
        <text key={`${title}-${i}`} x={x + 10} y={y + 45 + i * 18} style={{ fontSize: 12 }}>
          {f}
        </text>
      ))}
    </g>
  );
};

/** Architecture Diagram */
const ArchitectureDiagram = () => (
  <svg
    viewBox="0 0 1100 340"
    role="img"
    aria-label="System Architecture Diagram"
    style={{ width: "100%", height: "auto", border: "1px solid #ddd", borderRadius: 8 }}
  >
    {/* Frontend */}
    <rect x="30" y="30" width="300" height="285" rx="12" fill="#f0f7ff" stroke="#95c0ff" />
    <text x="45" y="55" style={{ fontWeight: "bold", fill: "#0d6efd" }}>
      Frontend (React SPA)
    </text>
    <text x="45" y="85">• React Router</text>
    <text x="45" y="105">• Bootstrap UI</text>
    <text x="45" y="125">• Chart.js (KPI & Trends)</text>
    <text x="45" y="145">• LocalStorage (session)</text>
    <text x="45" y="165">• Screens:</text>
    <text x="65" y="185">- Welcome/Login</text>
    <text x="65" y="205">- Member Dashboard</text>
    <text x="65" y="225">- Manager Dashboard</text>
    <text x="65" y="245">- Skill Exam</text>
    <text x="65" y="265">- Leave Manager</text>
    <text x="65" y="285">- Question Manager</text>
    <text x="65" y="305">- Common Review</text>

    {/* Backend */}
    <rect x="400" y="30" width="300" height="285" rx="12" fill="#fff9e6" stroke="#f0c24b" />
    <text x="415" y="55" style={{ fontWeight: "bold", fill: "#d08b00" }}>
      Backend (Node.js HTTP)
    </text>
    <text x="415" y="85">• Native http server</text>
    <text x="415" y="105">• Multer (uploads)</text>
    <text x="415" y="125">• PDFKit (certificates)</text>
    <text x="415" y="145">• CORS enabled</text>
    <text x="415" y="165">• REST APIs:</text>
    <text x="435" y="185">- Auth & Users</text>
    <text x="435" y="205">- Skills & Exams</text>
    <text x="435" y="225">- Tasks</text>
    <text x="435" y="245">- Leaves</text>
    <text x="435" y="265">- Reviews</text>

    {/* Database */}
    <rect x="770" y="30" width="300" height="285" rx="12" fill="#eefaf2" stroke="#79c58a" />
    <text x="785" y="55" style={{ fontWeight: "bold", fill: "#198754" }}>
      SQL Server (EmpDB)
    </text>
    <text x="785" y="85">• users, skills, user_skills</text>
    <text x="785" y="105">• tasks</text>
    <text x="785" y="125">• questions, options</text>
    <text x="785" y="145">• exam_attempts, attempt_answers</text>
    <text x="785" y="165">• leave_types, leave_requests</text>
    <text x="785" y="185">• holidays</text>
    <text x="785" y="205">• employee_reviews</text>
    <text x="785" y="225">• review_questions, review_answers</text>
    <text x="785" y="245">• support</text>

    {/* Arrows */}
    <line x1="330" y1="170" x2="400" y2="170" stroke="#6c757d" strokeWidth="2" markerEnd="url(#arrow)" />
    <line x1="700" y1="170" x2="770" y2="170" stroke="#6c757d" strokeWidth="2" markerEnd="url(#arrow)" />
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L6,3 z" fill="#6c757d" />
      </marker>
    </defs>
  </svg>
);



/** ER Diagram (uses SvgTable helper) */
const ERDiagram = () => (
  <svg
    viewBox="0 0 1180 750"
    role="img"
    aria-label="Database ER Diagram (simplified)"
    style={{ width: "100%", height: "auto", border: "1px solid #ddd", borderRadius: 8 }}
  >
    <SvgTable
      x={20}
      y={20}
      title="users"
      fields={[
        "EmployeeId (PK, unique)",
        "firstname, lastname",
        "email (unique), password",
        "role (member|manager|director)",
        "post, location, doj",
        "mapped_to (manager id)",
        "profile_picture, level",
      ]}
    />
    <SvgTable x={320} y={20} title="skills" fields={["skill_id (PK)", "skill_name"]} />
    <SvgTable
      x={320}
      y={180}
      title="user_skills"
      fields={[
        "employee_id (FK users)",
        "skill_id (FK skills)",
        "proficiency_percent",
        "certificate (URL)",
        "years_of_experience",
      ]}
    />
    <SvgTable
      x={620}
      y={20}
      title="questions"
      fields={[
        "question_id (PK)",
        "skill_id (FK skills)",
        "question_text",
        "difficulty (Easy|Medium|Hard)",
        "is_active",
      ]}
    />
    <SvgTable x={900} y={20} title="options" fields={["option_id (PK)", "question_id (FK questions)", "option_text", "is_correct"]} />
    <SvgTable
      x={620}
      y={200}
      title="exam_attempts"
      fields={[
        "attempt_id (PK)",
        "employee_id (FK users)",
        "skill_id (FK skills)",
        "started_at, completed_at",
        "score, total",
      ]}
    />
    <SvgTable
      x={900}
      y={200}
      title="attempt_answers"
      fields={[
        "attempt_answer_id (PK)",
        "attempt_id (FK attempts)",
        "question_id (FK questions)",
        "selected_option_id (FK options)",
        "is_correct",
      ]}
    />
    <SvgTable
      x={20}
      y={260}
      title="tasks"
      fields={[
        "task_id (PK)",
        "title, description",
        "assigned_by (FK users)",
        "assigned_to (FK users)",
        "start_date, due_date",
        "status, progress_percent",
        "priority, created_at, updated_at",
      ]}
    />
    <SvgTable x={20} y={450} title="leave_types" fields={["leave_type_id (PK)", "name, yearly_limit"]} />
    <SvgTable
      x={320}
      y={400}
      title="leave_requests"
      fields={[
        "leave_id (PK)",
        "employee_id (FK users)",
        "leave_type_id (FK leave_types)",
        "start_date, end_date",
        "reason, status",
        "manager_comments, applied_at",
      ]}
    />
    <SvgTable x={620} y={400} title="holidays" fields={["holiday_id (PK)", "holiday_date, description"]} />
    <SvgTable
      x={900}
      y={400}
      title="employee_reviews"
      fields={[
        "review_id (PK)",
        "employee_id (FK users)",
        "manager_id (FK users)",
        "review_type (Monthly|Yearly)",
        "review_month (nullable)",
        "review_year",
        "status, comments, created_at",
      ]}
    />
    <SvgTable x={620} y={520} title="review_questions" fields={["question_id (PK)", "question_text"]} />
    <SvgTable
      x={900}
      y={600}
      title="review_answers"
      fields={["answer_id (PK)", "review_id (FK employee_reviews)", "question_id (FK review_questions)", "rating (1..5)"]}
    />

    {/* Relationship lines (simplified) */}
    <line x1={320} y1={250} x2={160} y2={187} stroke="#6c757d" />
    <line x1={160} y1={260} x2={160} y2={187} stroke="#6c757d" />
    <line x1={420} y1={180} x2={420} y2={95} stroke="#6c757d" />
    <line x1={860} y1={80} x2={900} y2={80} stroke="#6c757d" />
    <line x1={860} y1={260} x2={900} y2={260} stroke="#6c757d" />
    <line x1={320} y1={460} x2={260} y2={460} stroke="#6c757d" />
  </svg>
);

/** Screenshot placeholders (swap with real captures) */
const ScreenshotGrid = () => (
  <div className="row g-3">
    {[
      {
        title: "Welcome / Login", url: loginImg
      },
      { title: "Member Dashboard", url: memberDashImg },
      { title: "Manager Dashboard", url: managerDashImg },
      { title: "Skill Exam", url: skillExamImg },
      { title: "Leave Manager", url: leaveManagerImg },
      { title: "Question Manager", url: questionManagerImg },
      { title: "Common Review (Member)", url: reviewMemberImg },
      { title: "Common Review (Manager)", url: reviewManagerImg },

    ].map((img, i) => (
      <div className="col-12 col-md-6" key={i}>
        <div className="card shadow-sm">
          <img src={img.url} alt={img.title} className="card-img-top" />
          <div className="card-body">
            <h6 className="card-title">{img.title}</h6>
            {/* <p className="card-text text-muted">Replace with real screenshots before demo.</p> */}
          </div>
        </div>
      </div>
    ))}
  </div>
);

/** Main Document Page */
const Document = () => {
  return (
    <>


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


        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="fw-bold text-primary">Team Productivity Platform — Executive Documentation</h1>
          <p className="text-muted">End-to-end overview of capabilities, architecture, workflows, APIs, security, and operations.</p>
        </div>

        {/* Layout */}
        <div className="row g-4">
          {/* TOC */}
          <aside className="col-12 col-lg-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="fw-bold mb-3">Contents</h6>
                <ol className="list-unstyled small">
                  {[
                    { href: "#overview", text: "1. Project Overview & Objectives" },
                    { href: "#architecture", text: "2. Architecture & Diagrams" },
                    { href: "#modules", text: "3. Functional Modules (Screens)" },
                    { href: "#flows", text: "4. Key User Flows & Sequence" },
                    { href: "#leaderboard", text: "5. Skill Leaderboard (Methodology)" },
                    { href: "#api", text: "6. API Catalog & Examples" },
                    { href: "#schema", text: "7. Database Schema (ER Diagram)" },
                    { href: "#security", text: "8. Security & Compliance" },
                    { href: "#operations", text: "9. Setup, Ops & Runbook" },
                    { href: "#kpi", text: "10. KPIs & SQL Examples" },
                    { href: "#screenshots", text: "11. Screenshot Gallery" },
                    { href: "#roadmap", text: "12. Roadmap & Enhancements" },
                    { href: "#demo", text: "13. Demo Script (Leadership)" },
                    { href: "#faq", text: "14. FAQs & Notes" },
                  ].map((item, idx) => (
                    <li key={idx} className="mb-2">
                      <a className="text-decoration-none" href={item.href}>
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="col-12 col-lg-9">
            {/* 1) Overview */}
            <section id="overview" className="mb-5">
              <h3 className="fw-bold mb-3">1) Project Overview & Objectives</h3>
              <p>
                The Team Productivity Platform unifies task management, skills assessment, leave tracking, and performance reviews into
                one intuitive system. It streamlines manager workflows, empowers members with clarity, and provides leadership with
                real-time, actionable transparency.
              </p>
              <ul>
                <li>
                  <strong>Business Objectives:</strong> Improve delivery predictability, reduce lead time to competence, ensure fair
                  performance reviews.
                </li>
                <li>
                  <strong>User Personas:</strong> Director (level 1), Manager (level 2), Member (level 3).
                </li>
                <li>
                  <strong>Success Criteria:</strong> Higher task completion rates, certified skills, faster review cycles, fewer leave
                  bottlenecks.
                </li>
              </ul>
            </section>

            {/* 2) Architecture */}
            <section id="architecture" className="mb-5">
              <h3 className="fw-bold mb-3">2) Architecture & Diagrams</h3>
              <p>
                The platform comprises a React SPA communicating with a Node.js HTTP server and a SQL Server database. Files (profile
                pictures, certificates) live in <code>public/uploads</code>, served securely via <code>GET /uploads/&lt;filename&gt;</code>.
              </p>
              <ArchitectureDiagram />
              <div className="mt-3">
                <div className="alert alert-secondary">
                  <strong>Notes:</strong> Backend uses native <code>http</code> + Multer + PDFKit; static files are guarded against path
                  traversal; CORS is enabled; image URLs are enriched from <code>req.headers.host</code>.
                </div>
              </div>
            </section>


            {/* 3) Flows */}
            <section id="flows" className="mb-5">
              <h3 className="fw-bold mb-3">3) Key User & Overall System Flow</h3>
              <div className="container mt-4">
                <Flowchart />
              </div>


            </section>

            {/* 4) Modules */}
            <section id="modules" className="mb-5">
              <h3 className="fw-bold mb-3">4) Functional Modules (Screens)</h3>
              <div className="accordion" id="modulesAccordion">
                {/* Welcome/Login */}
                <div className="accordion-item">
                  <h2 className="accordion-header" id="heading1">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1">
                      Welcome & Login
                    </button>
                  </h2>
                  <div id="collapse1" className="accordion-collapse collapse show">
                    <div className="accordion-body">
                      <ul>
                        <li>
                          <strong>Route:</strong> <code>/</code>
                        </li>
                        <li>
                          <strong>API:</strong> <code>POST /api/login</code> → returns user + <code>profile_picture_url</code> (password removed).
                        </li>
                        <li>
                          <strong>Navigation:</strong> By <code>level</code> → Director <code>/dashboard</code>, Manager{" "}
                          <code>/manager-dashboard</code>, Member <code>/member-dashboard</code>.
                        </li>
                      </ul>
                      <pre className="bg-light p-3">
                        <code>{`await fetch(\`\${API_BASE_URL}/api/login\`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})`}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Member Dashboard */}
                <div className="accordion-item">
                  <h2 className="accordion-header" id="heading2">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2">
                      Member Dashboard
                    </button>
                  </h2>
                  <div id="collapse2" className="accordion-collapse collapse">
                    <div className="accordion-body">
                      <ul>
                        <li>
                          <strong>Skills:</strong> <code>GET /api/user-skills/:id</code>, <code>GET /api/skills</code>; add/update/delete via respective APIs.
                        </li>
                        <li>
                          <strong>Tasks:</strong> <code>GET /api/mytasks/:id</code>; update status via <code>PATCH /api/update-task-status/:taskId</code>.
                        </li>
                        <li>
                          <strong>Profile:</strong> <code>POST /api/update-profile</code> (multipart) → refresh via <code>GET /api/user/:id</code>.
                        </li>
                        <li>
                          <strong>Leave:</strong> History via <code>GET /api/leave/history/:id</code>.
                        </li>
                        <li>
                          <strong>Exam:</strong> Navigate to <code>/skill-exam</code> with <code>skillId</code>.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Manager Dashboard */}
                <div className="accordion-item">
                  <h2 className="accordion-header" id="heading3">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse3">
                      Manager Dashboard
                    </button>
                  </h2>
                  <div id="collapse3" className="accordion-collapse collapse">
                    <div className="accordion-body">
                      <ul>
                        <li>
                          <strong>Team:</strong> <code>GET /api/mapped-emp/:managerId</code>, <code>GET /api/directmembers/:managerId</code>.
                        </li>
                        <li>
                          <strong>Tasks:</strong> create (<code>POST /api/add-task</code>), update (<code>PATCH /api/update-task/:taskId</code>), delete (<code>DELETE /api/delete-task/:taskId</code>), list (<code>GET /api/tasks/:managerId</code>).
                        </li>
                        <li>
                          <strong>Leave:</strong> summary <code>GET /api/leave/manager-summary/:managerId</code>; pending approvals <code>GET /api/leave/pending/:managerId</code>.
                        </li>
                        <li>
                          <strong>Leaderboard:</strong> Composite scoring based on proficiency/experience/certification.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Skill Exam */}
                <div className="accordion-item">
                  <h2 className="accordion-header" id="heading4">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse4">
                      Skill Exam
                    </button>
                  </h2>
                  <div id="collapse4" className="accordion-collapse collapse">
                    <div className="accordion-body">
                      <ul>
                        <li>
                          <strong>Questions:</strong> <code>GET /api/questions/:skillId</code> → grouped options.
                        </li>
                        <li>
                          <strong>Submit:</strong> <code>POST /api/exam/submit</code> → creates <code>exam_attempts</code>, <code>attempt_answers</code>, updates <code>user_skills.proficiency_percent</code>.
                        </li>
                        <li>
                          <strong>Certificate:</strong> <code>POST /api/certificate/generate</code> (score ≥ 80) → landscape A4 PDF.
                        </li>
                      </ul>
                      <pre className="bg-light p-3">
                        <code>{`// Submit and optionally generate certificate
await fetch('/api/exam/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ employee_id, skill_id, answers, score, total }) });
if (score >= 80) {
  await fetch('/api/certificate/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employee_id, skill_id, score })
  });
}`}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Leave Manager */}
                <div className="accordion-item">
                  <h2 className="accordion-header" id="heading5">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse5">
                      Leave Manager
                    </button>
                  </h2>
                  <div id="collapse5" className="accordion-collapse collapse">
                    <div className="accordion-body">
                      <ul>
                        <li>
                          <strong>Types:</strong> <code>GET /api/leave/types</code>.
                        </li>
                        <li>
                          <strong>Apply:</strong> <code>POST /api/leave/apply</code> → <code>leave_requests</code> row.
                        </li>
                        <li>
                          <strong>Member:</strong> summary <code>GET /api/leave/summary/:id</code>, history <code>GET /api/leave/history/:id</code>.
                        </li>
                        <li>
                          <strong>Manager:</strong> summary <code>GET /api/leave/manager-summary/:managerId</code>, pending <code>GET /api/leave/pending/:managerId</code>, approve/reject <code>PATCH /api/leave/approve/:leaveId</code>.
                        </li>
                        <li>
                          <strong>Holidays:</strong> <code>GET /api/holidays</code>.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Question Manager */}
                <div className="accordion-item">
                  <h2 className="accordion-header" id="heading6">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse6">
                      Question Manager
                    </button>
                  </h2>
                  <div id="collapse6" className="accordion-collapse collapse">
                    <div className="accordion-body">
                      <ul>
                        <li>
                          <strong>Load:</strong> <code>GET /api/skills</code>, <code>GET /api/questions/:skillId</code>.
                        </li>
                        <li>
                          <strong>Create:</strong> <code>POST /api/questions</code> (transaction, then insert options).
                        </li>
                        <li>
                          <strong>Edit/Delete:</strong> <code>PATCH /api/questions/:questionId</code>, <code>PATCH /api/options/:optionId</code>, <code>DELETE /api/questions/:questionId</code>.
                        </li>
                        <li>
                          <strong>UX:</strong> Pagination (5/page), search by text, difficulty KPIs.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Add Member */}
                <div className="accordion-item">
                  <h2 className="accordion-header" id="heading7">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse7">
                      Add Member
                    </button>
                  </h2>
                  <div id="collapse7" className="accordion-collapse collapse">
                    <div className="accordion-body">
                      <ul>
                        <li>
                          <strong>Route:</strong> <code>/add-member</code> (manager/director).
                        </li>
                        <li>
                          <strong>API:</strong> <code>POST /api/add-member</code> (multipart).
                        </li>
                        <li>
                          <strong>Mapping:</strong> Automatically sets <code>mapped_to</code> = current user’s <code>EmployeeId</code>.
                        </li>
                      </ul>
                      <pre className="bg-light p-3">
                        <code>{`const fd = new FormData();
Object.entries(formData).forEach(([k,v]) => fd.append(k, v));
if (profilePicture) fd.append('profile_picture', profilePicture);
await fetch('/api/add-member', { method: 'POST', body: fd });`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </section>



            {/* 5) Leaderboard */}
            <section id="leaderboard" className="mb-5">
              <h3 className="fw-bold mb-3">5) Skill Leaderboard (Methodology)</h3>
              <p>
                The leaderboard ranks employees using a composite score:
                <code> Score = 0.6 × Proficiency + 0.3 × Experience% + 0.1 × Certification </code>. Experience% is years capped at 10
                (e.g., 5 years → 50%).
              </p>
              <div className="alert alert-info">
                <strong>Key Points:</strong> Fewer strong skills may outrank many weak skills; certification adds bonus; experience capped for fairness.
              </div>
              <pre className="bg-light p-3">
                <code>{`const profPoints = p => (p<25?2 : p<50?4 : p<75?7 : 10);
const expPoints  = y => (y<=1?2 : y<=4?4 : y<=7?7 : 10);
const certPoints = cert => (cert && String(cert).trim() !== '' ? 2 : 0);
const skillScore = (p,y,cert) => profPoints(p) + expPoints(y) + certPoints(cert); // 0..22

// leaderboard avg per employee
const leaderboard = employees.map(e => {
  const skills = skillMatrix[e.EmployeeId] || {};
  const entries = Object.values(skills);
  if (!entries.length) return { employee: e, score: 0 };
  const total = entries.reduce((sum, s) => sum + skillScore(s.prof, s.years, s.cert), 0);
  return { employee: e, score: Math.round(total / entries.length) };
}).sort((a,b) => b.score - a.score);`}</code>
              </pre>
            </section>

            {/* 6) API Catalog */}
            <section id="api" className="mb-5">
              <h3 className="fw-bold mb-3">6) API Catalog & Examples</h3>
              <div className="row g-3">
                {/* Auth & Users */}
                <div className="col-12 col-md-6">
                  <div className="card h-100">
                    <div className="card-header">Auth & Users</div>
                    <div className="card-body">
                      <pre className="bg-light p-3">
                        <code>{`POST /api/login
Body: { email, password }
→ 200: { success, user: { EmployeeId, firstname, lastname, email, role, post, location, doj, mapped_to, level, profile_picture_url } }

POST /api/add-member (multipart)
Fields: EmployeeId, firstname, lastname, email, password, role, post, location, doj, mapped_to?, profile_picture

POST /api/update-profile (multipart)
Fields: EmployeeId, firstname, lastname, email, post, location, doj, mapped_to?, role, profile_picture?`}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Org & Mapping */}
                <div className="col-12 col-md-6">
                  <div className="card h-100">
                    <div className="card-header">Org & Mapping</div>
                    <div className="card-body">
                      <pre className="bg-light p-3">
                        <code>{`GET /api/members
GET /api/manager/:employeeId
GET /api/directmembers/:managerId
GET /api/mapped-emp/:managerId
DELETE /api/removemember/:empid
POST /api/transfer-employee
Body: { employee_id, from_manager_id?, to_manager_id }`}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Skills & Exams */}
                <div className="col-12 col-md-6">
                  <div className="card h-100">
                    <div className="card-header">Skills & Exams</div>
                    <div className="card-body">
                      <pre className="bg-light p-3">
                        <code>{`GET /api/skills
GET /api/user-skills/:employeeId
POST /api/add-skill
POST /api/update-skill
DELETE /api/delete-skill/:employeeId/:skillName

GET /api/questions/:skillId
POST /api/questions
PATCH /api/questions/:questionId
PATCH /api/options/:optionId
DELETE /api/questions/:questionId

POST /api/exam/submit
POST /api/certificate/generate`}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="col-12 col-md-6">
                  <div className="card h-100">
                    <div className="card-header">Tasks</div>
                    <div className="card-body">
                      <pre className="bg-light p-3">
                        <code>{`GET /api/mytasks/:employeeId
GET /api/manager-tasks/:managerId
GET /api/tasks/:employeeId
POST /api/add-task
PATCH /api/update-task/:taskId
PATCH /api/update-task-status/:taskId
DELETE /api/delete-task/:taskId`}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Leave */}
                <div className="col-12 col-md-6">
                  <div className="card h-100">
                    <div className="card-header">Leave</div>
                    <div className="card-body">
                      <pre className="bg-light p-3">
                        <code>{`GET /api/leave/types
POST /api/leave/apply
GET /api/leave/summary/:employeeId
GET /api/leave/history/:employeeId
GET /api/leave/balance/:employeeId
GET /api/leave/pending/:managerId
PATCH /api/leave/approve/:leaveId
GET /api/holidays
GET /api/leave/manager-summary/:managerId`}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Reviews */}
                <div className="col-12 col-md-6">
                  <div className="card h-100">
                    <div className="card-header">Common Reviews</div>
                    <div className="card-body">
                      <pre className="bg-light p-3">
                        <code>{`GET /api/review-questions
GET /api/review-status/:managerId
POST /api/add-review
GET /api/reviews/:employeeId
PATCH /api/complete-review/:reviewId

GET /uploads/:filename  ← static files (images, certificates)`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <h6>Example: Add Task (fetch)</h6>
                <pre className="bg-light p-3">
                  <code>{`await fetch(\`\${API_BASE_URL}/api/add-task\`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title, description, assigned_by, assigned_to, start_date, due_date, priority })
});`}</code>
                </pre>
              </div>
            </section>

            {/* 7) Schema */}
            <section id="schema" className="mb-5">
              <h3 className="fw-bold mb-3">7) Database Schema (ER Diagram)</h3>
              <ERDiagram />
              <div className="mt-3">
                <div className="alert alert-secondary">
                  <strong>Highlights:</strong> FK constraints maintain referential integrity; difficulty in <code>questions</code> validated via check constraint; audit columns recommended across tables.
                </div>
              </div>
            </section>

            {/* 8) Security */}
            <section id="security" className="mb-5">
              <h3 className="fw-bold mb-3">8) Security & Compliance</h3>
              <ul>
                <li>
                  <strong>Password Hashing:</strong> Use <code>bcrypt</code> to store hashes; compare on login. Avoid plaintext.
                </li>
                <li>
                  <strong>JWT Auth:</strong> Issue tokens on login; protect sensitive routes; enforce role-based authorization.
                </li>
                <li>
                  <strong>SQL Safety:</strong> Parameterize all queries; eliminate string interpolation in updates and <code>IN (...)</code>.
                </li>
                <li>
                  <strong>Uploads:</strong> Set size limits (e.g., 2MB), MIME filters (<code>image/jpeg</code>, <code>image/png</code>, <code>image/webp</code>).
                </li>
                <li>
                  <strong>CORS:</strong> Whitelist front-end origin; include <code>Authorization</code> header once JWT is added.
                </li>
                <li>
                  <strong>Pooling:</strong> Single global <code>ConnectionPool</code> across routes.
                </li>
                <li>
                  <strong>Error Handling:</strong> Consistent JSON errors; no stack traces in production.
                </li>
              </ul>
            </section>

            {/* 9) Operations */}
            <section id="operations" className="mb-5">
              <h3 className="fw-bold mb-3">9) Setup, Ops & Runbook</h3>
              <h6>Environment (suggested)</h6>
              <pre className="bg-light p-3">
                <code>{`DB_SERVER=LHTU05CG50822HC\\SQLEXPRESS
DB_NAME=EmpDB
PORT=5000
FRONTEND_URL=http://localhost:3000`}</code>
              </pre>
              <h6>Backend Start</h6>
              <pre className="bg-light p-3">
                <code>{`node server.js
# Logs: "✅ API running at http://localhost:5000"`}</code>
              </pre>
              <h6>File Storage</h6>
              <ul>
                <li>
                  <code>public/uploads/</code> holds profile pictures and generated certificates.
                </li>
                <li>Static serving via <code>GET /uploads/&lt;filename&gt;</code> with path traversal protection.</li>
              </ul>
            </section>

            {/* 10) KPIs & SQL */}
            <section id="kpi" className="mb-5">
              <h3 className="fw-bold mb-3">10) KPIs & SQL Examples</h3>
              <h6>Task Completion per Month</h6>
              <pre className="bg-light p-3">
                <code>{`SELECT
  DATENAME(MONTH, updated_at) AS month_name,
  COUNT(*) AS completed_count
FROM tasks
WHERE LOWER(status) = 'completed'
GROUP BY DATENAME(MONTH, updated_at), MONTH(updated_at)
ORDER BY MONTH(updated_at);`}</code>
              </pre>

              <h6 className="mt-3">Average Rating by Review Question</h6>
              <pre className="bg-light p-3">
                <code>{`SELECT rq.question_text, AVG(CAST(ra.rating AS FLOAT)) AS avg_rating
FROM review_answers ra
JOIN review_questions rq ON rq.question_id = ra.question_id
JOIN employee_reviews er ON er.review_id = ra.review_id
WHERE er.status = 'Completed' AND er.review_year = YEAR(GETDATE())
GROUP BY rq.question_text
ORDER BY rq.question_text;`}</code>
              </pre>

              <h6 className="mt-3">Skill Leaderboard (illustrative)</h6>
              <pre className="bg-light p-3">
                <code>{`SELECT u.EmployeeId, u.firstname, u.lastname,
  AVG(
    (0.6 * us.proficiency_percent) +
    (0.3 * (CASE WHEN us.years_of_experience > 10 THEN 100 ELSE us.years_of_experience*10 END)) +
    (0.1 * CASE WHEN COALESCE(NULLIF(us.certificate,''), NULL) IS NULL THEN 0 ELSE 10 END)
  ) AS composite_score
FROM user_skills us
JOIN users u ON u.EmployeeId = us.employee_id
GROUP BY u.EmployeeId, u.firstname, u.lastname
ORDER BY composite_score DESC;`}</code>
              </pre>

              <h6 className="mt-3">Leave Summary (Member)</h6>
              <pre className="bg-light p-3">
                <code>{`SELECT
  COUNT(*) AS total_leaves,
  SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved_leaves,
  SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected_leaves,
  SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_leaves
FROM leave_requests
WHERE employee_id = @employeeId;`}</code>
              </pre>
            </section>

            {/* 11) Screenshots */}
            <section id="screenshots" className="mb-5">
              <h3 className="fw-bold mb-3">11) Screenshot Gallery</h3>
              <p className="text-muted">Replace placeholders with real screenshots before demo.</p>
              <ScreenshotGrid />
            </section>

            {/* 12) Roadmap */}
            <section id="roadmap" className="mb-5">
              <h3 className="fw-bold mb-3">12) Roadmap & Enhancements</h3>
              <ul>
                <li>🔐 Add JWT to all protected routes; role-based authorization guards in frontend.</li>
                <li>🧩 Switch skill deletion to <code>skill_id</code> (resolve name only if necessary).</li>
                <li>🚀 Migrate backend to Express for middleware (Helmet, compression) and cleaner routing.</li>
                <li>📈 Add more manager analytics (burn-down charts, SLA adherence, skill gap heatmaps).</li>
                <li>🖼️ Replace all placeholder screenshots with live UI captures.</li>
              </ul>
            </section>

            {/* 13) Demo Script */}
            <section id="demo" className="mb-5">
              <h3 className="fw-bold mb-3">13) Demo Script (Leadership)</h3>
              <ol>
                <li><strong>Login</strong> as Manager → point out level-based routing.</li>
                <li>Open <strong>Manager Dashboard</strong> → highlight KPIs, team list, charts.</li>
                <li>Assign a <strong>Task</strong> → show it in member’s dashboard.</li>
                <li>Show <strong>Skills</strong> → take an exam → generate certificate (≥80%).</li>
                <li>Open <strong>Leave Manager</strong> → apply leave as member; approve as manager.</li>
                <li>Walk through <strong>Common Review</strong> → monthly review, charts on member view.</li>
                <li>Discuss <strong>Security & Roadmap</strong> → JWT, SQL parameterization, Express migration.</li>
              </ol>
            </section>

            {/* 14) FAQs */}
            <section id="faq" className="mb-5">
              <h3 className="fw-bold mb-3">14) FAQs & Notes</h3>
              <ul>
                <li><strong>Image URLs:</strong> Built from request host; served via <code>/uploads/</code> (cache controlled).</li>
                <li><strong>Certificates:</strong> Landscape A4 PDF with logo, title, recipient, score, signature line, inspirational quote.</li>
                <li><strong>Performance:</strong> Use a single global connection pool and parameterized queries for efficiency & safety.</li>
                <li><strong>Accessibility:</strong> Include <code>aria-labels</code> and <code>role</code> attributes; ensure color contrast on charts.</li>
              </ul>
            </section>

            {/* Support */}
            <div className="text-center mt-5">
              <p className="text-muted">
                Need help? Visit the{" "}
                <a href="/support" className="text-decoration-none">Support Page</a>.
              </p>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Document;
