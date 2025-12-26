import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import brand from '../logo.svg';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
function Dashboard() {
  // ----------------- Theme handling -----------------
  const [theme, setTheme] = useState('auto'); // 'light' | 'dark' | 'auto'
  const [searchOpen, setSearchOpen] = useState(false);
  const systemPrefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolvedTheme = theme === 'auto' ? (systemPrefersDark ? 'dark' : 'light') : theme;
  useEffect(() => {
    cleanupBootstrapOverlays();
    document.body.setAttribute('data-bs-theme', resolvedTheme);
  }, [resolvedTheme]);
  // ----------------- Auth / navigate -----------------
  const navigate = useNavigate();
  // eslint-disable-next-line
  const user = JSON.parse(localStorage.getItem('loggedInUser')) || {};
  // utils/bootstrapCleanup.js
  function cleanupBootstrapOverlays() {
    // Remove all modal backdrops
    document.querySelectorAll('.modal-backdrop').forEach((bd) => bd.remove());
    // Remove modal-open class to restore body scroll
    document.body.classList.remove('modal-open');
    // Bootstrap may add right padding to avoid layout shift
    document.body.style.removeProperty('padding-right');
  }
  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/');
  };
  // ----------------- Employees (mapped to manager) -----------------
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  useEffect(() => {
    if (user && user.EmployeeId) {
      fetch(`http://localhost:5000/api/mapped-emp/${user.EmployeeId}`)
        .then(res => res.json())
        .then(data => {
          const list = Array.isArray(data) ? data : (data?.data ?? []);
          setEmployees(list);
        })
        .catch(err => console.error('Error fetching employees:', err));
    }
  }, [user]);
  const handleRowClick = (employee) => {
    setSelectedEmployee(employee);
    const modalEl = document.getElementById('employeeModal');
    if (!modalEl || !window.bootstrap) return;
    const modal = new window.bootstrap.Modal(modalEl);
    modal.show();
  };
  // ----------------- Members & Tasks -----------------
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    if (!user?.EmployeeId) return;
    // Members
    fetch(`http://localhost:5000/api/directmembers/${user.EmployeeId}`)
      .then(response => response.json())
      .then(data => {
        setMembers(Array.isArray(data) ? data : (data?.data ?? []));
      })
      .catch(error => {
        console.error('Error fetching members:', error);
        setMembers([]);
      });
    // Tasks
    const fetchTasks = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/tasks/${user.EmployeeId}`);
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : (data?.data ?? []));
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
      }
    };
    fetchTasks();
  }, [user?.EmployeeId]);
  // ----------------- Productivity chart data (members vs tasks count) -----------------
  // ----------------- Chart.js (CDN) charts -----------------
  // ----------------- Task modal (Add/Edit) -----------------
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [taskData, setTaskData] = useState({
    task_id: null,
    title: '',
    description: '',
    assigned_to: '',
    start_date: '',
    due_date: '',
    priority: 'Medium',
  });
  const handleTaskChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };
  const handleAddTaskClick = () => {
    setIsEditing(false);
    setTaskData({
      task_id: null,
      title: '',
      description: '',
      assigned_to: '',
      start_date: '',
      due_date: '',
      priority: 'Medium',
    });
    setShowTaskModal(true);
  };
  const handleEditTaskClick = (task) => {
    setIsEditing(true);
    setTaskData({
      task_id: task.task_id,
      title: task.title,
      description: task.description,
      assigned_to: task.assigned_to,
      start_date: task.start_date ? task.start_date.split('T')[0] : '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      priority: task.priority ?? 'Medium',
    });
    setShowTaskModal(true);
  };
  const handleSubmitTask = async (e) => {
    e.preventDefault();
    const url = isEditing
      ? `http://localhost:5000/api/update-task/${taskData.task_id}`
      : 'http://localhost:5000/api/add-task';
    const method = isEditing ? 'PATCH' : 'POST';
    const payload = { ...taskData, assigned_by: user.EmployeeId };
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      alert(result.message || 'Operation completed');
      setShowTaskModal(false);
      // Refresh tasks
      try {
        const res = await fetch(`http://localhost:5000/api/tasks/${user.EmployeeId}`);
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : (data?.data ?? []));
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      alert('Failed to save task. Please try again.');
    }
  };
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/delete-task/${taskId}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        alert(result.message || 'Task deleted');
        // Refresh tasks
        try {
          const res = await fetch(`http://localhost:5000/api/tasks/${user.EmployeeId}`);
          const data = await res.json();
          setTasks(Array.isArray(data) ? data : (data?.data ?? []));
        } catch (error) {
          console.error('Error fetching tasks:', error);
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };
  //-----------------------
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        // Fetch members
        const membersRes = await fetch(`http://localhost:5000/api/directmembers/${user.EmployeeId}`);
        const membersData = await membersRes.json();
        const members = Array.isArray(membersData) ? membersData : (membersData.data || []);
        // Fetch tasks
        const tasksRes = await fetch(`http://localhost:5000/api/tasks/${user.EmployeeId}`);
        const tasksData = await tasksRes.json();
        const tasks = Array.isArray(tasksData) ? tasksData : (tasksData.data || []);
        // Count tasks per member
        const labels = members.map(m => `${m.firstname} ${m.lastname}`);
        const counts = members.map(m => tasks.filter(t => t.assigned_to === m.EmployeeId).length);
        const colors = counts.map(count => {
          if (count <= 2) return "rgba(75, 192, 75, 0.7)"; // Green
          if (count <= 5) return "rgba(255, 159, 64, 0.7)"; // Orange
          if (count <= 9) return "rgba(226, 98, 83, 0.7)"; // Blue
          return "rgba(241, 9, 59, 0.7)"; // Red
        });
        // Update chart data
        setChartData({
          labels,
          datasets: [
            {
              label: 'Tasks',
              data: counts,
              backgroundColor: colors
            }
          ]
        });
      } catch (err) {
        console.error('Error building chart:', err);
      }
    };
    fetchChartData();
  }, [user.EmployeeId]);
  // Derived KPI: Completion %
  const completionPct =
    tasks.length > 0
      ? Math.round((tasks.filter(t => (t.status ?? 'Pending') === 'Completed').length / tasks.length) * 100)
      : 0;
  // const Data = {
  //     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  //     datasets: [
  //       {
  //         label: 'Productivity',
  //         data: [65, 59, 80, 81, 56],
  //         backgroundColor: 'rgba(54, 162, 235, 0.6)',
  //       },
  //     ],
  //   };
  // Register components for Line chart
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, ChartDataLabels,RadialLinearScale, Filler, Title, Tooltip, Legend);
  // const Data = {
  //   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  //   datasets: [
  //     {
  //       label: 'Productivity',
  //       data: [10, 59, 30, 81, 56],
  //       borderColor: 'rgba(54, 162, 235, 1)', // Line color
  //       backgroundColor: 'rgba(54, 162, 235, 0.2)', // Fill under line
  //       fill: true, // Fill area under line
  //       tension: 0, // Smooth curve
  //       pointBackgroundColor: 'rgba(54, 162, 235, 1)', // Point color
  //     },
  //   ],
  // };
  // const options = {
  //   responsive: true,
  //   plugins: {
  //     legend: { position: 'top' },
  //     title: { display: true, text: 'Team Productivity Over Months' },
  //   },
  //   scales: {
  //     y: { beginAtZero: true },
  //   },
  // };
  // Prepare monthly completed tasks data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const completedByMonth = Array(12).fill(0);
  tasks.forEach(task => {
    if ((task.status ?? '').toLowerCase() === 'completed' && task.updated_at) {
      const date = new Date(task.updated_at);
      if (!isNaN(date.getTime())) {
        const monthIndex = date.getMonth(); // 0 = Jan
        completedByMonth[monthIndex]++;
      }
    }
  });
  const lineData = {
    labels: months,
    datasets: [
      {
        label: '',
        data: completedByMonth,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.1,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
      },
    ],
  };
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Task Completed Per Month' },
      datalabels: {
        display: true,
        font: { weight: 'bold' },
        formatter: (value) => value, // Show the count
        align: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 0.5, // ✅ Force steps of 1
          // callback: function (value) {
          //   return Number.isInteger(value) ? value : ''; // ✅ Hide decimals
          // },
        },
      },
    },
  };
  //Pie chart
  const statusCounts = {
    Completed: tasks.filter(t => (t.status ?? 'Not Started') === 'Completed').length,
    InProgress: tasks.filter(t => (t.status ?? 'Not Started') === 'In Progress').length,
    NotStarted: tasks.filter(t => (t.status ?? 'Not Started') === 'Not Started').length,
  };
  const pieData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [
      {
        data: [statusCounts.Completed, statusCounts.InProgress, statusCounts.NotStarted],
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107'], // Green, Blue, Yellow
        hoverBackgroundColor: ['#45a049', '#1976D2', '#FFB300'],
      },
    ],
  };
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: {
        display: true,
        text: 'Task Status Distribution'
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' },
        formatter: (value, context) => {
          // const label = context.chart.data.labels[context.dataIndex];
          // return `${label}: ${value}`;
          return ` ${value}`;
        },
      },
    },
  };
  //User update function
  const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };
  const [userData, setUserData] = useState(storedUser || {});
  const [selectedFile, setSelectedFile] = useState(null);
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  }
  const UpdateMember = async () => {
    try {
      const formData = new FormData();
      formData.append("EmployeeId", userData.EmployeeId);
      formData.append("firstname", userData.firstname);
      formData.append("lastname", userData.lastname);
      formData.append("email", userData.email);
      formData.append("post", userData.post);
      formData.append("location", userData.location);
      formData.append("doj", userData.doj);
      formData.append("mapped_to", userData.mapped_to || "");
      formData.append("role", userData.role);
      if (selectedFile) {
        formData.append("profile_picture", selectedFile);
      }
      const response = await fetch("http://localhost:5000/api/update-profile", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        alert(result.message || "Profile Updated");
        // ✅ Fetch updated user details from backend
        const updatedUserResponse = await fetch(
          `http://localhost:5000/api/user/${userData.EmployeeId}`
        );
        const updatedUser = await updatedUserResponse.json();
        // ✅ Update state and localStorage with new profile picture URL
        setUserData(updatedUser);
        localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
      } else {
        alert(result.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating details:", error);
      alert("Failed to update. Please try again");
    }
  }
  //-------------------------------------------
  //Actions on Member
  const handleMember = async (empid) => {
    navigate(`/user-action/${empid}`);
  }
  //Remove Member
  // const handleRemoveMember  = async (empid) => {
  //     alert(empid);
  //   };
//---------------------------------------
const [leave_request, setLeaveRequest] = useState({});
 useEffect(() => {
        fetch(`http://localhost:5000/api/leave/manager-summary/${user.EmployeeId}`)
            .then(res => res.json())
            .then(data => setLeaveRequest(data));
});
  //----------------------------------------
  //Show Members hierarchy
  const [manager, setManager] = useState([]);
  useEffect(() => {
    fetch(`http://localhost:5000/api/manager/${user.EmployeeId}`)
      .then((res) => res.json())
      .then((data) => setManager(data));
  });
  const [members1, setMembers1] = useState([]);
  const ShowMembers = async () => {
    if (!user?.EmployeeId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/directmembers/${user.mapped_to}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data?.data || []);
      setMembers1(list);
      // Show Bootstrap modal
      const modal = new window.bootstrap.Modal(document.getElementById('membersModal'));
      modal.show();
    } catch (err) {
      console.error('Error fetching members:', err);
      setMembers([]);
    }
  };
// ===================== Skills comparison state =====================
const [skillMatrix, setSkillMatrix] = useState({}); // { employeeId: { skillName: { prof, years, cert } } }
// ---- Composite scoring utility (simple, logical, explainable) ----
// Centralized weights (must sum to 1)
// ---- Option A: Tiered points (very explainable) ----
const profPoints = (p) => {
  const val = Math.max(0, Math.min(Number(p || 0), 100));
  if (val < 25) return 2;
  if (val < 50) return 4;
  if (val < 75) return 7;
  return 10;
};
const expPoints = (years) => {
  const y = Math.min(Number(years || 0), 10);
  if (y <= 1) return 2;
  if (y <= 4) return 4;
  if (y <= 7) return 7;
  return 10;
};
const certPoints = (cert) => {
  const hasCert = typeof cert === 'boolean'
    ? cert
    : Boolean(cert && String(cert).trim() !== '');
  return hasCert ? 2 : 0;
};
const skillScore = (p, y, cert) => {
  return profPoints(p) + expPoints(y) + certPoints(cert); // 0..22
};
const leaderboard = React.useMemo(() => {
  return employees.map(e => {
    const skills = skillMatrix[e.EmployeeId] || {};
    const entries = Object.values(skills); // [{prof,years,cert}, ...]
    if (entries.length === 0) return { employee: e, score: 0 };
    const total = entries.reduce((sum, s) => sum + skillScore(s.prof, s.years, s.cert), 0);
    const avg = Math.round(total / entries.length); // avg points
    return { employee: e, score: avg };
  }).sort((a, b) => b.score - a.score);
  // eslint-disable-next-line
}, [employees, skillMatrix]);
//---------------------------------------------
const API = 'http://localhost:5000';
useEffect(() => {
  const loadSkills = async () => {
    if (!employees || employees.length === 0) {
      setSkillMatrix({});
      return;
    }
    const entries = await Promise.all(
      employees.map(async (e) => {
        try {
          const res = await fetch(`${API}/api/user-skills/${e.EmployeeId}`);
          const data = await res.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(s => {
            map[s.skill_name] = {
              prof: Number(s.proficiency_percent || 0),
              years: Number(s.years_of_experience || 0),
              cert: s.certificate || ''
            };
          });
          return [e.EmployeeId, map];
        } catch (err) {
          console.error('load skills error for', e.EmployeeId, err);
          return [e.EmployeeId, {}];
        }
      })
    );
    const matrix = Object.fromEntries(entries);
    setSkillMatrix(matrix);
  };
  loadSkills();
}, [employees]);

  const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);

  const toggleRow = (employeeId) => {
    setExpandedEmployeeId((prev) => (prev === employeeId ? null : employeeId));
  };

   //-----------update password

  // Update Password modal state
  const [pwdForm, setPwdForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [pwdSubmitting, setPwdSubmitting] = useState(false);
  const [pwdMessage, setPwdMessage] = useState('');

  // Submit handler for Update Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPwdMessage('');

    if (!pwdForm.current_password || !pwdForm.new_password || !pwdForm.confirm_password) {
      setPwdMessage('Please fill all fields.');
      return;
    }
    if (pwdForm.new_password.length < 8) {
      setPwdMessage('New password must be at least 8 characters.');
      return;
    }
    if (pwdForm.new_password !== pwdForm.confirm_password) {
      setPwdMessage('New password and confirmation do not match.');
      return;
    }

    setPwdSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: user.EmployeeId,
          current_password: pwdForm.current_password,
          new_password: pwdForm.new_password,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Password update failed');
      }

      setPwdMessage('✅ Password updated. Redirecting you to login…');

      // Close modal after a moment, then force re-login with banner
      setTimeout(() => {
        // Close modal
        const modalEl = document.getElementById('updatePasswordModal');
        const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
        modalInstance?.hide();
        document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());

        // Log out and redirect to login with success banner
        localStorage.removeItem('loggedInUser');
        navigate('/', {
          state: {
            loginInfoMessage: '✅ Your password has been updated. Please login with your new password.',
          },
        });
      }, 1200);
    } catch (err) {
      console.error('Update password error:', err);
      setPwdMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setPwdSubmitting(false);
    }
  };




  // ----------------- Render -----------------
  return (
    <>
      {/* Sticky top Navbar (dark) */}
      <header className="navbar sticky-top bg-dark flex-md-nowrap p-0 shadow" data-bs-theme="dark">
        <a className="navbar-brand col-md-3 col-lg-2 me-0 px-3 fs-6 text-white" href="/">
          <img
            src={brand}
            alt="Brand"
            width="36"
            height="36"
            className="rounded-circle"
          />
          <span className="fw-semibold">Team Productivity</span>
        </a>
        <ul className="navbar-nav flex-row d-md-none ms-auto">
          {/* Toggle search */}
          <li className="nav-item text-nowrap">
            <button
              className="nav-link px-3 text-white btn btn-link"
              type="button"
              aria-label="Toggle search"
              onClick={() => setSearchOpen(o => !o)}
            >
              <i className="bi bi-search" aria-hidden="true"></i>
            </button>
          </li>
          {/* Toggle sidebar (Offcanvas) */}
          <li className="nav-item text-nowrap">
            <button
              className="nav-link px-3 text-white btn btn-link"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#sidebarMenu"
              aria-controls="sidebarMenu"
              aria-label="Toggle navigation"
            >
              <i className="bi bi-list" aria-hidden="true"></i>
            </button>
          </li>
        </ul>
        {/* Collapsible search (mobile) */}
        <div className={`navbar-search w-100 collapse ${searchOpen ? 'show' : ''}`}>
          <input
            className="form-control w-100 rounded-0 border-0"
            type="text"
            placeholder="Search"
            aria-label="Search"
          />
        </div>
      </header>
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar (md+) */}
          <div className="sidebar border border-end col-md-3 col-lg-2 p-0 bg-body-tertiary d-none d-md-block"
            style={{ position: 'sticky', top: '6vh', height: '94vh', borderRight: '1px solid var(--bs-border-color)' }}
          >
            <div className="d-md-flex flex-column p-0 pt-lg-3 overflow-y-auto" style={{ minHeight: '94vh' }}>
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2 active" style={{ textTransform: 'capitalize' }} aria-current="page" href="/manager-dashboard">
                    <i className="bi bi-house-fill" aria-hidden="true" ></i>
                    {user.role}  Dashboard
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2" href="#user">
                    <i className="bi bi-people" aria-hidden="true"></i>
                    Users
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2" href="#task">
                    <i className="bi bi-graph-up" aria-hidden="true"></i>
                    Reports / Tasks
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2" href="/LeaveManager">
                    <i className="bi bi-calendar3" aria-hidden="true"></i>
                    Leave Request
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2" href="/common-review">
                    <i className="bi bi-list-check" aria-hidden="true"></i>
                    Common Review
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2" href="/QuestionManager">
                    <i className="bi bi-puzzle" aria-hidden="true"></i>
                    Question Manager
                  </a>
                </li>
              </ul>
              <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-body-secondary text-uppercase">
                <span>Saved reports</span>
                <a className="link-secondary" href="#1" aria-label="Add a new report">
                  <i className="bi bi-plus-circle" aria-hidden="true"></i>
                </a>
              </h6>
              <ul className="nav flex-column mb-auto">
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2" href="#1">
                    <i className="bi bi-file-earmark-text" aria-hidden="true"></i>
                    Current month
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2" href="#1">
                    <i className="bi bi-file-earmark-text" aria-hidden="true"></i>
                    Last quarter
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2" href="#1">
                    <i className="bi bi-file-earmark-text" aria-hidden="true"></i>
                    Social engagement
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2" href="#1">
                    <i className="bi bi-file-earmark-text" aria-hidden="true"></i>
                    Year-end sale
                  </a>
                </li>
              </ul>
              <hr className="my-3" />
              <ul className="nav flex-column mb-auto">
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2" href="#1">
                    <i className="bi bi-gear-wide-connected" aria-hidden="true"></i>
                    Settings
                  </a>
                </li>
                <li className="nav-item">
                  <button className="nav-link d-flex align-items-center gap-2 btn btn-link text-start" onClick={handleLogout}>
                    <i className="bi bi-door-closed" aria-hidden="true"></i>
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          </div>
          {/* Mobile Offcanvas Sidebar */}
          <div
            className="offcanvas offcanvas-end bg-body-tertiary d-md-none"
            tabIndex="-1"
            id="sidebarMenu"
            aria-labelledby="sidebarMenuLabel"
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="sidebarMenuLabel">
                <img
                  src={brand}
                  alt="Brand"
                  width="36"
                  height="36"
                  className="rounded-circle"
                />
                <span className="fw-semibold">Team Productivity</span>
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
                data-bs-target="#sidebarMenu"
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body d-flex flex-column p-0 pt-lg-3 overflow-y-auto">
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2 active" aria-current="page" href="#dashboard">
                    <i className="bi bi-house-fill" aria-hidden="true"></i>
                    Dashboard
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2" href="#user">
                    <i className="bi bi-people" aria-hidden="true"></i>
                    Users
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2" href="#task">
                    <i className="bi bi-graph-up" aria-hidden="true"></i>
                    Reports / Tasks
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2" href="/LeaveManager">
                    <i className="bi bi-calendar3" aria-hidden="true"></i>
                    Leave Request
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2" href="/common-review">
                    <i className="bi bi-list-check" aria-hidden="true"></i>
                    Common Review
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2" href="/QuestionManager">
                    <i className="bi bi-puzzle" aria-hidden="true"></i>
                    Question Manager
                  </a>
                </li>
              </ul>
              <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-body-secondary text-uppercase">
                <span>Saved reports</span>
                <a className="link-secondary" href="#1" aria-label="Add a new report">
                  <i className="bi bi-plus-circle" aria-hidden="true"></i>
                </a>
              </h6>
              <ul className="nav flex-column mb-auto">
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2" href="#1">
                    <i className="bi bi-file-earmark-text" aria-hidden="true"></i>
                    Current month
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2" href="#1">
                    <i className="bi bi-file-earmark-text" aria-hidden="true"></i>
                    Last quarter
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2" href="#1">
                    <i className="bi bi-file-earmark-text" aria-hidden="true"></i>
                    Social engagement
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2" href="#1">
                    <i className="bi bi-file-earmark-text" aria-hidden="true"></i>
                    Year-end sale
                  </a>
                </li>
              </ul>
              <hr className="my-3" />
              <ul className="nav flex-column mb-auto">
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center gap-2" href="#1">
                    <i className="bi bi-gear-wide-connected" aria-hidden="true"></i>
                    Settings
                  </a>
                </li>
                <li className="nav-item">
                  <button className="nav-link d-flex align-items-center gap-2 btn btn-link text-start" onClick={handleLogout}>
                    <i className="bi bi-door-closed" aria-hidden="true"></i>
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          </div>





