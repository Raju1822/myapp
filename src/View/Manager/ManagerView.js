
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// If you use Charts (react-chartjs-2 + chart.js) like your CommonReview:
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const API_BASE_URL = "http://localhost:5000";
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const toArray = (data) => (Array.isArray(data) ? data : data?.data || []);
const safeImg = (file) =>
  file ? `${API_BASE_URL}/uploads/${encodeURIComponent(file)}` : "https://avatar.iran.liara.run/public";

const ManagerView = () => {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem("loggedInUser")) || null);

  // Mode: 'dashboard' | 'review'
  const [mode, setMode] = useState("dashboard");

  // ---------------------------------
  // Dashboard: Overview helpers
  // ---------------------------------
  const experienceText = useMemo(() => {
    const doj = new Date(user?.doj);
    if (!user?.doj || Number.isNaN(doj.getTime())) return "—";
    const diffInMs = Date.now() - doj.getTime();
    const totalDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = Math.floor((totalDays % 365) % 30);
    return `${years} Years ${months} Months ${days} Days`;
  }, [user?.doj]);

  // ---------------------------------
  // Dashboard: Skills (CRUD + Exam)
  // ---------------------------------
  const [skills, setSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [skillForm, setSkillForm] = useState({
    skill_id: "",
    proficiency_percent: "",
    certificate: "",
    years_of_experience: "",
  });

  useEffect(() => {
    if (!user?.EmployeeId) return;
    (async () => {
      try {
        const [mySkillsRes, allSkillsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/user-skills/${user.EmployeeId}`),
          fetch(`${API_BASE_URL}/api/skills`),
        ]);
        const mySkills = await mySkillsRes.json();
        const skillCatalog = await allSkillsRes.json();
        setSkills(toArray(mySkills));
        setAllSkills(toArray(skillCatalog));
      } catch (e) {
        console.error("Skills load error:", e);
        setSkills([]);
        setAllSkills([]);
      }
    })();
  }, [user?.EmployeeId]);

  const onSkillFormChange = (e) => {
    const { name, value } = e.target;
    setSkillForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSkill = (skill) => {
    setIsEditing(true);
    setSkillForm({
      skill_id: skill.skill_id,
      proficiency_percent: skill.proficiency_percent,
      certificate: skill.certificate || "",
      years_of_experience: skill.years_of_experience || "",
    });
    const modal = new window.bootstrap.Modal(document.getElementById("skillModal"));
    modal.show();
  };

  const handleAddSkillInit = () => {
    setIsEditing(false);
    setSkillForm({
      skill_id: "",
      proficiency_percent: "",
      certificate: "",
      years_of_experience: "",
    });
    const modal = new window.bootstrap.Modal(document.getElementById("skillModal"));
    modal.show();
  };

  const saveSkill = async (e) => {
    e.preventDefault();
    const proficiency = Number(skillForm.proficiency_percent);
    const years = Number(skillForm.years_of_experience || 0);
    if (Number.isNaN(proficiency) || proficiency < 0 || proficiency > 100) {
      alert("Proficiency must be between 0 and 100.");
      return;
    }
    const payload = {
      ...skillForm,
      proficiency_percent: proficiency,
      years_of_experience: Number.isNaN(years) ? 0 : years,
      employee_id: user.EmployeeId,
    };
    const url = isEditing ? `${API_BASE_URL}/api/update-skill` : `${API_BASE_URL}/api/add-skill`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      alert(result.message || (isEditing ? "Skill updated" : "Skill added"));
      const modalInstance = window.bootstrap.Modal.getInstance(document.getElementById("skillModal"));
      modalInstance?.hide();
      const updated = await fetch(`${API_BASE_URL}/api/user-skills/${user.EmployeeId}`).then((r) => r.json());
      setSkills(toArray(updated));
    } catch (err) {
      console.error("Save skill error:", err);
      alert("Failed to save skill. Please try again.");
    }
  };

  const handleDeleteSkill = async (skill) => {
    if (!skill?.skill_id) {
      alert("Missing skill id.");
      return;
    }
    if (!window.confirm(`Delete ${skill.skill_name}?`)) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/delete-skill/${user.EmployeeId}/${encodeURIComponent(skill.skill_id)}`,
        { method: "DELETE" }
      );
      const text = await res.text();
      const data = text ? JSON.parse(text) : { message: "Deleted" };
      alert(data.message || "Deleted");
      setSkills((prev) => prev.filter((s) => s.skill_id !== skill.skill_id));
    } catch (e) {
      console.error("Delete skill error:", e);
      alert("Failed to delete. Try again.");
    }
  };

  const handleTakeExam = (skill) => {
    if (!skill?.skill_id) {
      alert("Skill id is missing.");
      return;
    }
    navigate("/skill-exam", { state: { skillId: skill.skill_id, skillName: skill.skill_name } });
  };

  // ---------------------------------
  // Dashboard: Tasks (list + status)
  // ---------------------------------
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    if (!user?.EmployeeId) return;
    (async () => {
      try {
        const data = await fetch(`${API_BASE_URL}/api/mytasks/${user.EmployeeId}`).then((r) => r.json());
        setTasks(toArray(data));
      } catch (e) {
        console.error("Tasks load error:", e);
        setTasks([]);
      }
    })();
  }, [user?.EmployeeId]);

  const updateTaskStatus = async (taskId, status) => {
    const progress = status === "Completed" ? 100 : status === "In Progress" ? 50 : 0;
    try {
      const res = await fetch(`${API_BASE_URL}/api/update-task-status/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, progress_percent: progress }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }
      setTasks((prev) =>
        prev.map((t) => (t.task_id === taskId ? { ...t, status, progress_percent: progress } : t))
      );
    } catch (error) {
      console.error("Task update error:", error);
      alert("Failed to update task status.");
    }
  };

  // ---------------------------------
  // Dashboard: Leave (history + apply)
  // ---------------------------------
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveForm, setLeaveForm] = useState({ leave_type_id: "", start_date: "", end_date: "", reason: "" });
  useEffect(() => {
    if (!user?.EmployeeId) return;
    (async () => {
      try {
        const [histRes, typesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/leave/history/${user.EmployeeId}`),
          fetch(`${API_BASE_URL}/api/leave/types`),
        ]);
        setLeaveHistory(toArray(await histRes.json()));
        setLeaveTypes(toArray(await typesRes.json()));
      } catch (e) {
        console.error("Leave load error:", e);
        setLeaveHistory([]);
        setLeaveTypes([]);
      }
    })();
  }, [user?.EmployeeId]);

  const onLeaveFormChange = (e) => {
    const { name, value } = e.target;
    setLeaveForm((prev) => ({ ...prev, [name]: value }));
  };

  const applyLeave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...leaveForm, employee_id: user.EmployeeId };
      const res = await fetch(`${API_BASE_URL}/api/leave/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      alert(data.message || "Request submitted");
      const refreshed = await fetch(`${API_BASE_URL}/api/leave/history/${user.EmployeeId}`).then((r) => r.json());
      setLeaveHistory(toArray(refreshed));
      setLeaveForm({ leave_type_id: "", start_date: "", end_date: "", reason: "" });
    } catch (err) {
      console.error("Apply leave error:", err);
      alert("Failed to submit leave.");
    }
  };

  // ---------------------------------
  // Dashboard: Holidays
  // ---------------------------------
  const [holidays, setHolidays] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const data = await fetch(`${API_BASE_URL}/api/holidays`).then((r) => r.json());
        setHolidays(toArray(data));
      } catch (e) {
        console.error("Holiday load error:", e);
        setHolidays([]);
      }
    })();
  }, []);

  // ---------------------------------
  // Common Review (for the manager himself)
  // ---------------------------------
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]); // answers[]
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [typeFilter, setTypeFilter] = useState("All"); // All | Monthly | Yearly

  useEffect(() => {
    async function loadMyReviews() {
      if (mode !== "review" || !user?.EmployeeId) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE_URL}/api/reviews/${user.EmployeeId}`);
        const data = await res.json();
        if (!Array.isArray(data)) {
          setReviews([]);
        } else {
          setReviews(data);
          const years = [...new Set(data.map((r) => r.review_year))].sort();
          if (years.length && !years.includes(selectedYear)) {
            setSelectedYear(years[years.length - 1]);
          }
        }
      } catch (e) {
        console.error("Load reviews error", e);
        setError("Unable to load your reviews right now.");
      } finally {
        setLoading(false);
      }
    }
    loadMyReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, user?.EmployeeId]);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const typeOk = typeFilter === "All" ? true : r.review_type === typeFilter;
      const yearOk = r.review_year === selectedYear;
      return typeOk && yearOk;
    });
  }, [reviews, typeFilter, selectedYear]);

  const isCompleted = (r) => r.status === "Completed";
  const averageRating = (answers) => {
    if (!answers?.length) return null;
    const sum = answers.reduce((acc, a) => acc + (Number(a.rating) || 0), 0);
    return (sum / answers.length).toFixed(2);
  };
  const formatReviewTitle = (r) => {
    const monthLabel =
      r.review_type === "Monthly" && r.review_month ? ` - ${monthNames[r.review_month - 1]}` : "";
    return `${r.review_type}${monthLabel} ${r.review_year}`;
  };

  // Charts
  const monthlyTrendData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const monthlyCompleted = filtered
      .filter((r) => r.review_type === "Monthly" && isCompleted(r))
      .reduce((map, r) => {
        const avg = averageRating(r.answers);
        if (avg !== null) map[r.review_month] = Number(avg);
        return map;
      }, {});
    const dataPoints = months.map((m) => monthlyCompleted[m] ?? null);
    return {
      labels: monthNames,
      datasets: [
        {
          label: "Avg Rating (Monthly)",
          data: dataPoints,
          borderColor: "rgba(54, 162, 235, 0.9)",
          backgroundColor: "rgba(54, 162, 235, 0.3)",
          tension: 0.25,
          spanGaps: true,
        },
      ],
    };
  }, [filtered]);

  const perQuestionData = useMemo(() => {
    const completed = filtered.filter(isCompleted);
    const qMap = new Map(); // question_id -> { text, sum, count }
    for (const r of completed) {
      for (const a of r.answers || []) {
        const entry = qMap.get(a.question_id) || { text: a.question_text, sum: 0, count: 0 };
        entry.sum += Number(a.rating) || 0;
        entry.count += 1;
        qMap.set(a.question_id, entry);
      }
    }
    const entries = Array.from(qMap.entries()).sort(([qa], [qb]) => qa - qb);
    const labels = entries.map(([, v]) => v.text);
    const avgs = entries.map(([, v]) => (v.count ? (v.sum / v.count).toFixed(2) : 0));
    return {
      labels,
      datasets: [
        {
          label: "Avg Rating by Question",
          data: avgs,
          backgroundColor: "rgba(255, 159, 64, 0.6)",
        },
      ],
    };
  }, [filtered]);

  const overallAvg = useMemo(() => {
    const completed = filtered.filter(isCompleted);
    const ratings = completed.flatMap((r) => r.answers?.map((a) => Number(a.rating) || 0) || []);
    if (!ratings.length) return null;
    const sum = ratings.reduce((acc, v) => acc + v, 0);
    return (sum / ratings.length).toFixed(2);
  }, [filtered]);

  const latestReview = useMemo(() => {
    if (!filtered.length) return null;
    const sorted = [...filtered].sort((a, b) => {
      if (a.review_year !== b.review_year) return b.review_year - a.review_year;
      const ma = a.review_month || 0,
        mb = b.review_month || 0;
      return mb - ma;
    });
    return sorted[0];
  }, [filtered]);

  // ---------------------------------
  // Common actions
  // ---------------------------------
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  // ---------------------------------
  // Render: mode switch
  // ---------------------------------
  if (mode === "review") {
    // === Common Review view (for manager himself) ===
    return (
      <>
        <div className="container py-4">
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-3">
              <img
                src={user?.profile_picture_url || safeImg(user?.profile_picture)}
                alt="Profile"
                width="56"
                height="56"
                className="rounded-circle"
                style={{ objectFit: "cover" }}
              />
              <div>
                <div className="h5 mb-0">
                  {user?.firstname} {user?.lastname}
                </div>
                <div className="text-muted small">
                  {user?.post} · {user?.location}
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              {/* Back to dashboard */}
              <button className="btn btn-outline-secondary" onClick={() => setMode("dashboard")}>
                <i className="bi bi-arrow-left me-1" /> Back
              </button>
              <button className="btn btn-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-1" /> Logout
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="card mb-3">
            <div className="card-body d-flex flex-wrap gap-3">
              <div>
                <label className="form-label mb-0">Review Type</label>
                <select
                  className="form-select form-select-sm"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option>All</option>
                  <option>Monthly</option>
                  <option>Yearly</option>
                </select>
              </div>
              <div>
                <label className="form-label mb-0">Year</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {[...new Set(reviews.map((r) => r.review_year))]
                    .sort()
                    .map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  {!reviews.length && <option value={selectedYear}>{selectedYear}</option>}
                </select>
              </div>
              <div className="ms-auto text-muted small">
                {loading ? "Loading…" : error ? <span className="text-danger">{error}</span> : `${filtered.length} record(s)`}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="fw-semibold">Overall Average Rating</div>
                  <div className="display-6">{overallAvg ?? "—"}</div>
                  <div className="text-muted small">
                    Based on completed reviews in {selectedYear}
                    {typeFilter !== "All" ? ` (${typeFilter})` : ""}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="fw-semibold">Latest Review</div>
                  {latestReview ? (
                    <>
                      <div>{formatReviewTitle(latestReview)}</div>
                      <div className="small text-muted">
                        Status:{" "}
                        <span
                          className={`badge ${
                            latestReview.status === "Completed" ? "bg-success" : "bg-warning text-dark"
                          }`}
                        >
                          {latestReview.status}
                        </span>
                      </div>
                      {latestReview.manager_name && (
                        <div className="small text-muted mt-1">By {latestReview.manager_name}</div>
                      )}
                    </>
                  ) : (
                    <div className="text-muted">No reviews yet</div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="fw-semibold">Completed vs Pending</div>
                  <div className="h2 mb-0">
                    {filtered.filter(isCompleted).length} / {filtered.length}
                  </div>
                  <div className="text-muted small">
                    Completed in {selectedYear}
                    {typeFilter !== "All" ? ` (${typeFilter})` : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header">Monthly Trend (Average Rating)</div>
                <div className="card-body" style={{ height: 320 }}>
                  <Line
                    data={monthlyTrendData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: { y: { min: 0, max: 5, ticks: { stepSize: 1 } } },
                      plugins: { legend: { position: "bottom" }, tooltip: { mode: "index", intersect: false } },
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header">Per-Question Averages</div>
                <div className="card-body" style={{ height: 320 }}>
                  <Bar
                    data={perQuestionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: { y: { min: 0, max: 5, ticks: { stepSize: 1 } } },
                      plugins: { legend: { position: "bottom" } },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Review History */}
          <div className="card">
            <div className="card-header">
              Review History ({selectedYear}
              {typeFilter !== "All" ? ` · ${typeFilter}` : ""})
            </div>
            <div className="card-body">
              {!filtered.length && <div className="text-muted">No reviews to show for selected filters.</div>}
              {filtered.map((r) => (
                <div key={r.review_id} className="border rounded p-3 mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="fw-semibold">{formatReviewTitle(r)}</div>
                    <span
                      className={`badge ${r.status === "Completed" ? "bg-success" : "bg-warning text-dark"}`}
                    >
                      {r.status}
                    </span>
                  </div>
                  {r.manager_name && (
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <img
                        src={r.manager_profile_picture_url || "https://avatar.iran.liara.run/public"}
                        alt="Manager"
                        width="28"
                        height="28"
                        className="rounded-circle"
                        style={{ objectFit: "cover" }}
                      />
                      <div className="small text-muted">Reviewed by {r.manager_name}</div>
                    </div>
                  )}
                  {r.comments && (
                    <div className="mb-2">
                      <strong>Comments:</strong> {r.comments}
                    </div>
                  )}
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "70%" }}>Question</th>
                          <th className="text-center">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(r.answers) && r.answers.length > 0 ? (
                          r.answers.map((a) => (
                            <tr key={`${r.review_id}-${a.question_id}`}>
                              <td>{a.question_text}</td>
                              <td className="text-center">{a.rating}/5</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} className="text-muted">
                              No ratings recorded (Pending review)
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // === Dashboard view ===
  return (
    <div className="container py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-3">
          <img
            src={user?.profile_picture_url || safeImg(user?.profile_picture)}
            alt="Manager"
            width="56"
            height="56"
            className="rounded-circle"
            style={{ objectFit: "cover" }}
          />
          <div>
            <div className="h5 mb-0">
              {user?.firstname} {user?.lastname}
            </div>
            <div className="text-muted small">
              {user?.post} · {user?.location}
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-outline-primary" onClick={() => setMode("review")}>
            <i className="bi bi-list-check me-1" />
            Review
          </button>
          {/* Back (go further back) */}
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-1" /> Back
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1" /> Logout
          </button>
        </div>
      </div>

      {/* Overview */}
      <div className="row g-3 mb-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <i className="bi bi-person-badge fs-2 text-primary" />
              <div className="mt-2">Role</div>
              <div className="fw-bold">{user?.role || "—"}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <i className="bi bi-geo-alt fs-2 text-success" />
              <div className="mt-2">Location</div>
              <div className="fw-bold">{user?.location || "—"}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <i className="bi bi-calendar-check fs-2 text-warning" />
              <div className="mt-2">Joined</div>
              <div className="fw-bold">{user?.doj ? new Date(user.doj).toLocaleDateString() : "—"}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <i className="bi bi-award fs-2 text-info" />
              <div className="mt-2">Experience</div>
              <div className="fw-bold">{experienceText}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <strong>Skills</strong>
          <button className="btn btn-sm btn-primary" onClick={handleAddSkillInit}>
            <i className="bi bi-plus-circle me-1" />
            Add Skill
          </button>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Skill</th>
                  <th>Proficiency</th>
                  <th style={{ width: 220 }}>Progress</th>
                  <th className="text-center">Certificate</th>
                  <th className="text-center" style={{ width: 280 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {skills.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-3">
                      No skills yet.
                    </td>
                  </tr>
                ) : (
                  skills.map((s, idx) => {
                    const barColor =
                      s.proficiency_percent >= 80
                        ? "bg-success"
                        : s.proficiency_percent >= 50
                        ? "bg-warning"
                        : "bg-danger";
                    return (
                      <tr key={`${s.skill_id}-${idx}`}>
                        <td>{idx + 1}</td>
                        <td className="fw-semibold">{s.skill_name}</td>
                        <td>{s.proficiency_percent}%</td>
                        <td>
                          <div
                            className="progress"
                            style={{ height: 10 }}
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={s.proficiency_percent}
                          >
                            <div className={`progress-bar ${barColor}`} style={{ width: `${s.proficiency_percent}%` }} />
                          </div>
                        </td>
                        <td className="text-center">
                          {s.certificate?.trim() ? (
                            <button
                              className="btn btn-sm btn-outline-primary"
                              data-bs-toggle="modal"
                              data-bs-target="#certificateModal"
                              onClick={() => setSelectedCertificate(s.certificate)}
                            >
                              View
                            </button>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>
                        <td className="text-center">
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-primary" onClick={() => handleTakeExam(s)} title="Take Exam">
                              Exam
                            </button>
                            <button className="btn btn-outline-warning" onClick={() => handleEditSkill(s)}>
                              Edit
                            </button>
                            <button className="btn btn-outline-danger" onClick={() => handleDeleteSkill(s)}>
                              Delete
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
      </div>

      {/* Tasks */}
      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <strong>Tasks</strong>
          <span className="text-muted small">{tasks.length} item(s)</span>
        </div>
        <div className="card-body">
          {tasks.length === 0 ? (
            <div className="text-muted">No tasks assigned.</div>
          ) : (
            <div className="row g-3">
              {tasks.map((t) => (
                <div className="col-md-6 col-lg-4" key={t.task_id}>
                  <div className="card h-100 shadow-sm border">
                    <div className="card-body">
                      <div className="fw-semibold text-primary">
                        #{String(t.task_id).padStart(3, "0")} — {t.title}
                      </div>
                      <div className="small text-muted mb-2">{t.description}</div>
                      <div className="mb-2">
                        <strong>Due:</strong>{" "}
                        {t.due_date ? new Date(t.due_date).toLocaleDateString() : "N/A"}
                      </div>
                      <span
                        className={`badge ${
                          t.priority === "High"
                            ? "bg-danger"
                            : t.priority === "Medium"
                            ? "bg-warning text-dark"
                            : "bg-success"
                        }`}
                      >
                        {t.priority}
                      </span>
                      <div className="progress mt-2 mb-2" style={{ height: 14 }}>
                        <div className="progress-bar" style={{ width: `${t.progress_percent || 0}%` }}>
                          {t.progress_percent || 0}%
                        </div>
                      </div>
                      <select
                        className="form-select form-select-sm"
                        value={t.status || "Not Started"}
                        onChange={(e) => updateTaskStatus(t.task_id, e.target.value)}
                      >
                        <option>Not Started</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Leave */}
      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <strong>Leave</strong>
          <span className="text-muted small">{leaveHistory.length} record(s)</span>
        </div>
        <div className="card-body">
          {/* History */}
          <div className="table-responsive mb-3">
            <table className="table table-striped align-middle">
              <thead className="table-light">
                <tr>
                  <th>Type</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                  <th>Manager Comments</th>
                </tr>
              </thead>
              <tbody>
                {leaveHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-muted text-center">
                      No leave history.
                    </td>
                  </tr>
                ) : (
                  leaveHistory.map((l) => (
                    <tr key={l.leave_id}>
                      <td>{l.leave_type}</td>
                      <td>{l.start_date ? new Date(l.start_date).toLocaleDateString() : "—"}</td>
                      <td>{l.end_date ? new Date(l.end_date).toLocaleDateString() : "—"}</td>
                      <td>
                        <span
                          className={`badge ${
                            l.status === "Approved"
                              ? "bg-success"
                              : l.status === "Rejected"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td>{l.manager_comments || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Apply leave */}
          <div className="border rounded p-3">
            <div className="h6 mb-3">Apply Leave</div>
            <form onSubmit={applyLeave}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Leave Type</label>
                  <select
                    name="leave_type_id"
                    className="form-select"
                    value={leaveForm.leave_type_id}
                    onChange={onLeaveFormChange}
                    required
                  >
                    <option value="">Select</option>
                    {leaveTypes.map((lt) => (
                      <option key={lt.leave_type_id} value={lt.leave_type_id}>
                        {lt.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    className="form-control"
                    value={leaveForm.start_date}
                    onChange={onLeaveFormChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    className="form-control"
                    value={leaveForm.end_date}
                    onChange={onLeaveFormChange}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Reason</label>
                  <textarea
                    name="reason"
                    className="form-control"
                    rows={2}
                    value={leaveForm.reason}
                    onChange={onLeaveFormChange}
                    required
                  />
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-primary" type="submit">
                  Submit Request
                </button>
                <button
                  className="btn btn-light"
                  type="button"
                  onClick={() =>
                    setLeaveForm({ leave_type_id: "", start_date: "", end_date: "", reason: "" })
                  }
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Holidays */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <strong>Company Holidays</strong>
          <span className="text-muted small">{holidays.length} item(s)</span>
        </div>
        <div className="card-body">
          {holidays.length === 0 ? (
            <div className="text-muted">No holidays found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Description</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.map((h, idx) => (
                    <tr key={h.holiday_id ?? idx}>
                      <td>{h.holiday_id ?? idx + 1}</td>
                      <td>{h.description}</td>
                      <td>{new Date(h.holiday_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Modal */}
      <div className="modal fade" id="certificateModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Certificate Preview</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div className="modal-body">
              {selectedCertificate ? (
                <iframe
                  title="Certificate"
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                    selectedCertificate
                  )}&embedded=true`}
                  style={{ width: "100%", height: 500, border: "none" }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <p className="text-muted">No certificate selected</p>
              )}
            </div>
            <div className="modal-footer">
              {selectedCertificate && (
                <a
                  href={selectedCertificate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success"
                >
                  Open
                </a>
              )}
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Modal */}
      <div className="modal fade" id="skillModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={saveSkill}>
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">{isEditing ? "Update Skill" : "Add Skill"}</h5>
                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Skill</label>
                  <select
                    name="skill_id"
                    className="form-select"
                    value={skillForm.skill_id}
                    onChange={onSkillFormChange}
                    required
                  >
                    <option value="">Select skill</option>
                    {allSkills.map((s) => (
                      <option key={s.skill_id} value={s.skill_id}>
                        {s.skill_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Proficiency (%)</label>
                  <input
                    type="number"
                    name="proficiency_percent"
                    className="form-control"
                    min={0}
                    max={100}
                    value={skillForm.proficiency_percent}
                    onChange={onSkillFormChange}
                    placeholder="0 - 100"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Certificate URL (optional)</label>
                  <input
                    type="url"
                    name="certificate"
                    className="form-control"
                    value={skillForm.certificate}
                    onChange={onSkillFormChange}
                    placeholder="https://..."
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Years of Experience (optional)</label>
                  <input
                    type="number"
                    name="years_of_experience"
                    className="form-control"
                    value={skillForm.years_of_experience}
                    onChange={onSkillFormChange}
                    placeholder="e.g. 3"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" type="submit">
                  {isEditing ? "Update" : "Add"}
                </button>
                <button className="btn btn-light" type="button" data-bs-dismiss="modal">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerView;
