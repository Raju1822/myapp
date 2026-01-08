
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import brand from "../logo.svg";

const API_BASE_URL = "http://localhost:5000";

const MemberDashboard = () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const navigate = useNavigate();

  // ----------------------------
  // Logout
  // ----------------------------
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  // ----------------------------
  // Skills
  // ----------------------------
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [skills, setSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [formData, setFormData] = useState({
    skill_id: "",
    proficiency_percent: "",
    certificate: "",
    years_of_experience: "",
  });

  useEffect(() => {
    if (!user?.EmployeeId) return;

    // User skills
    fetch(`${API_BASE_URL}/api/user-skills/${user.EmployeeId}`)
      .then((res) => res.json())
      .then((data) => setSkills(Array.isArray(data) ? data : []))
      .catch(() => setSkills([]));

    // All skills for dropdown
    fetch(`${API_BASE_URL}/api/skills`)
      .then((res) => res.json())
      .then((data) => setAllSkills(Array.isArray(data) ? data : []))
      .catch(() => setAllSkills([]));
  }, [user?.EmployeeId]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Manager
  const [manager, setManager] = useState([]);
  useEffect(() => {
    if (!user?.EmployeeId) return;
    fetch(`${API_BASE_URL}/api/manager/${user.EmployeeId}`)
      .then((res) => res.json())
      .then((data) => setManager(Array.isArray(data) ? data : []))
      .catch(() => setManager([]));
  }, [user?.EmployeeId]);

  // Edit/Add skill
  const [isEditing, setIsEditing] = useState(false);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    const payload = { ...formData, employee_id: user.EmployeeId };
    const url = isEditing
      ? `${API_BASE_URL}/api/update-skill`
      : `${API_BASE_URL}/api/add-skill`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      alert(result.message || (isEditing ? "Skill updated" : "Skill added"));
      setIsEditing(false);

      // Refresh skills
      const res = await fetch(`${API_BASE_URL}/api/user-skills/${user.EmployeeId}`);
      const updated = await res.json();
      setSkills(Array.isArray(updated) ? updated : []);
    } catch (err) {
      alert("Failed to save skill. Please try again.");
    }
  };

  const handleEditSkill = (skill) => {
    setFormData({
      skill_id: skill.skill_id,
      proficiency_percent: skill.proficiency_percent,
      certificate: skill.certificate,
      years_of_experience: skill.years_of_experience,
    });
    setIsEditing(true);
  };

  const handleDeleteSkill = async (skill) => {
    if (window.confirm(`Are you sure you want to delete ${skill.skill_name}?`)) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/delete-skill/${user.EmployeeId}/${skill.skill_name}`,
          { method: "DELETE" }
        );
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const resultText = await response.text();
        const data = resultText ? JSON.parse(resultText) : { message: "Deleted" };
        alert(data.message || "Deleted");

        // Update state without reload
        setSkills((prev) => prev.filter((s) => s.skill_name !== skill.skill_name));
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete skill. Please try again.");
      }
    }
  };

  // ----------------------------
  // Tasks
  // ----------------------------
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user?.EmployeeId) return;
    fetch(`${API_BASE_URL}/api/mytasks/${user.EmployeeId}`)
      .then((res) => res.json())
      .then((data) => setTasks(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching tasks:", err));
  }, [user?.EmployeeId]);

  const updateTaskStatus = async (taskId, status) => {
    const progress = status === "Completed" ? 100 : status === "In Progress" ? 50 : 0;
    try {
      await fetch(`${API_BASE_URL}/api/update-task-status/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, progress_percent: progress }),
      });
      setTasks((prev) =>
        prev.map((t) =>
          t.task_id === taskId ? { ...t, status, progress_percent: progress } : t
        )
      );
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task status.");
    }
  };

  // ----------------------------
  // Members hierarchy
  // ----------------------------
  const [members, setMembers] = useState([]);
  const ShowMembers = async () => {
    if (!user?.mapped_to) {
      alert("No mapped manager found.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/directmembers/${user.mapped_to}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.data || [];
      setMembers(list);
      const modal = new window.bootstrap.Modal(document.getElementById("membersModal"));
      modal.show();
    } catch (err) {
      console.error("Error fetching members:", err);
      setMembers([]);
    }
  };

  // ----------------------------
  // Exams
  // ----------------------------
  const handleTakeExam = (skill) => {
    if (!skill?.skill_id) {
      alert("Skill id is missing. Please ensure /api/user-skills includes skill_id.");
      return;
    }
    navigate("/skill-exam", { state: { skillId: skill.skill_id, skillName: skill.skill_name } });
  };

  // ----------------------------
  // Leave
  // ----------------------------
  const handleLeave = () => navigate("/LeaveManager");

  const [history, setHistory] = useState([]);
  useEffect(() => {
    if (!user?.EmployeeId) return;
    fetch(`${API_BASE_URL}/api/leave/history/${user.EmployeeId}`)
      .then((res) => res.json())
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching leave history:", err));
  }, [user?.EmployeeId]);

  // ----------------------------
  // Profile update
  // ----------------------------
  const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const [userData, setUserData] = useState(storedUser || {});
  const [selectedFile, setSelectedFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e) => setSelectedFile(e.target.files[0] || null);

  const UpdateMember = async () => {
    try {
      const fd = new FormData();
      fd.append("EmployeeId", userData.EmployeeId);
      fd.append("firstname", userData.firstname);
      fd.append("lastname", userData.lastname);
      fd.append("email", userData.email);
      fd.append("post", userData.post);
      fd.append("location", userData.location);
      fd.append("doj", userData.doj);
      fd.append("mapped_to", userData.mapped_to || "");
      fd.append("role", userData.role);
      if (selectedFile) fd.append("profile_picture", selectedFile);

      const response = await fetch(`${API_BASE_URL}/api/update-profile`, {
        method: "POST",
        body: fd,
      });
      const result = await response.json();

      if (result?.success) {
        alert(result.message || "Profile Updated");
        const updatedUserResponse = await fetch(
          `${API_BASE_URL}/api/user/${userData.EmployeeId}`
        );
        const updatedUser = await updatedUserResponse.json();
        setUserData(updatedUser);
        localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
      } else {
        alert(result?.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating details:", error);
      alert("Failed to update. Please try again");
    }
  };

  // ----------------------------
  // Quotes
  // ----------------------------
  const quotes = [
    { text: "If your actions inspire others to dream more, learn more, do more and become more, you are a leader.", author: "John Quincy Adams" },
    { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Do not wait to strike till the iron is hot; but make it hot by striking.", author: "William Butler Yeats" },
    { text: "Great things never come from comfort zones.", author: "Anonymous" },
    { text: "Believe you can and you’re halfway there.", author: "Theodore Roosevelt" },
    { text: "Your limitation—it’s only your imagination.", author: "Anonymous" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Anonymous" },
    { text: "Dream bigger. Do bigger.", author: "Anonymous" },
    { text: "Don’t watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Opportunities don’t happen. You create them.", author: "Chris Grosser" },
    { text: "Hard work beats talent when talent doesn’t work hard.", author: "Tim Notke" },
    { text: "Don’t be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Act as if what you do makes a difference. It does.", author: "William James" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
    { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
    { text: "Don’t limit your challenges. Challenge your limits.", author: "Anonymous" },
    { text: "It always seems impossible until it’s done.", author: "Nelson Mandela" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  ];
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * quotes.length));
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % quotes.length);
    }, 60000);
    return () => clearInterval(timer);
    // eslint-disable-next-line
  }, []);
  const rotatingQuote = quotes[quoteIdx];

  // ----------------------------
  // Update Password
  // ----------------------------
  const [pwdForm, setPwdForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [pwdSubmitting, setPwdSubmitting] = useState(false);
  const [pwdMessage, setPwdMessage] = useState("");

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPwdMessage("");

    if (!pwdForm.current_password || !pwdForm.new_password || !pwdForm.confirm_password) {
      setPwdMessage("Please fill all fields.");
      return;
    }
    if (pwdForm.new_password.length < 8) {
      setPwdMessage("New password must be at least 8 characters.");
      return;
    }
    if (pwdForm.new_password !== pwdForm.confirm_password) {
      setPwdMessage("New password and confirmation do not match.");
      return;
    }

    setPwdSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/change-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: user.EmployeeId,
          current_password: pwdForm.current_password,
          new_password: pwdForm.new_password,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Password update failed");
      }

      setPwdMessage("✅ Password updated. Redirecting you to login…");

      setTimeout(() => {
        const modalEl = document.getElementById("updatePasswordModal");
        const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
        modalInstance?.hide();
        // ❌ REMOVE manual backdrop removal to avoid focus-trap loops
        // document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());

        localStorage.removeItem("loggedInUser");
        navigate("/", {
          state: {
            loginInfoMessage:
              "✅ Your password has been updated. Please login with your new password.",
          },
        });
      }, 1200);
    } catch (err) {
      console.error("Update password error:", err);
      setPwdMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setPwdSubmitting(false);
    }
  };

  // ----------------------------
  // Helpers
  // ----------------------------
  const profileImg =
    user?.profile_picture_url ||
    (user?.profile_picture
      ? `${API_BASE_URL}/uploads/${encodeURIComponent(user.profile_picture)}`
      : "https://picsum.photos/120");

  // Unread notifications = unfinished tasks
  const unreadCount = tasks.filter((t) => t.status !== "Completed").length;