{/* Update Password Modal */}
<div className="modal fade" id="updatePasswordModal" tabIndex="-1" aria-hidden="true">
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
            <div className={`alert ${pwdMessage.startsWith('✅') ? 'alert-success' : 'alert-warning'}`} role="alert">
              {pwdMessage}
            </div>
          )}

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-secondary w-100" disabled={pwdSubmitting}>
              {pwdSubmitting ? 'Updating…' : 'Update Password'}
            </button>
            <button type="button" className="btn btn-light w-100" data-bs-dismiss="modal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>



          {/* Main content */}
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            {/* Header & filter */}
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h4 className="">
                <img
                  src={user.profile_picture_url || 'https://avatar.iran.liara.run/public'}
                  alt="Profile"
                  className="rounded-circle"
                  width="50"
                />
                Hi, {user?.firstname || 'Admin'}!
              </h4>
              <div className="btn-toolbar mb-2 mb-md-0">
                <div className="btn-group me-2">
                  <button type="button" className="btn btn-sm btn-outline-secondary">Share</button>
                  <button type="button" className="btn btn-sm btn-outline-secondary">Export</button>
                </div>
                <div class="dropdown">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-1"
                    id="filterToggle"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="true"
                    data-bs-boundary="viewport"
                    data-bs-container="body"
                    aria-expanded="false"
                    aria-controls="filterMenu"
                  >
                    <i class="bi bi-calendar3" aria-hidden="true"></i>
                    Dropdown
                  </button>
                  <ul
                    id="filterMenu"
                    class="dropdown-menu p-2"
                    aria-labelledby="filterToggle"
                  >
                    <li>
                      <button
                        type="button"
                        class="btn btn-outline-success m-2 dropdown-item"
                        data-bs-toggle="modal"
                        data-bs-target="#updateProfileModal"
                      > <i className="bi bi-pencil-square me-1"></i>
                        Update Profile
                      </button>
                    </li>
                    {/* <li><button class="btn btn-outline-success m-2">Today</button></li>*/}
                    <li>




<button
  type="button"
  className="btn btn-outline-secondary dropdown-item"
  data-bs-toggle="modal"
  data-bs-target="#updatePasswordModal"
>
  <i className="bi bi-key-fill me-1"></i> Update Password
</button>







                      </li>
                    <li>
                      <button type="button" className="btn btn-outline-info m-2 dropdown-item" onClick={ShowMembers}>
                        <i className="bi bi-people-fill me-1"></i>Team Member
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* update profile of manager */}
            <div
              className="modal fade"
              id="updateProfileModal"
              tabIndex="-1"
              aria-labelledby="updateProfileModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="updateProfileModalLabel">
                      Update Profile
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await UpdateMember();
                        // ✅ Close modal
                        const modalElement = document.getElementById('updateProfileModal');
                        const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
                        modalInstance.hide();
                        // ✅ Remove    // ✅ Remove leftover backdrop
                        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
                      }}
                    >
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label"> First Name</label>
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
                            type="text"
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
                            type="text"
                            name="post"
                            className="form-control"
                            value={userData.post || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Location</label>
                          <input
                            type="text"
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
                        <input
                          type="file"
                          className="form-control"
                          onChange={handleFileChange}
                        />
                      </div>
                      {/* ✅ Buttons Row */}
                      <div className="row-10 d-flex justify-content-between">
                        <button type="submit" className="col-md-5 btn btn-primary">
                          Save Changes
                        </button>
                        <button
                          type="button"
                          className="col-md-5 btn btn-secondary"
                          data-bs-dismiss="modal"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            {/* KPIs */}
            {/* <div className="row mt-4">
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">Total Employees</h5>
                    <p className="card-text">{employees.length}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">Total Employees</h5>
                    <p className="card-text">{employees.length}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">Active Members</h5>
                    <p className="card-text">{members.length}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">Project Completion</h5>
                    <p className="card-text">{completionPct}%</p>
                  </div>
                </div>
              </div>
            </div> */}
            <div className="row g-2 mt-3">
              {/* Total Employees */}
              <div className="col-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center py-2">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-pill bg-primary bg-opacity-10 text-primary mb-1"
                      style={{ width: 36, height: 36 }}
                    >
                      <i className="bi bi-people-fill fs-6"></i>
                    </div>
                    <div className="text-uppercase text-muted small">Total Employees</div>
                    <div className="fw-bold fs-5">{employees.length}</div>
                  </div>
                </div>
              </div>
              {/* Active Members */}
              <div className="col-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center py-2">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-pill bg-success bg-opacity-10 text-success mb-1"
                      style={{ width: 36, height: 36 }}
                    >
                      <i className="bi bi-calendar-event-fill fs-6"></i>
                    </div>
                    <div className="text-uppercase text-muted small">Leave Request</div>
                    <div className="fw-bold fs-5">{leave_request.pending_requests || 0}
                    </div>
                  </div>
                </div>
              </div>
              {/* You had a duplicate “Total Employees”—keeping a compact tile here */}
              <div className="col-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center py-2">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-pill bg-info bg-opacity-10 text-info mb-1"
                      style={{ width: 36, height: 36 }}
                    >
                      <i className="bi bi-clipboard-check fs-6"></i>
                    </div>
                    <div className="text-uppercase text-muted small">Total Task</div>
                    <div className="fw-bold fs-5">{tasks.length}</div>
                  </div>
                </div>
              </div>
              {/* Project Completion */}
              <div className="col-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center py-2">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-pill bg-warning bg-opacity-10 text-warning mb-1"
                      style={{ width: 36, height: 36 }}
                    >
                      <i className="bi bi-graph-up-arrow fs-6"></i>
                    </div>
                    <div className="text-uppercase text-muted small">Project Completion</div>
                    <div className="fw-bold fs-5">{completionPct}%</div>
                    <div className="progress mt-1" style={{ height: 4 }}>
                      <div
                        className="progress-bar bg-warning"
                        role="progressbar"
                        style={{ width: `${completionPct}%` }}
                        aria-valuenow={completionPct}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* {Modal for Members } */}
            <div className="modal fade" id="membersModal" tabIndex="-1" aria-hidden="true">
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Team Members of {user?.firstname} {user?.lastname}</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                  </div>
                  <div className="modal-body">
                    {members1.length === 0 ? (
                      <p className="text-muted">No members found.</p>
                    ) : (
                      <div className="text-center">
                        {/* Manager node */}
                        <div className="d-inline-flex align-items-center gap-2 p-2 border rounded bg-light">
                          <img
                            src={
                              manager[0]?.profile_picture
                                ? `http://localhost:5000/uploads/${encodeURIComponent(manager[0]?.profile_picture)}`
                                : 'https://avatar.iran.liara.run/public'
                            }
                            alt="Director"
                            className="rounded-circle"
                            width="40"
                            height="40"
                            style={{ objectFit: 'cover' }}
                          />
                          <div className="text-start">
                            <div className="fw-semibold">{manager[0]?.firstname} {manager[0]?.lastname}</div>
                            <div className="text-muted small">{manager[0]?.role} · {manager[0]?.post}</div>
                          </div>
                        </div>
                        {/* Connector */}
                        <div className="mx-auto my-2" style={{ width: 2, height: 16, background: '#dee2e6' }} />
                        <div className="d-inline-flex align-items-center gap-2 p-2 border rounded bg-light">
                          <img
                            src={
                              user.profile_picture_url || 'https://avatar.iran.liara.run/public'
                            }
                            alt="Manager"
                            className="rounded-circle"
                            width="40"
                            height="40"
                            style={{ objectFit: 'cover' }}
                          />
                          <div className="text-start">
                            <div className="fw-semibold">{user?.firstname} {user?.lastname}</div>
                            <div className="text-muted small">{user?.role} · {user?.post}</div>
                          </div>
                        </div>
                        <div className="mx-auto my-2" style={{ width: 2, height: 16, background: '#dee2e6' }} />
                        {/* Members grid */}
                        <div className="row g-3 justify-content-center">
                          {employees.map(m => (
                            <div key={m.EmployeeId} className="col-12 col-sm-6 col-md-4">
                              <div className="d-inline-flex align-items-center gap-2 p-2 border rounded bg-light">
                                <img
                                  src={
                                    m.profile_picture_url || 'https://avatar.iran.liara.run/public'
                                  }
                                  alt="Manager"
                                  className="rounded-circle"
                                  width="40"
                                  height="40"
                                  style={{ objectFit: 'cover' }}
                                />
                                <div className="text-start">
                                  <div className="fw-semibold">{m.firstname} {m.lastname}</div>
                                  <div className="text-muted small">{m.role} · {m.post}</div>
                                </div>
                              </div>
                              {/* Optional meta
                          {m.location && <div className="text-muted small">📍 {m.location}</div>}
                          {m.doj && <div className="text-muted small">🗓 Joined: {new Date(m.doj).toLocaleDateString()}</div>}
                          */}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="row d-flex justify-content-between mt-4">
              {/* <div id="dashboard" className="mt-5 col-md-7">
                <h4>Team Productivity</h4>
                <Line data={Data} options={options} />
              </div> */}
              <h5>Task Completion </h5>
              <div className="col-md-7">
                <Line data={lineData} options={lineOptions} />
              </div>
              <div className="col-md-4">
                {/* <h4>Task Status Overview</h4> */}
                <Pie data={pieData} options={pieOptions} />
              </div>
            </div>
            {/* Sales Line (demo) */}
            {/* <div id="dashboard" className="mt-5">
                        <h4>Team Productivity</h4>
                        <Bar data={Data}
                        />
                </div> */}
            {/* Team Productivity (Bar) */}
            <div id="dashboard" className="mt-5 ">
              <h5>Task Distribution</h5>
              <Bar data={chartData} />
            </div>
            {/* <canvas ref={productivityBarRef} aria-label="Team productivity bar chart"></canvas> */}
            {/* Employees table */}
            <div id="user" className="card shadow-sm p-3 mt-4">
              <div className="d-flex align-items-center mb-3">
                <img
                  src={user.profile_picture_url || 'https://avatar.iran.liara.run/public'}
                  alt="Profile"
                  className="rounded-circle me-3"
                  width="50"
                />
                <h5 className="mb-0">Employees Reporting to {user?.firstname} {user?.lastname}</h5>
              </div>
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>Active Users</span>
                <div className="btn-actions-pane-right">
                  <div className="btn-group btn-group-sm" role="group">
                    <a href="/add-member" className="btn btn-primary">
                      <i className="bi bi-plus-circle me-1"></i> Add Member
                    </a>
                  </div>
                </div>
              </div>
              <div className="table-responsive mt-3">
                <table className="table table-hover table-bordered">
                  <thead className="table-dark text-center">
                    <tr>
                      <th>Profile</th>
                      <th>Emp ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Location</th>
                      <th>Designation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.EmployeeId} onClick={() => handleRowClick(emp)} style={{ cursor: 'pointer' }}>
                        <td>
                          <img
                            src={emp.profile_picture_url || 'https://avatar.iran.liara.run/public'}
                            alt="Profile"
                            className="rounded-circle"
                            width="50"
                          />
                        </td>
                        <td>{emp.EmployeeId}</td>
                        <td>{emp.firstname} {emp.lastname}</td>
                        <td>{emp.email}</td>
                        <td>{emp.location}</td>
                        <td>{emp.post ?? emp.designation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Employee Modal (Bootstrap) */}
              <div className="modal fade" id="employeeModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Employee Details</h5>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      {selectedEmployee && (
                        <div className="text-center">
                          <img
                            src={selectedEmployee.profile_picture_url || 'https://avatar.iran.liara.run/public'}
                            alt="Profile"
                            className="rounded-circle mb-3"
                            width="60"
                          />
                          <p><strong>Email:</strong> {selectedEmployee.email}</p>
                          <p><strong>Location:</strong> {selectedEmployee.location}</p>
                          <p><strong>Designation:</strong> {selectedEmployee.designation ?? selectedEmployee.post}</p>
                          <p><strong>Role:</strong> {selectedEmployee.role}</p>
                          {selectedEmployee.doj && (
                            <p><strong>Date of Joining:</strong> {new Date(selectedEmployee.doj).toLocaleDateString()}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="modal-footer d-flex justify-content-between">
                      <button type="button" className="col-md-5 btn btn-danger" data-bs-dismiss="modal" onClick={() => handleMember(selectedEmployee.EmployeeId)}>Actions</button>
                      {/* <button type="button" className="col-md-5 btn btn-danger"  onClick={() => handleRemoveMember(selectedEmployee.EmployeeId)}>Remove Member</button> */}
                      <button type="button" className="col-md-5 btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Tasks */}
            <div id="task" className="card shadow-sm p-3 mt-4">
              <h5 className="mb-4">Task Assigned by {user?.firstname} {user?.lastname}</h5>
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>Task</span>
                <div className="btn-actions-pane-right">
                  <div className="btn-group btn-group-sm" role="group">
                    <button className="btn btn-primary me-2" onClick={handleAddTaskClick}>
                      <i className="bi bi-plus-circle me-1"></i> Add Task
                    </button>
                  </div>
                </div>
              </div>
              {tasks.length === 0 ? (
                <p className="mt-3">No tasks assigned yet.</p>
              ) : (
                <div className="table-responsive mt-3">
                  <table className="table table-bordered">
                    <thead className="table-dark text-center">
                      <tr>
                        <th>Title</th>
                        <th>Assigned To</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map(task => (
                        <tr key={task.task_id}>
                          <td>{task.title}</td>
                          <td>{task.assigned_to}</td>
                          <td>{task.status ?? 'Pending'}</td>
                          <td>
                            <span
                              className={`badge ${task.priority === 'High'
                                ? 'bg-danger'
                                : task.priority === 'Medium'
                                  ? 'bg-warning'
                                  : 'bg-success'
                                }`}
                            >
                              {task.priority ?? 'Medium'}
                            </span>
                          </td>
                          <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-info me-2"
                              onClick={() => handleEditTaskClick(task)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteTask(task.task_id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Add/Edit Task Modal (controlled) */}
              {showTaskModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">{isEditing ? 'Edit Task' : 'Assign New Task'}</h5>
                        <button className="btn-close" onClick={() => setShowTaskModal(false)}></button>
                      </div>
                      <div className="modal-body">
                        <form onSubmit={handleSubmitTask}>
                          <div className="mb-3">
                            <label className="form-label">Task Title</label>
                            <input
                              type="text"
                              name="title"
                              value={taskData.title}
                              onChange={handleTaskChange}
                              className="form-control"
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea
                              name="description"
                              value={taskData.description}
                              onChange={handleTaskChange}
                              className="form-control"
                              rows="3"
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Assign To</label>
                            <select
                              name="assigned_to"
                              value={taskData.assigned_to}
                              onChange={handleTaskChange}
                              className="form-select"
                              required
                            >
                              <option value="">Select Member</option>
                              {members.map(member => (
                                <option key={member.EmployeeId} value={member.EmployeeId}>
                                  {member.firstname} {member.lastname} ({member.post})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Start Date</label>
                              <input
                                type="date"
                                name="start_date"
                                value={taskData.start_date}
                                onChange={handleTaskChange}
                                className="form-control"
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Due Date</label>
                              <input
                                type="date"
                                name="due_date"
                                value={taskData.due_date}
                                onChange={handleTaskChange}
                                className="form-control"
                              />
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Priority</label>
                            <select
                              name="priority"
                              value={taskData.priority}
                              onChange={handleTaskChange}
                              className="form-select"
                            >
                              <option>Low</option>
                              <option>Medium</option>
                              <option>High</option>
                            </select>
                          </div>
                          <button type="submit" className="btn btn-primary w-100">
                            {isEditing ? 'Update Task' : 'Assign Task'}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>









    <div className="card shadow-sm p-3 mt-4">
      <div className="card-header bg-dark text-white">
        <i className="bi bi-trophy me-2" />
        Top Performers (Skills)
      </div>

      <div className="table-responsive">
        <table className="table table-sm table-hover align-middle bg-white mb-0">
          <thead className="table-light">
            <tr>
              <th>Rank</th>
              <th>Employee</th>
              <th>Composite Score</th>
              <th>Skills</th>
              <th>Details</th>
            </tr>
          </thead>

          <tbody>
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-muted small text-center py-3">
                  No skills found for your team.
                </td>
              </tr>
            ) : (
              leaderboard.map(({ employee, score }, idx) => {
                const skills = skillMatrix[employee.EmployeeId] || {};
                const skillEntries = Object.entries(skills);

                const quickChips = skillEntries
                  .sort((a, b) => b[1].prof - a[1].prof)
                  .slice(0, 4)
                  .map(([name, s]) => (
                    <span key={name} className="badge rounded-pill text-bg-light me-1 mb-1">
                      {name} <span className="fw-semibold">{s.prof}%</span>
                      {s.cert && (
                        <i className="bi bi-award ms-1 text-primary" title="Certified" />
                      )}
                    </span>
                  ));

                const isExpanded = expandedEmployeeId === employee.EmployeeId;

                return (
                  <React.Fragment key={employee.EmployeeId}>
                    {/* main row */}
                    <tr>
                      <td>
                        <span className="badge bg-secondary">{idx + 1}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={employee.profile_picture_url || "https://avatar.iran.liara.run/public"}
                            alt="Profile"
                            className="rounded-circle"
                            width="32"
                            height="32"
                            style={{ objectFit: "cover" }}
                          />
                          <div>
                            <div className="fw-semibold">
                              {employee.firstname} {employee.lastname}
                            </div>
                            <div className="text-muted small">
                              {employee.post || employee.designation || "—"} · {employee.location || "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="fw-bold">{score}</td>
                      <td>
                        {quickChips.length > 0 ? (
                          quickChips
                        ) : (
                          <span className="text-muted small">No skills</span>
                        )}
                      </td>
                      <td>
                        {skillEntries.length > 0 ? (
                          <button
                            type="button"
                            className={`btn btn-sm ${isExpanded ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => toggleRow(employee.EmployeeId)}
                            aria-expanded={isExpanded}
                            aria-controls={`skills-panel-${employee.EmployeeId}`}
                          >
                            <i className="bi bi-list-check me-1" />
                            {isExpanded ? "Hide" : "View All"}
                          </button>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                    </tr>

                    {/* inline details panel (single row, below the main row) */}
                    {isExpanded && (
                      <tr id={`skills-panel-${employee.EmployeeId}`}>
                        <td colSpan={5}>
                          <div className="p-2 border rounded bg-light">
                            <div className="table-responsive">
                              <table className="table table-sm table-bordered align-middle mb-0">
                                <thead className="table-light">
                                  <tr>
                                    <th style={{ width: "30%" }}>Skill</th>
                                    <th style={{ width: "12%" }}>Proficiency</th>
                                    <th style={{ width: "28%" }}>Progress</th>
                                    <th style={{ width: "12%" }}>Years</th>
                                    <th style={{ width: "18%" }}>Certificate</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {skillEntries
                                    .sort((a, b) => b[1].prof - a[1].prof)
                                    .map(([name, s]) => (
                                      <tr key={`${employee.EmployeeId}-${name}`}>
                                        <td className="fw-semibold">{name}</td>
                                        <td className="fw-bold">{s.prof}%</td>
                                        <td>
                                          <div className="progress" style={{ height: 6 }}>
                                            <div
                                              className={`progress-bar ${
                                                s.prof >= 80
                                                  ? "bg-success"
                                                  : s.prof >= 50
                                                  ? "bg-warning"
                                                  : "bg-danger"
                                              }`}
                                              style={{ width: `${s.prof}%` }}
                                              aria-valuenow={s.prof}
                                              aria-valuemin={0}
                                              aria-valuemax={100}
                                            />
                                          </div>
                                        </td>
                                        <td>
                                          <span className="badge rounded-pill text-bg-light">
                                            {(s.years ?? 0)} years
                                          </span>
                                        </td>
                                        <td>
                                          {s.cert ? (
                                            <a
                                              href={s.cert}
                                              className="btn btn-sm btn-outline-primary"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              <i className="bi bi-award me-1" />
                                              View
                                            </a>
                                          ) : (
                                            <span className="text-muted small">—</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>













          </main>
        </div>
      </div>
      {/* Theme toggle: fixed bottom-right */}
      <div className="dropdown position-fixed bottom-0 end-0 mb-3 me-3" style={{ zIndex: 1500 }}>
        <button
          className="btn btn-primary py-2 dropdown-toggle d-flex align-items-center"
          id="bd-theme"
          type="button"
          aria-expanded="false"
          data-bs-toggle="dropdown"
          aria-label="Toggle theme (auto)"
        >
          <i className="bi bi-circle-half mb-2 me-2" aria-hidden="true"></i>
          <span className="visually-hidden" id="bd-theme-text">Toggle theme</span>
        </button>
        <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="bd-theme-text">
          <li>
            <button
              type="button"
              className="dropdown-item d-flex align-items-center"
              onClick={() => setTheme('light')}
              aria-pressed={resolvedTheme === 'light'}
            >
              <i className="bi bi-sun-fill me-2 opacity-50" aria-hidden="true"></i>
              Light
              {resolvedTheme === 'light' && <i className="bi bi-check2 ms-auto" aria-hidden="true"></i>}
            </button>
          </li>
          <li>
            <button
              type="button"
              className="dropdown-item d-flex align-items-center"
              onClick={() => setTheme('dark')}
              aria-pressed={resolvedTheme === 'dark'}
            >
              <i className="bi bi-moon-stars-fill me-2 opacity-50" aria-hidden="true"></i>
              Dark
              {resolvedTheme === 'dark' && <i className="bi bi-check2 ms-auto" aria-hidden="true"></i>}
            </button>
          </li>
          <li>
            <button
              type="button"
              className="dropdown-item d-flex align-items-center"
              onClick={() => setTheme('auto')}
              aria-pressed={theme === 'auto'}
            >
              <i className="bi bi-circle-half me-2 opacity-50" aria-hidden="true"></i>
              Auto
              {theme === 'auto' && <i className="bi bi-check2 ms-auto" aria-hidden="true"></i>}
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}
export default Dashboard;