// Show up to 6 items mixed from tasks + leave history
const taskNotifs = tasks
  .filter(t => t.status !== "Completed")
  .sort((a, b) => {
    // newest updated first; fall back to due_date
    const ta = new Date(a.updated_at || a.due_date || 0);
    const tb = new Date(b.updated_at || b.due_date || 0);
    return tb - ta;
  })
  .slice(0, 3)
  .map(t => ({
    id: `task-${t.task_id}`,
    icon: "bi bi-check2-circle text-success",
    title: "Task update",
    message: `#${String(t.task_id).padStart(3, "0")} — ${t.title} (${t.status || "Not Started"})`,
    when:
      t.due_date
        ? new Date(t.due_date).toLocaleDateString()
        : new Date(t.updated_at || Date.now()).toLocaleString(),
    href: "#tasks", // or a detail route if you have one
  }));

const leaveNotifs = (history || [])
  .sort((a, b) => new Date(b.updated_at || b.start_date || 0) - new Date(a.updated_at || a.start_date || 0))
  .slice(0, 3)
  .map(l => ({
    id: `leave-${l.leave_id}`,
    icon:
      l.status === "Approved"
        ? "bi bi-check-circle text-success"
        : l.status === "Rejected"
        ? "bi bi-x-circle text-danger"
        : "bi bi-exclamation-circle text-warning",
    title:
      l.status === "Approved"
        ? "Leave approved"
        : l.status === "Rejected"
        ? "Leave rejected"
        : "Leave pending",
    message: `${l.leave_type}: ${l.start_date ? new Date(l.start_date).toLocaleDateString() : "—"} → ${l.end_date ? new Date(l.end_date).toLocaleDateString() : "—"}`,
    when: new Date(l.updated_at || l.start_date || Date.now()).toLocaleDateString(),
    href: "/LeaveManager",
  }));

// Final list (small, dynamic)
const notifList = [...taskNotifs, ...leaveNotifs].slice(0, 6);





  // ✅ Helper: safely close offcanvas before opening any modal
  // Put this near the top of your component:
  const closeOffcanvasIfOpen = () => {
    const el = document.getElementById('sidebarOffcanvas');
    if (!el || !window.bootstrap) return;
    const inst = window.bootstrap.Offcanvas.getInstance(el);
    if (inst) inst.hide();
  };

  // Calendar state
  const [calDate, setCalDate] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() }; // 0-11
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const getMonthMatrix = (year, month) => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startDay = first.getDay(); // Sun=0
    const daysInMonth = last.getDate();

    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  };

  const goPrevMonth = () => {
    setCalDate((prev) => {
      const m = prev.month - 1;
      return m < 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: m };
    });
  };
  const goNextMonth = () => {
    setCalDate((prev) => {
      const m = prev.month + 1;
      return m > 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: m };
    });
  };






  // ----------------------------
  // Render
  // ----------------------------
  return (
    <div className="container-fluid p-0 bg-light">
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top z-3">
        <div className="container-fluid">
          {/* Brand */}
          <a className="navbar-brand d-flex align-items-center gap-2" href="/">
            <img src={brand} alt="Brand" width="36" height="36" className="rounded-circle" />
            <span className="fw-bold">Member Dashboard</span>
          </a>

          {/* Offcanvas toggler (mobile) */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#sidebarOffcanvas"
            aria-controls="sidebarOffcanvas"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Right: Calendar + Notifications (desktop) */}
          <div className="d-none d-lg-flex align-items-center gap-2 mx-4">
            {/* Calendar Button */}
            <button
              type="button"
              className="btn btn-outline-light btn-sm"
              data-bs-toggle="modal"
              data-bs-target="#calendarModal"
              onClick={closeOffcanvasIfOpen} // ✅ close offcanvas if open
            >
              <i className="bi bi-calendar3 me-1"></i> Calendar
            </button>


{/* Notifications */}
<div className="dropdown">
  <a
    className="nav-link position-relative"
    href="#!"
    id="notifDropdown"
    role="button"
    data-bs-toggle="dropdown"
    aria-expanded="false"
  >
    <i className="bi bi-bell fs-5 text-white"></i>
    {unreadCount > 0 && (
      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
        {Math.min(unreadCount, 99)}
        <span className="visually-hidden">unread notifications</span>
      </span>
    )}
  </a>

  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="notifDropdown">
    <li className="dropdown-header">Notifications</li>

    {/* REPLACE STATIC ITEMS BELOW WITH THIS MAPPING */}
    {notifList.length === 0 ? (
      <li><div className="dropdown-item text-muted small">No notifications</div></li>
    ) : (
      notifList.map(n => (
        <li key={n.id}>
          <a className="dropdown-item d-flex align-items-start gap-2" href={n.href}>
            <i className={`${n.icon} me-2`}></i>
            <div className="flex-grow-1">
              <div className="fw-semibold">{n.title}</div>
              <div className="small text-muted">{n.message}</div>
              <div className="small text-muted">{n.when}</div>
            </div>
          </a>
        </li>
      ))
    )}

    <li><hr className="dropdown-divider" /></li>
    <li><a className="dropdown-item" href="/notifications">View all</a></li>
  </ul>
</div>




          </div>

        </div>


      </nav>

      {/* Calendar Modal (with focus disabled to avoid trap loops) */}
      <div
        className="modal fade"
        id="calendarModal"
        tabIndex="-1"
        aria-labelledby="calendarModalLabel"

        data-bs-focus="false"  // ✅ prevents aggressive focus trap
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="calendarModalLabel">
                <i className="bi bi-calendar3 me-2"></i>
                {monthNames[calDate.month]} {calDate.year}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <button className="btn btn-outline-secondary btn-sm" onClick={goPrevMonth}>
                  <i className="bi bi-chevron-left me-1"></i> Prev
                </button>
                <span className="fw-semibold">
                  {monthNames[calDate.month]} {calDate.year}
                </span>
                <button className="btn btn-outline-secondary btn-sm" onClick={goNextMonth}>
                  Next <i className="bi bi-chevron-right ms-1"></i>
                </button>
              </div>

              <div className="table-responsive">
                <table className="table table-bordered text-center">
                  <thead className="table-light">
                    <tr>
                      <th>Sun</th>
                      <th>Mon</th>
                      <th>Tue</th>
                      <th>Wed</th>
                      <th>Thu</th>
                      <th>Fri</th>
                      <th>Sat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getMonthMatrix(calDate.year, calDate.month).map((week, wi) => (
                      <tr key={wi}>
                        {week.map((d, di) => (
                          <td key={di} className={d ? "" : "text-muted"}>{d || ""}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-primary text-white py-4 mb-0">
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <img
                src={profileImg}
                alt="Profile"
                className="rounded-circle border"
                width="100"
                height="100"
                style={{ objectFit: "cover" }}
              />
              <div>
                <h2 className="fw-bold mb-1">{user?.firstname} {user?.lastname}</h2>
                <p className="mb-0">{user?.email}</p>
                {user?.role && <span className="badge bg-warning text-dark mt-2">{user?.role}</span>}
              </div>
            </div>
            <div className="mt-3 mt-md-0 text-md-end">
              <small className="opacity-75">Employee ID: {user?.EmployeeId || "—"}</small><br />
              <small className="opacity-75">Manager: {manager[0]?.firstname} {manager[0]?.lastname}</small>
            </div>
          </div>
        </div>
      </header>

      {/* Layout: Sidebar + Content */}
      <div className="container-fluid ">
        <div className="row">
          {/* Sidebar - Desktop */}
          <aside className="col-md-3 col-lg-2 d-none d-md-block border-end bg-white sidebar z-1">
            <div className="p-3">
              <div className="text-muted small mb-2">Navigation</div>
              <ul className="nav nav-pills flex-column gap-1">
                <li className="nav-item">
                  <a className="nav-link" href="#overview">
                    <i className="bi bi-house-door me-2"></i>Overview
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#skills">
                    <i className="bi bi-lightbulb me-2"></i>Skills
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#tasks">
                    <i className="bi bi-list-task me-2"></i>Tasks
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#leave">
                    <i className="bi bi-calendar-event me-2"></i>Leave
                  </a>
                </li>
              </ul>

              <hr className="my-3" />
              <div className="text-muted small mb-2">Actions</div>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-secondary btn-sm" onClick={ShowMembers}>
                  <i className="bi bi-people me-2"></i>Team
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  data-bs-toggle="modal"
                  data-bs-target="#updateProfileModal"
                  onClick={closeOffcanvasIfOpen} // ✅ ensure offcanvas closed before modal
                >
                  <i className="bi bi-person-gear me-2"></i>Profile
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  data-bs-toggle="modal"
                  data-bs-target="#updatePasswordModal"
                  onClick={closeOffcanvasIfOpen} // ✅ ensure offcanvas closed before modal
                >
                  <i className="bi bi-key-fill me-2"></i>Password
                </button>
                <a href="/common-review" className="btn btn-outline-secondary btn-sm">
                  <i className="bi bi-list-check me-2"></i>Review
                </a>
                <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>Logout
                </button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="col-md-9 col-lg-10 p-3">
            {/* Overview */}
            <section id="overview" className="mb-4">
              <div className="row g-3">
                <div className="col-sm-6 col-lg-3">
                  <div className="card text-center shadow-sm border-0 h-100">
                    <div className="card-body">
                      <i className="bi bi-briefcase-fill text-primary fs-2"></i>
                      <h6 className="mt-2 mb-1">Designation</h6>
                      <p className="fw-bold mb-0">{user?.post || "—"}</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="card text-center shadow-sm border-0 h-100">
                    <div className="card-body">
                      <i className="bi bi-geo-alt-fill text-success fs-2"></i>
                      <h6 className="mt-2 mb-1">Office Location</h6>
                      <p className="fw-bold mb-0">{user?.location || "—"}</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="card text-center shadow-sm border-0 h-100">
                    <div className="card-body">
                      <i className="bi bi-calendar-check-fill text-warning fs-2"></i>
                      <h6 className="mt-2 mb-1">Date of Joining</h6>
                      <p className="fw-bold mb-0">
                        {user?.doj ? new Date(user?.doj).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="card text-center shadow-sm border-0 h-100">
                    <div className="card-body">
                      <i className="fa fa-address-card text-info fs-2"></i>
                      <h6 className="mt-2 mb-1">Total Experience</h6>
                      <p className="fw-bold mb-0">
                        {(() => {
                          const today = new Date();
                          const doj = new Date(user?.doj);
                          if (isNaN(doj)) return "—";
                          const diffInMs = today - doj;
                          const totalDays = diffInMs / (1000 * 60 * 60 * 24);
                          const years = Math.floor(totalDays / 365);
                          const remainingDays = totalDays % 365;
                          const months = Math.floor(remainingDays / 30);
                          const day = Math.floor(remainingDays % 30);
                          return `${years} Years ${months} Months ${day} Day`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card shadow-sm my-4 border-0">
                <div className="card-body text-center">
                  <h6 className="fw-bold">Today’s Inspiration</h6>
                  <p className="fs-5 fst-italic text-primary">
                    “{rotatingQuote.text}”
                    <br />
                    <small className="text-muted">— {rotatingQuote.author}</small>
                  </p>
                </div>
              </div>
            </section>

            {/* Skills */}
            <section id="skills" className="mb-4">
              <div className="card shadow-lg border-0">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Your Skills</h5>
                  <button
                    className="btn btn-light btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#skillModal"
                    onClick={() => {
                      setFormData({
                        skill_id: "",
                        proficiency_percent: "",
                        certificate: "",
                        years_of_experience: "",
                      });
                      setIsEditing(false);
                    }}
                  >
                    <i className="bi bi-plus-circle me-1"></i> Add Skill
                  </button>
                </div>

                <div className="table-responsive p-3">
                  <table className="table table-striped align-middle mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Skill Name</th>
                        <th>Proficiency</th>
                        <th style={{ width: 200 }}>Progress</th>
                        <th className="text-center">Certificate</th>
                        <th className="text-center" style={{ width: 260 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skills.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-4">No skills added yet.</td>
                        </tr>
                      ) : (
                        skills.map((skill, index) => {
                          const barColor =
                            skill.proficiency_percent >= 80 ? "bg-success" :
                              skill.proficiency_percent >= 50 ? "bg-warning" : "bg-danger";
                          return (
                            <tr key={`${skill.skill_id}-${index}`}>
                              <td>{index + 1}</td>
                              <td className="fw-bold">{skill.skill_name}</td>
                              <td>{skill.proficiency_percent}%</td>
                              <td>
                                <div className="progress" style={{ height: 8 }}>
                                  <div className={`progress-bar ${barColor}`} style={{ width: `${skill.proficiency_percent}%` }}></div>
                                </div>
                              </td>
                              <td className="text-center">
                                {skill.certificate && skill.certificate.trim() !== "" ? (
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#certificateModal"
                                    onClick={() => setSelectedCertificate(skill.certificate)}
                                  >
                                    View
                                  </button>
                                ) : (
                                  <span className="text-muted small">No certificate</span>
                                )}
                              </td>
                              <td className="text-center">
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className="btn btn-outline-warning"
                                    data-bs-toggle="modal"
                                    data-bs-target="#skillModal"
                                    onClick={() => handleEditSkill(skill)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="btn btn-outline-danger"
                                    onClick={() => handleDeleteSkill(skill)}
                                  >
                                    Delete
                                  </button>
                                  <button
                                    className="btn btn-outline-primary"
                                    onClick={() => handleTakeExam(skill)}
                                    title="Take Exam"
                                  >
                                    Exam
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Certificate Modal */}
              <div className="modal fade" id="certificateModal" tabIndex="-1" aria-labelledby="certificateModalLabel" >
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="certificateModalLabel">Certificate Preview</h5>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      {selectedCertificate ? (
                        <iframe
                          title="Certificate"
                          src={`https://docs.google.com/viewer?url=${selectedCertificate}&embedded=true`}
                          style={{ width: "100%", height: "500px", border: "none" }}
                        ></iframe>
                      ) : (
                        <p>No certificate selected</p>
                      )}
                    </div>
                    <div className="modal-footer">
                      {selectedCertificate && (
                        <a href={selectedCertificate} download className="btn btn-success">Download</a>
                      )}
                      <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skill Modal */}
              <div className="modal fade" id="skillModal" tabIndex="-1" aria-labelledby="skillModalLabel" >
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                      <h5 className="modal-title" id="skillModalLabel">{isEditing ? "Update Skill" : "Add Skill"}</h5>
                      <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      <form onSubmit={handleAddSkill}>
                        <div className="mb-3">
                          <label className="form-label fw-bold">Select Skill</label>
                          <select
                            name="skill_id"
                            className="form-control"
                            value={formData.skill_id}
                            onChange={handleChange}
                            required
                          >
                            <option value="">-- Choose a Skill --</option>
                            {allSkills.map((skill) => (
                              <option key={skill.skill_id} value={skill.skill_id}>{skill.skill_name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold">Proficiency (%)</label>
                          <input
                            type="number"
                            name="proficiency_percent"
                            className="form-control"
                            value={formData.proficiency_percent}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            placeholder="Enter proficiency (0-100)"
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold">Certificate URL</label>
                          <input
                            type="url"
                            name="certificate"
                            className="form-control"
                            value={formData.certificate}
                            onChange={handleChange}
                            placeholder="Paste certificate link"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold">Years of Experience</label>
                          <input
                            type="number"
                            name="years_of_experience"
                            className="form-control"
                            value={formData.years_of_experience}
                            onChange={handleChange}
                            placeholder="Enter years of experience"
                          />
                        </div>
                        <button type="submit" className="btn btn-primary w-100">
                          <i className="bi bi-check-circle me-2"></i>
                          {isEditing ? "Update Skill" : "Add Skill"}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Tasks */}
            <section id="tasks" className="mb-4">
              <div className="card shadow-lg border-0">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Your Tasks</h5>
                  <button className="btn btn-light btn-sm">
                    <i className="bi bi-plus-circle me-1"></i> Add Task
                  </button>
                </div>
                <div className="row g-3 p-3">
                  {tasks.length === 0 ? (
                    <p className="text-muted">No tasks assigned yet.</p>
                  ) : (
                    tasks.map((task) => (
                      <div className="col-md-6 col-lg-4" key={task.task_id}>
                        <div className="card h-100 shadow-sm border">
                          <div className="card-body">
                            <h6 className="fw-bold text-primary">#{String(task.task_id).padStart(3, "0")} — {task.title}</h6>
                            <p className="text-muted mb-2">{task.description}</p>
                            <p className="mb-2"><strong>Due:</strong> {task.due_date ? new Date(task.due_date).toLocaleDateString() : "N/A"}</p>
                            <span className={`badge ${task.priority === "High" ? "bg-danger" : task.priority === "Medium" ? "bg-warning" : "bg-success"}`}>{task.priority}</span>
                            <div className="progress mt-2 mb-2" style={{ height: 15 }}>
                              <div className="progress-bar" style={{ width: `${task.progress_percent || 0}%` }}>
                                {task.progress_percent || 0}%
                              </div>
                            </div>
                            <select
                              value={task.status || "Not Started"}
                              onChange={(e) => updateTaskStatus(task.task_id, e.target.value)}
                              className="form-select"
                            >
                              <option>Not Started</option>
                              <option>In Progress</option>
                              <option>Completed</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Leave */}
            <section id="leave" className="mb-4">
              <div className="card shadow-lg border-0">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Your Leave</h5>
                  <button className="btn btn-light btn-sm" onClick={handleLeave}>
                    <i className="bi bi-plus-circle me-1"></i> Apply Leave
                  </button>
                </div>
                <div className="table-responsive p-3">
                  <table className="table table-striped align-middle">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Status</th>
                        <th>Manager Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-muted py-4">No leave history available.</td>
                        </tr>
                      ) : (
                        history.map((l) => (
                          <tr key={l.leave_id}>
                            <td>{l.leave_type}</td>
                            <td>{l.start_date ? new Date(l.start_date).toLocaleDateString() : "—"}</td>
                            <td>{l.end_date ? new Date(l.end_date).toLocaleDateString() : "—"}</td>
                            <td>
                              <span className={`badge ${l.status === "Approved" ? "bg-success" : l.status === "Rejected" ? "bg-danger" : "bg-warning"}`}>{l.status}</span>
                            </td>
                            <td>{l.manager_comments || "—"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Members Modal */}
      <div className="modal fade" id="membersModal" tabIndex="-1" >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Team Members of {user?.firstname} {user?.lastname}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {members.length === 0 ? (
                <p className="text-muted">No members found.</p>
              ) : (
                <div className="text-center">
                  <div className="d-inline-flex align-items-center gap-2 p-2 border rounded bg-light">
                    <img
                      src={
                        manager[0]?.profile_picture
                          ? `${API_BASE_URL}/uploads/${encodeURIComponent(manager[0]?.profile_picture)}`
                          : "https://avatar.iran.liara.run/public"
                      }
                      alt="Manager"
                      className="rounded-circle"
                      width="40"
                      height="40"
                      style={{ objectFit: "cover" }}
                    />
                    <div className="text-start">
                      <div className="fw-semibold">{manager[0]?.firstname} {manager[0]?.lastname}</div>
                      <div className="text-muted small">{manager[0]?.role} · {manager[0]?.post}</div>
                    </div>
                  </div>
                  <div className="mx-auto my-2" style={{ width: 2, height: 16, background: "#dee2e6" }}></div>
                  <div className="row g-3 justify-content-center">
                    {members.map((m) => (
                      <div key={m.EmployeeId} className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <div className="card h-100 shadow-sm">
                          <div className="card-body">
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <img
                                src={
                                  m.profile_picture
                                    ? `${API_BASE_URL}/uploads/${encodeURIComponent(m.profile_picture)}`
                                    : "https://avatar.iran.liara.run/public"
                                }
                                alt="Profile"
                                className="rounded-circle"
                                width="36"
                                height="36"
                                style={{ objectFit: "cover" }}
                              />
                              <div>
                                <div className="fw-semibold small">{m.firstname} {m.lastname}</div>
                                <div className="text-muted small">{m.post}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Update Password Modal */}
      <div className="modal fade" id="updatePasswordModal" tabIndex="-1" data-bs-focus="false">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-secondary text-white">
              <h5 className="modal-title">
                <i className="bi bi-key-fill me-2"></i> Update Password
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdatePassword} noValidate>
                <div className="mb-3">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={pwdForm.current_password}
                    onChange={(e) => setPwdForm({ ...pwdForm, current_password: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="At least 8 characters"
                    value={pwdForm.new_password}
                    onChange={(e) => setPwdForm({ ...pwdForm, new_password: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={pwdForm.confirm_password}
                    onChange={(e) => setPwdForm({ ...pwdForm, confirm_password: e.target.value })}
                    required
                  />
                </div>

                {pwdMessage && (
                  <div className={`alert ${pwdMessage.startsWith("✅") ? "alert-success" : "alert-warning"}`} role="alert">
                    {pwdMessage}
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary w-100" disabled={pwdSubmitting}>
                    {pwdSubmitting ? "Updating…" : "Update Password"}
                  </button>
                  <button type="button" className="btn btn-warning w-100" data-bs-dismiss="modal">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Update Profile Modal */}
      <div className="modal fade" id="updateProfileModal" tabIndex="-1" aria-labelledby="updateProfileModalLabel" data-bs-focus="false">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="updateProfileModalLabel">Update Profile</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await UpdateMember();
                  const modalElement = document.getElementById("updateProfileModal");
                  const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
                  modalInstance?.hide();
                  // ❌ REMOVE manual backdrop removal
                  // document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
                }}
              >
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">First Name</label>
                    <input
                      name="firstname"
                      className="form-control"
                      value={userData.firstname || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Last Name</label>
                    <input
                      name="lastname"
                      className="form-control"
                      value={userData.lastname || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={userData.email || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Designation</label>
                    <input
                      name="post"
                      className="form-control"
                      value={userData.post || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Location</label>
                    <input
                      name="location"
                      className="form-control"
                      value={userData.location || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Date of Joining</label>
                  <input
                    type="date"
                    name="doj"
                    className="form-control"
                    value={userData.doj || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Profile Picture</label>
                  <input type="file" className="form-control" onChange={handleFileChange} />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary flex-fill">Save Changes</button>
                  <button type="button" className="btn btn-secondary flex-fill" data-bs-dismiss="modal">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Offcanvas Sidebar - Mobile */}
      <div className="offcanvas offcanvas-start" tabIndex="-1" id="sidebarOffcanvas" aria-labelledby="sidebarOffcanvasLabel">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="sidebarOffcanvasLabel">
            <a className="navbar-brand d-flex align-items-center gap-2" href="/">
              <img src={brand} alt="Brand" width="36" height="36" className="rounded-circle" />
              <span className="fw-bold">Member Dashboard</span>
            </a>
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body d-flex flex-column">
          <div className="text-muted small mb-2">Navigation</div>
          <ul className="nav nav-pills flex-column gap-1 mb-3">
            <li className="nav-item">
              <a className="nav-link" href="#overview" data-bs-dismiss="offcanvas">
                <i className="bi bi-house-door me-2"></i>Overview
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#skills" data-bs-dismiss="offcanvas">
                <i className="bi bi-lightbulb me-2"></i>Skills
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#tasks" data-bs-dismiss="offcanvas">
                <i className="bi bi-list-task me-2"></i>Tasks
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#leave" data-bs-dismiss="offcanvas">
                <i className="bi bi-calendar-event me-2"></i>Leave
              </a>
            </li>
          </ul>

          <div className="text-muted small mb-2">Actions</div>
          <div className="d-grid gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={ShowMembers} data-bs-dismiss="offcanvas">
              <i className="bi bi-people me-2"></i>Team
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              data-bs-toggle="modal"
              data-bs-target="#updateProfileModal"
              data-bs-dismiss="offcanvas"
              onClick={closeOffcanvasIfOpen} // extra guard
            >
              <i className="bi bi-person-gear me-2"></i>Profile
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              data-bs-toggle="modal"
              data-bs-target="#updatePasswordModal"
              data-bs-dismiss="offcanvas"
              onClick={closeOffcanvasIfOpen}
            >
              <i className="bi bi-key-fill me-2"></i>Password
            </button>
            <a href="/common-review" className="btn btn-outline-secondary btn-sm" data-bs-dismiss="offcanvas">
              <i className="bi bi-list-check me-2"></i>Review
            </a>
            <button className="btn btn-danger btn-sm" onClick={handleLogout} data-bs-dismiss="offcanvas">
              <i className="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
